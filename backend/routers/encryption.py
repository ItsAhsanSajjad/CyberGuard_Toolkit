"""
Text Encryption & Decryption — AES-256-GCM
- PBKDF2-HMAC-SHA256 key derivation from passphrase
- Random salt + nonce per encryption
- Authenticated encryption (GCM provides integrity)
"""

import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# OWASP 2023+ recommends 600,000 iterations for PBKDF2-HMAC-SHA256
ITERATIONS = 600_000
SALT_LEN = 16
NONCE_LEN = 12
KEY_LEN = 32  # 256 bits

MAX_TEXT_LEN = 1_000_000        # 1 MB plaintext / ciphertext
MAX_PASSPHRASE_LEN = 1024       # 1 KB passphrase


# ── Schemas ───────────────────────────────────────────────────────────
class EncryptRequest(BaseModel):
    text: str
    passphrase: str


class EncryptResponse(BaseModel):
    ciphertext: str  # base64 encoded (salt + nonce + ciphertext)
    algorithm: str = "AES-256-GCM"
    key_derivation: str = "PBKDF2-HMAC-SHA256"


class DecryptRequest(BaseModel):
    ciphertext: str  # base64 encoded
    passphrase: str


class DecryptResponse(BaseModel):
    plaintext: str


# ── Helpers ───────────────────────────────────────────────────────────
def _derive_key(passphrase: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_LEN,
        salt=salt,
        iterations=ITERATIONS,
    )
    return kdf.derive(passphrase.encode("utf-8"))


# ── Endpoints ─────────────────────────────────────────────────────────
@router.post("/encrypt/text", response_model=EncryptResponse)
async def encrypt_text(req: EncryptRequest):
    if not req.text:
        raise HTTPException(400, "Text cannot be empty")
    if not req.passphrase:
        raise HTTPException(400, "Passphrase cannot be empty")
    if len(req.text) > MAX_TEXT_LEN:
        raise HTTPException(413, "Text too large (max 1 MB)")
    if len(req.passphrase) > MAX_PASSPHRASE_LEN:
        raise HTTPException(413, "Passphrase too long")

    salt = os.urandom(SALT_LEN)
    nonce = os.urandom(NONCE_LEN)
    key = _derive_key(req.passphrase, salt)

    aesgcm = AESGCM(key)
    ct = aesgcm.encrypt(nonce, req.text.encode("utf-8"), None)

    # Pack salt + nonce + ciphertext into one base64 blob
    packed = salt + nonce + ct
    encoded = base64.b64encode(packed).decode("ascii")

    return EncryptResponse(ciphertext=encoded)


@router.post("/decrypt/text", response_model=DecryptResponse)
async def decrypt_text(req: DecryptRequest):
    if not req.ciphertext:
        raise HTTPException(400, "Ciphertext cannot be empty")
    if not req.passphrase:
        raise HTTPException(400, "Passphrase cannot be empty")
    if len(req.ciphertext) > MAX_TEXT_LEN:
        raise HTTPException(413, "Ciphertext too large (max 1 MB)")
    if len(req.passphrase) > MAX_PASSPHRASE_LEN:
        raise HTTPException(413, "Passphrase too long")

    try:
        packed = base64.b64decode(req.ciphertext)
    except Exception:
        raise HTTPException(400, "Invalid base64 ciphertext")

    if len(packed) < SALT_LEN + NONCE_LEN + 1:
        raise HTTPException(400, "Ciphertext too short")

    salt = packed[:SALT_LEN]
    nonce = packed[SALT_LEN : SALT_LEN + NONCE_LEN]
    ct = packed[SALT_LEN + NONCE_LEN :]

    key = _derive_key(req.passphrase, salt)
    aesgcm = AESGCM(key)

    try:
        plaintext = aesgcm.decrypt(nonce, ct, None)
    except Exception:
        raise HTTPException(400, "Decryption failed — wrong passphrase or corrupted data")

    return DecryptResponse(plaintext=plaintext.decode("utf-8"))
