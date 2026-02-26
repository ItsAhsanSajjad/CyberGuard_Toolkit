"""
CyberGuard Toolkit — FastAPI Backend
Real cryptographic & security operations powering the Next.js frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import password, encryption, file_crypto, phishing, pdf

app = FastAPI(
    title="CyberGuard Toolkit API",
    description="Backend API for real cybersecurity operations",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    return {"status": "ok", "service": "CyberGuard Toolkit API"}
