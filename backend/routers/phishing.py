"""
Phishing Link Scanner — Multi-layered URL analysis
- HTTPS check, suspicious keywords, URL length, IP address, @ trick, subdomain depth
- Domain age via WHOIS
- Page title fetch via httpx + BeautifulSoup

Security notes:
- All outbound requests pass through an SSRF guard that resolves the
  hostname and rejects private/loopback/link-local addresses. This stops
  attackers from using the scanner as a proxy to reach internal services
  (e.g. cloud metadata endpoints, localhost services).
- Blocking I/O (WHOIS) is run in a thread so the async event loop stays
  responsive for other requests.
"""

import asyncio
import ipaddress
import logging
import re
import socket
import ssl
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
import whois as python_whois
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
log = logging.getLogger(__name__)


# ── Schemas ───────────────────────────────────────────────────────────
class ScanRequest(BaseModel):
    url: str


class CheckResult(BaseModel):
    label: str
    status: str  # safe | warning | danger
    detail: str


class ScanResponse(BaseModel):
    url: str
    score: int
    level: str  # safe | warning | danger
    label: str
    page_title: str | None = None
    domain_age_days: int | None = None
    checks: list[CheckResult]


# ── Heuristics ────────────────────────────────────────────────────────
SUSPICIOUS_KEYWORDS = [
    # generic credential-harvesting words
    "login", "verify", "secure", "account", "update", "confirm",
    "signin", "banking", "password", "credential", "wallet", "paypal",
    "authenticate", "suspend", "expire",
    # brand / gov-service impersonation (common phishing lures)
    "echallan", "challan", "nadra", "fbr", "psca", "punjabpolice",
    "passport", "hbl", "ubl", "mcb", "meezan", "alfalah", "askari",
    "jazzcash", "easypaisa", "sadapay", "nayapay",
    "amazon", "microsoft", "apple", "google", "facebook", "instagram",
    "netflix", "whatsapp",
]

# Cheap / abused TLDs heavily used by phishing and scam infrastructure.
# Sources: APWG, Spamhaus, Interisle Consulting periodic reports.
SUSPICIOUS_TLDS = {
    "cfd", "tk", "ml", "ga", "gq", "xyz", "top", "click", "country",
    "work", "support", "loan", "review", "win", "racing", "stream",
    "men", "download", "trade", "party", "zip", "mov", "buzz", "rest",
    "icu", "fit", "shop", "online", "site", "info", "live", "monster",
}

SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
    "buff.ly", "ow.ly", "rb.gy", "cutt.ly",
]

DANGEROUS_EXTENSIONS = [".exe", ".scr", ".bat", ".cmd", ".com", ".vbs", ".msi", ".ps1"]


# ── Helpers ───────────────────────────────────────────────────────────
def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def _is_public_hostname(hostname: str) -> bool:
    """SSRF guard: only allow public, routable IP addresses.

    Rejects loopback (127.0.0.0/8), private ranges (10/8, 172.16/12, 192.168/16),
    link-local (169.254/16, includes cloud metadata endpoint), and reserved blocks.
    """
    if not hostname:
        return False
    try:
        ip_str = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_str)
    except (socket.gaierror, ValueError):
        return False
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def _analyze(url: str, parsed, ssl_info: dict | None = None) -> dict:
    score = 100
    checks: list[dict] = []
    normalized = _normalize_url(url)
    hostname = (parsed.hostname or "") if parsed else ""
    path = (parsed.path or "") if parsed else ""

    # 1. SSL Certificate — real TLS handshake (if available) else scheme check
    if not normalized.startswith("https://"):
        checks.append({"label": "SSL Certificate", "status": "danger", "detail": "No HTTPS — connection is NOT encrypted"})
        score -= 30
    elif ssl_info is None:
        checks.append({"label": "SSL Certificate", "status": "warning", "detail": "Could not verify certificate (host unreachable)"})
        score -= 10
    elif not ssl_info.get("valid"):
        checks.append({"label": "SSL Certificate", "status": "danger", "detail": ssl_info.get("error", "Certificate invalid")})
        score -= 35
    else:
        days = ssl_info.get("days_left", 0)
        issuer = ssl_info.get("issuer", "")
        if days < 0:
            checks.append({"label": "SSL Certificate", "status": "danger", "detail": f"Certificate expired {-days} days ago"})
            score -= 35
        elif days < 14:
            checks.append({"label": "SSL Certificate", "status": "warning", "detail": f"Certificate expires in {days} days — issuer {issuer}"})
            score -= 10
        else:
            checks.append({"label": "SSL Certificate", "status": "safe", "detail": f"Valid certificate, expires in {days} days — issuer {issuer}"})

    # 2. URL shortener check
    if any(s in hostname for s in SHORTENERS):
        checks.append({"label": "URL Shortener", "status": "warning", "detail": "Uses shortener service — hides real destination"})
        score -= 15
    else:
        checks.append({"label": "URL Shortener", "status": "safe", "detail": "No URL shortener detected"})

    # 3. Suspicious keywords
    found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url.lower()]
    if found:
        checks.append({"label": "Suspicious Keywords", "status": "warning", "detail": f"Found: {', '.join(found)}"})
        score -= min(len(found) * 8, 30)
    else:
        checks.append({"label": "Suspicious Keywords", "status": "safe", "detail": "No suspicious keywords"})

    # 4. URL length
    if len(url) > 120:
        checks.append({"label": "URL Length", "status": "warning", "detail": f"Unusually long ({len(url)} chars)"})
        score -= 10
    else:
        checks.append({"label": "URL Length", "status": "safe", "detail": f"Normal length ({len(url)} chars)"})

    # 5. IP address instead of domain
    if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", hostname):
        checks.append({"label": "IP Address", "status": "danger", "detail": "Uses IP address instead of domain name"})
        score -= 25
    else:
        checks.append({"label": "Domain Format", "status": "safe", "detail": "Proper domain name"})

    # 6. @ sign redirect trick
    if "@" in url:
        checks.append({"label": "Redirect Trick", "status": "danger", "detail": "Contains @ sign — possible redirect attack"})
        score -= 20

    # 7. Subdomain depth
    if hostname:
        parts = hostname.split(".")
        subdomains = len(parts) - 2  # exclude domain + TLD
        if subdomains > 2:
            checks.append({"label": "Subdomain Depth", "status": "warning", "detail": f"{subdomains} subdomains — unusual"})
            score -= 10

    # 8. Dangerous file extension
    if any(path.lower().endswith(ext) for ext in DANGEROUS_EXTENSIONS):
        checks.append({"label": "File Extension", "status": "danger", "detail": "Points to potentially dangerous file download"})
        score -= 25

    # 9. Hyphen count in domain (typosquatting indicator)
    if hostname.count("-") >= 3:
        checks.append({"label": "Typosquatting", "status": "warning", "detail": "Many hyphens in domain — possible typosquatting"})
        score -= 10

    # 10. Suspicious / abused TLD
    tld = hostname.rsplit(".", 1)[-1].lower() if hostname else ""
    if tld in SUSPICIOUS_TLDS:
        checks.append({"label": "Suspicious TLD", "status": "danger", "detail": f".{tld} is heavily abused by phishing and scam sites"})
        score -= 30
    elif hostname:
        checks.append({"label": "TLD Reputation", "status": "safe", "detail": f".{tld} is a common top-level domain"})

    score = max(0, min(100, score))
    return {"score": score, "checks": checks}


async def _fetch_page_title(url: str, hostname: str) -> str | None:
    if not _is_public_hostname(hostname):
        return None
    try:
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                if soup.title and soup.title.string:
                    return soup.title.string.strip()
    except Exception as e:
        log.info("page-title fetch failed for %s: %s", hostname, e)
    return None


def _check_ssl(hostname: str, port: int = 443) -> dict:
    """Real TLS handshake. Verifies chain, hostname match, and expiry.

    Returns dict: {valid: bool, error?: str, days_left?: int, issuer?: str}.
    """
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
        not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
        days_left = (not_after - datetime.utcnow()).days
        issuer = dict(x[0] for x in cert.get("issuer", ())).get("organizationName", "Unknown CA")
        return {"valid": True, "days_left": days_left, "issuer": issuer}
    except ssl.SSLCertVerificationError as e:
        reason = getattr(e, "reason", None) or str(e)
        return {"valid": False, "error": f"Certificate invalid: {reason}"}
    except ssl.SSLError as e:
        return {"valid": False, "error": f"TLS handshake failed: {e}"}
    except (socket.timeout, socket.gaierror, ConnectionError, OSError) as e:
        return {"valid": False, "error": f"Could not connect over TLS: {e}"}
    except Exception as e:
        log.info("SSL check failed for %s: %s", hostname, e)
        return {"valid": False, "error": "TLS check failed"}


def _whois_lookup(hostname: str) -> int | None:
    """Blocking WHOIS lookup — call from a thread, never directly in async code."""
    try:
        w = python_whois.whois(hostname)
        created = w.creation_date
        if isinstance(created, list):
            created = created[0]
        if created:
            delta = datetime.now(timezone.utc) - created.replace(tzinfo=timezone.utc)
            return delta.days
    except Exception as e:
        log.info("WHOIS lookup failed for %s: %s", hostname, e)
    return None


async def _get_domain_age(hostname: str) -> int | None:
    if not hostname:
        return None
    # WHOIS uses synchronous sockets — run in a thread so it doesn't block
    # the FastAPI event loop while it waits on network I/O.
    return await asyncio.to_thread(_whois_lookup, hostname)


# ── Endpoint ──────────────────────────────────────────────────────────
@router.post("/scan", response_model=ScanResponse)
async def scan_url(req: ScanRequest):
    if not req.url.strip():
        raise HTTPException(400, "URL cannot be empty")

    normalized = _normalize_url(req.url)
    try:
        parsed = urlparse(normalized)
    except Exception:
        parsed = None
    hostname = (parsed.hostname or "") if parsed else ""

    # Real TLS handshake (only for https URLs on resolvable public hosts).
    # Run in a thread because socket+ssl are blocking.
    ssl_info = None
    if normalized.startswith("https://") and hostname and _is_public_hostname(hostname):
        ssl_info = await asyncio.to_thread(_check_ssl, hostname)

    result = _analyze(req.url, parsed, ssl_info)
    score = result["score"]
    checks = result["checks"]

    # Domain age check — newer thresholds (most phishing domains < 6 months)
    domain_age = await _get_domain_age(hostname)
    if domain_age is not None:
        if domain_age < 90:
            checks.append({"label": "Domain Age", "status": "danger", "detail": f"Registered {domain_age} days ago — very new"})
            score -= 25
        elif domain_age < 365:
            checks.append({"label": "Domain Age", "status": "warning", "detail": f"Registered {domain_age} days ago — relatively new"})
            score -= 15
        else:
            checks.append({"label": "Domain Age", "status": "safe", "detail": f"Registered {domain_age} days ago — established"})

    score = max(0, min(100, score))

    # Page title (SSRF-guarded)
    page_title = await _fetch_page_title(normalized, hostname)

    # Threat level
    if score < 40:
        level, label = "danger", "Dangerous"
    elif score < 70:
        level, label = "warning", "Suspicious"
    else:
        level, label = "safe", "Safe"

    return ScanResponse(
        url=req.url,
        score=score,
        level=level,
        label=label,
        page_title=page_title,
        domain_age_days=domain_age,
        checks=[CheckResult(**c) for c in checks],
    )
