"""
Phishing Link Scanner — Multi-layered URL analysis
- HTTPS check, suspicious keywords, URL length, IP address, @ trick, subdomain depth
- Domain age via WHOIS
- Page title fetch via httpx + BeautifulSoup
"""

import re
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Try importing whois — it's optional
try:
    import whois as python_whois

    HAS_WHOIS = True
except ImportError:
    HAS_WHOIS = False


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


# ── Analysis ──────────────────────────────────────────────────────────
SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "confirm",
    "signin", "banking", "password", "credential", "wallet", "paypal",
    "authenticate", "suspend", "expire",
]

SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
    "buff.ly", "ow.ly", "rb.gy", "cutt.ly",
]

DANGEROUS_EXTENSIONS = [".exe", ".scr", ".bat", ".cmd", ".com", ".vbs", ".msi", ".ps1"]


def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def _analyze(url: str) -> dict:
    score = 100
    checks: list[dict] = []
    normalized = _normalize_url(url)

    # 1. HTTPS check
    if normalized.startswith("https://"):
        checks.append({"label": "SSL Certificate", "status": "safe", "detail": "HTTPS connection detected — encrypted"})
    else:
        checks.append({"label": "SSL Certificate", "status": "danger", "detail": "No HTTPS — connection is NOT encrypted"})
        score -= 25

    # 2. Parse hostname
    try:
        parsed = urlparse(normalized)
        hostname = parsed.hostname or ""
    except Exception:
        hostname = ""

    # 3. URL shortener check
    if any(s in hostname for s in SHORTENERS):
        checks.append({"label": "URL Shortener", "status": "warning", "detail": f"Uses shortener service — hides real destination"})
        score -= 15
    else:
        checks.append({"label": "URL Shortener", "status": "safe", "detail": "No URL shortener detected"})

    # 4. Suspicious keywords
    found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url.lower()]
    if found:
        checks.append({"label": "Suspicious Keywords", "status": "warning", "detail": f"Found: {', '.join(found)}"})
        score -= min(len(found) * 8, 30)
    else:
        checks.append({"label": "Suspicious Keywords", "status": "safe", "detail": "No suspicious keywords"})

    # 5. URL Length
    if len(url) > 120:
        checks.append({"label": "URL Length", "status": "warning", "detail": f"Unusually long ({len(url)} chars)"})
        score -= 10
    else:
        checks.append({"label": "URL Length", "status": "safe", "detail": f"Normal length ({len(url)} chars)"})

    # 6. IP address instead of domain
    if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", hostname):
        checks.append({"label": "IP Address", "status": "danger", "detail": "Uses IP address instead of domain name"})
        score -= 25
    else:
        checks.append({"label": "Domain Format", "status": "safe", "detail": "Proper domain name"})

    # 7. @ sign redirect trick
    if "@" in url:
        checks.append({"label": "Redirect Trick", "status": "danger", "detail": "Contains @ sign — possible redirect attack"})
        score -= 20

    # 8. Subdomain depth
    if hostname:
        parts = hostname.split(".")
        subdomains = len(parts) - 2  # exclude domain + TLD
        if subdomains > 2:
            checks.append({"label": "Subdomain Depth", "status": "warning", "detail": f"{subdomains} subdomains — unusual"})
            score -= 10

    # 9. Dangerous extension
    path = parsed.path if 'parsed' in dir() else ""
    if any(path.lower().endswith(ext) for ext in DANGEROUS_EXTENSIONS):
        checks.append({"label": "File Extension", "status": "danger", "detail": "Points to potentially dangerous file download"})
        score -= 25

    # 10. Hyphen count in domain (typosquatting indicator)
    if hostname.count("-") >= 3:
        checks.append({"label": "Typosquatting", "status": "warning", "detail": f"Many hyphens in domain — possible typosquatting"})
        score -= 10

    score = max(0, min(100, score))
    return {"score": score, "checks": checks}


async def _fetch_page_title(url: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=5, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                if soup.title and soup.title.string:
                    return soup.title.string.strip()
    except Exception:
        pass
    return None


def _get_domain_age(hostname: str) -> int | None:
    if not HAS_WHOIS:
        return None
    try:
        w = python_whois.whois(hostname)
        created = w.creation_date
        if isinstance(created, list):
            created = created[0]
        if created:
            delta = datetime.now(timezone.utc) - created.replace(tzinfo=timezone.utc)
            return delta.days
    except Exception:
        pass
    return None


# ── Endpoint ──────────────────────────────────────────────────────────
@router.post("/scan", response_model=ScanResponse)
async def scan_url(req: ScanRequest):
    if not req.url.strip():
        raise HTTPException(400, "URL cannot be empty")

    normalized = _normalize_url(req.url)
    result = _analyze(req.url)
    score = result["score"]
    checks = result["checks"]

    # Domain age check
    try:
        hostname = urlparse(normalized).hostname or ""
    except Exception:
        hostname = ""

    domain_age = _get_domain_age(hostname)
    if domain_age is not None:
        if domain_age < 30:
            checks.append({"label": "Domain Age", "status": "danger", "detail": f"Registered {domain_age} days ago — very new"})
            score -= 20
        elif domain_age < 180:
            checks.append({"label": "Domain Age", "status": "warning", "detail": f"Registered {domain_age} days ago — relatively new"})
            score -= 10
        else:
            checks.append({"label": "Domain Age", "status": "safe", "detail": f"Registered {domain_age} days ago — established"})

    score = max(0, min(100, score))

    # Page title
    page_title = await _fetch_page_title(normalized)

    # Level
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
