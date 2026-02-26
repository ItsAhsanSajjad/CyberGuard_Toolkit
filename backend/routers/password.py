"""
Password Generator & Strength Analyzer
- CSPRNG via secrets module
- Real entropy calculation
- HaveIBeenPwned k-anonymity breach check
"""

import math
import secrets
import string
import hashlib

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    length: int = Field(16, ge=4, le=128)
    uppercase: bool = True
    numbers: bool = True
    symbols: bool = True


class StrengthRequest(BaseModel):
    password: str


class GenerateResponse(BaseModel):
    password: str
    entropy_bits: float
    strength: str
    strength_score: int


class StrengthResponse(BaseModel):
    entropy_bits: float
    strength: str
    strength_score: int
    breached: bool
    breach_count: int


# ── Helpers ───────────────────────────────────────────────────────────
def _charset_size(pwd: str) -> int:
    size = 0
    if any(c in string.ascii_lowercase for c in pwd):
        size += 26
    if any(c in string.ascii_uppercase for c in pwd):
        size += 26
    if any(c in string.digits for c in pwd):
        size += 10
    if any(c in string.punctuation for c in pwd):
        size += 32
    return max(size, 1)


def _entropy(pwd: str) -> float:
    return len(pwd) * math.log2(_charset_size(pwd))


def _strength(entropy: float) -> tuple[str, int]:
    if entropy >= 80:
        return "very-strong", 5
    if entropy >= 60:
        return "strong", 4
    if entropy >= 40:
        return "good", 3
    if entropy >= 28:
        return "fair", 2
    return "weak", 1


async def _check_breach(pwd: str) -> tuple[bool, int]:
    """HaveIBeenPwned k-anonymity SHA-1 check."""
    sha1 = hashlib.sha1(pwd.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"https://api.pwnedpasswords.com/range/{prefix}"
            )
            if resp.status_code == 200:
                for line in resp.text.splitlines():
                    hash_suffix, count = line.split(":")
                    if hash_suffix == suffix:
                        return True, int(count)
    except Exception:
        pass  # Network error — assume not breached
    return False, 0


# ── Endpoints ─────────────────────────────────────────────────────────
@router.post("/generate", response_model=GenerateResponse)
async def generate_password(req: GenerateRequest):
    chars = string.ascii_lowercase
    if req.uppercase:
        chars += string.ascii_uppercase
    if req.numbers:
        chars += string.digits
    if req.symbols:
        chars += string.punctuation

    pwd = "".join(secrets.choice(chars) for _ in range(req.length))
    ent = _entropy(pwd)
    label, score = _strength(ent)

    return GenerateResponse(
        password=pwd,
        entropy_bits=round(ent, 1),
        strength=label,
        strength_score=score,
    )


@router.post("/check-strength", response_model=StrengthResponse)
async def check_strength(req: StrengthRequest):
    ent = _entropy(req.password)
    label, score = _strength(ent)
    breached, count = await _check_breach(req.password)

    return StrengthResponse(
        entropy_bits=round(ent, 1),
        strength=label,
        strength_score=score,
        breached=breached,
        breach_count=count,
    )
