"""
Cyber Security Toolkit — FastAPI Backend
Real cryptographic & security operations powering the Next.js frontend.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import password, encryption, file_crypto, phishing, pdf

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="Cyber Security Toolkit API",
    description="Backend API for real cybersecurity operations",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────
# Restricted to local dev origins. Update this list before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(password.router,    prefix="/api/password",   tags=["Password"])
app.include_router(encryption.router,  prefix="/api",            tags=["Text Encryption"])
app.include_router(file_crypto.router, prefix="/api/file",       tags=["File Crypto"])
app.include_router(phishing.router,    prefix="/api/phishing",   tags=["Phishing Scanner"])
app.include_router(pdf.router,         prefix="/api/pdf",        tags=["PDF Decryptor"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Cyber Security Toolkit API"}
