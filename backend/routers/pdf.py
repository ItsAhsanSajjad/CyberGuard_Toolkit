"""
PDF Lock & Unlock — password-protect PDFs and decrypt locked PDFs.

Uses pypdf (pure-Python) so the backend runs without native extension
libraries. Encryption follows the PDF specification (AES-256 where the
input PDF supports it).
"""

import io
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError

router = APIRouter()
log = logging.getLogger(__name__)

MAX_PDF_SIZE = 30 * 1024 * 1024   # 30 MB
MAX_PASSWORD_LEN = 256


def _validate(pdf_file: UploadFile, password: str) -> None:
    if not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "File must be a PDF")
    if not password.strip():
        raise HTTPException(400, "Password required")
    if len(password) > MAX_PASSWORD_LEN:
        raise HTTPException(413, f"Password too long (max {MAX_PASSWORD_LEN} chars)")


def _safe_name(filename: str) -> str:
    """Strip path components to block directory traversal in download name."""
    return filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]


@router.post("/encrypt")
async def encrypt_pdf(
    pdf_file: UploadFile = File(...),
    password: str = Form(...),
):
    """Lock a PDF with a password. Returns the encrypted PDF as download."""
    _validate(pdf_file, password)

    pdf_content = await pdf_file.read()
    if len(pdf_content) > MAX_PDF_SIZE:
        raise HTTPException(413, "PDF too large (max 30 MB)")

    try:
        reader = PdfReader(io.BytesIO(pdf_content))
        if reader.is_encrypted:
            raise HTTPException(400, "PDF is already encrypted")

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(
            user_password=password,
            owner_password=password,
            algorithm="AES-256",
        )

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
    except HTTPException:
        raise
    except PdfReadError as e:
        raise HTTPException(400, f"Could not read PDF: {e}")
    except Exception as e:
        log.error("PDF encryption failed: %s", e)
        raise HTTPException(500, f"Could not encrypt PDF: {e}")

    return StreamingResponse(
        out,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="locked_{_safe_name(pdf_file.filename)}"'
        },
    )


@router.post("/unlock")
async def unlock_pdf(
    pdf_file: UploadFile = File(...),
    password: str = Form(...),
):
    """Unlock a password-protected PDF. Returns the decrypted PDF as download."""
    _validate(pdf_file, password)

    pdf_content = await pdf_file.read()
    if len(pdf_content) > MAX_PDF_SIZE:
        raise HTTPException(413, "PDF too large (max 30 MB)")

    try:
        reader = PdfReader(io.BytesIO(pdf_content))
        if not reader.is_encrypted:
            raise HTTPException(400, "PDF is not password-protected")

        # pypdf.decrypt returns PasswordType (1 = user, 2 = owner, 0 = fail).
        # Falsy values mean wrong password.
        if not reader.decrypt(password):
            raise HTTPException(400, "Wrong password")

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        out = io.BytesIO()
        writer.write(out)
        out.seek(0)
    except HTTPException:
        raise
    except PdfReadError as e:
        raise HTTPException(400, f"Could not read PDF: {e}")
    except Exception as e:
        log.error("PDF unlock failed: %s", e)
        raise HTTPException(500, f"Could not unlock PDF: {e}")

    return StreamingResponse(
        out,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="unlocked_{_safe_name(pdf_file.filename)}"'
        },
    )
