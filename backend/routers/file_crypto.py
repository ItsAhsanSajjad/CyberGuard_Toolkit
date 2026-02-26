"""
File Encryption & Decryption — Fernet (AES-128-CBC + HMAC-SHA256)
- Accepts file uploads via multipart/form-data
- Returns encrypted/decrypted files as downloadable responses
"""

import base64

from cryptography.fernet import Fernet, InvalidToken
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import Response

router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# ── Endpoints ─────────────────────────────────────────────────────────
@router.post("/encrypt")
async def encrypt_file(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large (max 50 MB)")

    key = Fernet.generate_key()
    fernet = Fernet(key)
    encrypted = fernet.encrypt(content)

    return {
        "encrypted_base64": base64.b64encode(encrypted).decode("ascii"),
        "key": key.decode("ascii"),
        "original_name": file.filename,
        "original_size": len(content),
        "encrypted_size": len(encrypted),
    }


@router.post("/decrypt")
async def decrypt_file(
    file: UploadFile = File(...),
    key: str = Form(...),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large (max 50 MB)")

    # The uploaded file might be raw Fernet bytes or base64-encoded
    # Try raw first, then base64 decoded
    try:
        key_bytes = key.encode("ascii")
        fernet = Fernet(key_bytes)
    except Exception:
        raise HTTPException(400, "Invalid Fernet key")

    try:
        decrypted = fernet.decrypt(content)
    except InvalidToken:
        # Maybe the content was base64-encoded by our encrypt endpoint
        try:
            decoded_content = base64.b64decode(content)
            decrypted = fernet.decrypt(decoded_content)
        except Exception:
            raise HTTPException(
                400, "Decryption failed — wrong key or corrupted file"
            )

    return Response(
        content=decrypted,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="decrypted_{file.filename}"'
        },
    )
