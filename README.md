# CyberGuard Toolkit

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://www.python.org/)

A consolidated, browser-based cybersecurity suite built for privacy, zero data retention, and enterprise-grade cryptography.

---

## Why I Built This

Hi, I'm **Ahsan**, a Senior AI/ML Engineer. Throughout my career, I've noticed a recurring pattern: robust cybersecurity tools are either highly fragmented, strictly CLI-based (and thus hostile to non-experts), or gated behind enterprise platforms. I wanted to see if I could consolidate the most critical security utilities—cryptographic operations, threat intelligence, and basic privacy tools—into a single web application without compromising the underlying mathematics or system integrity.

The **CyberGuard Toolkit** is my attempt at bridging the gap between heavy-duty cryptographic libraries and an intuitive, modern UX. More importantly, I designed the system to be strictly stateless. Whether you are generating a high-entropy password, encrypting a file, or scanning a URL for phishing heuristics, your data is processed in-memory and immediately discarded. There are no databases here, and no logs persisting your queries.

## Architecture & System Design

The application uses a decoupled, two-tier architecture designed to isolate the presentation layer from the cryptographic and heuristic processing engines.

### 1. Presentation Tier (Next.js 16)
I chose Next.js with the App Router to handle the frontend. It uses React 19 and Framer Motion to deliver a responsive, 60fps glassmorphic UI. By managing local state carefully and relying on client-side crypto fallbacks where necessary (e.g., `crypto.getRandomValues()`), the frontend maintains a degraded-but-usable state even if backend connectivity drops. A strict `/api/*` rewrite proxies all calls to the backend, keeping CORS configurations tight and preventing direct API exposure.

### 2. Computing Tier (FastAPI)
The backend does the heavy computation. I went with FastAPI (Python) running on `uvicorn` to take advantage of high-concurrency asynchronous I/O. This is particularly critical for the phishing scanner, which needs to run multiple network-bound operations (WHOIS, SSL handshakes, and HTTP redirect tracing) simultaneously without blocking the main event loop. Because the entire backend is stateless, the attack surface is significantly reduced.

## Core Engineering Capabilities

### 1. Authenticated Text Encryption (AES-256-GCM)
I avoided standard block cipher modes like CBC for text encryption to prevent padding oracle and ciphertext malleability attacks, opting instead for true Authenticated Encryption with Additional Data (AEAD) via AES-256-GCM. Keys are dynamically derived from passphrases using **PBKDF2-HMAC-SHA256** with 100,000 iterations and a random salt, deliberately maximizing computational friction against brute-force attacks.

### 2. Heuristic Phishing Scanner
Instead of just pinging third-party blacklists, this module executes its own multi-layered threat scoring pipeline asynchronously:
*   **WHOIS & Domain Age Analysis:** Flags newly registered or heavily obfuscated domains.
*   **SSL/TLS Verification:** Inspects certificate chains for invalid, missing, or self-signed certs.
*   **HTTP Redirect Traversal:** Follows execution paths using `httpx` to unmask obscure redirect chains.
*   **Keyword Heuristics:** Uses BeautifulSoup 4 (BS4) for DOM inspection and URL tokenization to catch typosquatting.

### 3. File Cryptography (Fernet)
Designed for rapid, in-memory stream processing of files uploaded via `FormData`. It leverages Python's Fernet specification (AES-128-CBC + HMAC-SHA256). It gives users a discrete cryptographic key to safely package or un-package files locally or before external transmission.

### 4. Entropy-Aware Password Generator
Rather than arbitrary string concatenation, this engine uses Python's `secrets` module (a CSPRNG backed by the OS entropy pool like `/dev/urandom`) to ensure non-deterministic key generation. It computes mathematical entropy `E = L × log₂(N)` and hits the **HaveIBeenPwned API** strictly using **k-anonymity** (transmitting only the first 5 characters of the SHA-1 hash) to check millions of breached records without ever revealing the generated password.

### 5. Dictionary-Driven PDF Decryptor
A targeted forensic tool utilizing `pikepdf`. Designed to execute wordlist-based dictionary attacks to recover access to password-protected PDFs. It's built asynchronously to handle I/O bound cracking securely without choking the FastAPI worker pool.

### 6. Simulated Disposable Email Bridge
A privacy mechanism designed to prevent credential enumeration and combat inbox spam. It generates valid but transient alias addresses to allow rapid, discardable registration masking.

## Scalability & Production Readiness

While perfectly functional as a local deployment, the foundational engineering is built to scale horizontally:
*   **Stateless Containers:** Because the system maintains zero session affinity, the FastAPI layer can be replicated endlessly across a Kubernetes cluster and put behind a round-robin load balancer.
*   **Edge Portability:** The Next.js frontend can be deployed directly to edge network nodes (like Vercel or Cloudflare), drastically reducing TTFB and shifting all non-cryptographic rendering costs to the CDN.
*   **Process Offloading:** Compute-heavy routes, such as the PDF Decryptor, have been cordoned in their own routers, making it trivial to offload them into a dedicated Celery/Redis worker queue in a production environment if the primary Uvicorn ASGI workers become saturated.

## Getting Started

### Prerequisites
*   Node.js (v18.17.0 or higher)
*   Python (3.10 or higher)

### Local Deployment

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd CyberGuard-Toolkit
   ```

2. **Start the Backend (FastAPI)**
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On Mac/Linux: source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
   *The backend will now be polling at `http://localhost:8000`.*

3. **Start the Frontend (Next.js)**
   Open a new terminal window to keep the backend running.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The toolkit UI will boot up on `http://localhost:3000`.*

## Future Roadmap: ML Integration

Given my background in Machine Learning, the next iteration of the CyberGuard Toolkit will augment its deterministic rule-based systems with predictive models. I plan to upgrade the **Phishing Scanner** with a lightweight, fine-tuned NLP model (such as DistilBERT) to analyze DOM semantics and URL lexical structures, providing real-time, deep-learning-backed threat inference on zero-day phishing campaigns.

---
**Authored by Ahsan**  
