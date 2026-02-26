"""
PDF Decryptor — Dictionary-based password cracking
- Uses pikepdf to attempt each password from a wordlist
- Returns the found password or failure stats
"""

import time

import pikepdf
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

router = APIRouter()

MAX_PDF_SIZE = 30 * 1024 * 1024     # 30 MB
MAX_WORDLIST_SIZE = 10 * 1024 * 1024  # 10 MB


class DecryptResponse(BaseModel):
    found: bool
    password: str | None = None
    attempts: int
    total_passwords: int
    elapsed_seconds: float


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

    # First check if the PDF is actually encrypted
    try:
        pikepdf.open(pdf_content)
        # If this succeeds, the PDF is NOT encrypted
        raise HTTPException(400, "This PDF is not password-protected")
    except pikepdf.PasswordError:
        pass  # Good — the PDF IS encrypted
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Could not read PDF: {str(e)}")

    # Try each password
    start = time.time()
    for i, pwd in enumerate(passwords):
        try:
            pikepdf.open(pdf_content, password=pwd)
            # Success!
            return DecryptResponse(
                found=True,
                password=pwd,
                attempts=i + 1,
                total_passwords=len(passwords),
                elapsed_seconds=round(time.time() - start, 2),
            )
        except pikepdf.PasswordError:
            continue
        except Exception:
            continue

    return DecryptResponse(
        found=False,
        password=None,
        attempts=len(passwords),
        total_passwords=len(passwords),
        elapsed_seconds=round(time.time() - start, 2),
    )
