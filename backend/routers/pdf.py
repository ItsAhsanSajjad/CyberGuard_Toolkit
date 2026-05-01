"""
PDF Decryptor — Dictionary-based password cracking
- Uses pikepdf to attempt each password from a wordlist
- Returns the found password or failure stats

Security notes:
- The brute-force loop is CPU-bound and runs in a worker thread so the
  async event loop is not blocked for other users.
- The number of password attempts is capped (MAX_ATTEMPTS) so a malicious
  wordlist cannot tie up the server indefinitely.
"""

import asyncio
import io
import logging
import time

import pikepdf
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter()
log = logging.getLogger(__name__)

MAX_PDF_SIZE = 30 * 1024 * 1024       # 30 MB
MAX_WORDLIST_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_ATTEMPTS = 100_000                # bounded brute-force


class DecryptResponse(BaseModel):
    found: bool
    password: str | None = None
    attempts: int
    total_passwords: int
    elapsed_seconds: float
    truncated: bool = False  # True if wordlist was longer than MAX_ATTEMPTS


def _try_passwords(pdf_bytes: bytes, passwords: list[str]) -> tuple[bool, str | None, int]:
    """Run the brute-force loop. Returns (found, password, attempts)."""
    for i, pwd in enumerate(passwords, start=1):
        try:
            with pikepdf.open(io.BytesIO(pdf_bytes), password=pwd):
                return True, pwd, i
        except pikepdf.PasswordError:
            continue
        except Exception as e:
            # Malformed PDF or unexpected error — stop early
            log.info("pikepdf error on attempt %d: %s", i, e)
            continue
    return False, None, len(passwords)


@router.post("/decrypt", response_model=DecryptResponse)
async def decrypt_pdf(
    pdf_file: UploadFile = File(...),
    wordlist: UploadFile = File(...),
):
    # Validate file types
    if not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "First file must be a PDF")

    pdf_content = await pdf_file.read()
    if len(pdf_content) > MAX_PDF_SIZE:
        raise HTTPException(413, "PDF file too large (max 30 MB)")

    wl_content = await wordlist.read()
    if len(wl_content) > MAX_WORDLIST_SIZE:
        raise HTTPException(413, "Wordlist file too large (max 10 MB)")

    # Parse passwords
    try:
        passwords = wl_content.decode("utf-8", errors="ignore").splitlines()
        passwords = [p.strip() for p in passwords if p.strip()]
    except Exception:
        raise HTTPException(400, "Could not parse wordlist file")

    if not passwords:
        raise HTTPException(400, "Wordlist is empty")

    # Cap attempts so a pathological wordlist cannot tie up the server.
    truncated = len(passwords) > MAX_ATTEMPTS
    if truncated:
        passwords = passwords[:MAX_ATTEMPTS]

    # First confirm the PDF is actually encrypted.
    try:
        with pikepdf.open(io.BytesIO(pdf_content)):
            # Opened without a password — PDF is not encrypted.
            raise HTTPException(400, "This PDF is not password-protected")
    except pikepdf.PasswordError:
        pass  # expected — PDF is encrypted
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Could not read PDF: {e}")

    # Run the brute-force loop in a worker thread — pikepdf.open is CPU-bound
    # and blocks. Without this, every other API request would stall.
    start = time.time()
    found, password, attempts = await asyncio.to_thread(
        _try_passwords, pdf_content, passwords
    )
    elapsed = round(time.time() - start, 2)

    return DecryptResponse(
        found=found,
        password=password,
        attempts=attempts,
        total_passwords=len(passwords),
        elapsed_seconds=elapsed,
        truncated=truncated,
    )
