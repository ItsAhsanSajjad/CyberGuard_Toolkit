# Software Requirements Specification (SRS)
# CyberGuard Toolkit — Frontend Module

**Version:** 1.0  
**Date:** 25 February 2026  
**Project:** CyberGuard Toolkit  
**Module:** Frontend (Next.js Web Application)  
**Prepared By:** Development Team  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Technology Stack & Dependencies](#3-technology-stack--dependencies)
4. [System Architecture](#4-system-architecture)
5. [Project Structure & File Inventory](#5-project-structure--file-inventory)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Module Specifications](#9-module-specifications)
10. [API Integration Layer](#10-api-integration-layer)
11. [Security Considerations](#11-security-considerations)
12. [Deployment & Build Configuration](#12-deployment--build-configuration)
13. [Appendices](#13-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document provides a complete Software Requirements Specification (SRS) for the **Frontend Module** of the CyberGuard Toolkit. It describes every functional and non-functional requirement, component behavior, page-level specification, API contract, design system, and architectural decision implemented in the Next.js web client.

### 1.2 Scope

The CyberGuard Toolkit is a comprehensive cybersecurity suite that provides six core security tools through a premium, responsive single-page web application:

| # | Tool | Description |
|---|------|-------------|
| 1 | **Password Generator** | Cryptographically secure password generation with entropy analysis and breach checking |
| 2 | **Text Encryption** | AES-256-GCM text encryption/decryption with PBKDF2 key derivation |
| 3 | **File Encryptor** | Fernet symmetric file encryption/decryption with drag-and-drop upload |
| 4 | **Phishing Scanner** | Multi-layered URL threat analysis with WHOIS, SSL, and heuristic checks |
| 5 | **PDF Decryptor** | Dictionary-based password recovery for protected PDF files |
| 6 | **Temporary Email** | Disposable email address generation with simulated inbox |

### 1.3 Intended Audience

- **Project Evaluators / Supervisors** — for academic SRS review
- **Backend Developers** — to understand API contracts the frontend consumes
- **UI/UX Designers** — to understand the current design system and component library
- **Future Maintainers** — for ongoing development reference

### 1.4 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| **SPA** | Single Page Application |
| **SSR** | Server-Side Rendering |
| **CSPRNG** | Cryptographically Secure Pseudo-Random Number Generator |
| **AES-256-GCM** | Advanced Encryption Standard 256-bit in Galois/Counter Mode |
| **PBKDF2** | Password-Based Key Derivation Function 2 |
| **Fernet** | Symmetric encryption scheme (AES-128-CBC + HMAC-SHA256) |
| **WHOIS** | Domain registration lookup protocol |
| **HaveIBeenPwned** | Online database of breached credentials |
| **CORS** | Cross-Origin Resource Sharing |

---

## 2. Overall Description

### 2.1 Product Perspective

The frontend is a **Next.js 16 App Router** web application that serves as the user-facing interface for the CyberGuard Toolkit. It communicates with a **FastAPI backend** via RESTful API endpoints, proxied through Next.js rewrites to avoid CORS issues during development.

```
┌──────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (React 19 + Framer Motion)            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │ │
│  │  │ Password │ │ Text     │ │ File     │ │ Phishing   │ │ │
│  │  │ Generator│ │ Encrypt  │ │ Crypto   │ │ Scanner    │ │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │ │
│  │       │             │            │              │        │ │
│  │  ┌────┴─────────────┴────────────┴──────────────┴──────┐ │ │
│  │  │        Next.js API Proxy (rewrites → :8000)         │ │ │
│  │  └──────────────────────┬──────────────────────────────┘ │ │
│  └─────────────────────────┼───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP (localhost:8000)
                ┌────────────┴────────────┐
                │    FastAPI Backend       │
                │  (Python 3.x + uvicorn) │
                └─────────────────────────┘
```

### 2.2 Product Features Summary

- **Dashboard** — Hero section with mission statement, statistics cards, and tool navigation grid
- **Responsive Sidebar** — Collapsible navigation with animated active state indicator
- **Dark/Light Theme** — Persistent theme toggle with localStorage and CSS custom properties
- **Glassmorphism UI** — Premium design with backdrop-blur glass cards, smooth gradient accents
- **Animated Transitions** — Framer Motion page-level and micro-animations throughout
- **Client-Side Fallbacks** — Graceful degradation when backend is unavailable (password generator)
- **Real-Time Feedback** — Toast notifications, progress bars, loading spinners, and scanning animations

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Level |
|------------|-------------|-----------------|
| **Student** | Learning cybersecurity concepts through hands-on tool usage | Beginner |
| **Security Analyst** | Using tools for quick security checks and URL auditing | Intermediate |
| **Developer** | Integrating or extending the toolkit | Advanced |
| **General User** | Basic encryption, password generation, file protection | Beginner–Intermediate |

### 2.4 Operating Environment

| Requirement | Specification |
|-------------|---------------|
| **Browser** | Chrome 90+, Firefox 88+, Safari 15+, Edge 90+ |
| **JavaScript** | ES2020+ (async/await, optional chaining, BigInt) |
| **Screen Size** | Desktop (1920px+), Tablet (768px–1024px), Mobile (320px–767px) |
| **Network** | Internet connection required for backend API calls |
| **Node.js** | v18.17+ (for development and build) |

---

## 3. Technology Stack & Dependencies

### 3.1 Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | React framework with App Router, SSR, file-based routing |
| `react` | 19.2.3 | UI component library |
| `react-dom` | 19.2.3 | DOM rendering engine |

### 3.2 UI & Animation Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^12.34.3 | Page transitions, micro-animations, AnimatePresence, layout animations |
| `lucide-react` | ^0.575.0 | 200+ SVG icons (Shield, Lock, Key, Mail, etc.) |
| `react-hot-toast` | ^2.6.0 | Non-blocking toast notifications for success/error/info feedback |

### 3.3 Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^9 | Static code analysis and linting |
| `eslint-config-next` | 16.1.6 | Next.js-specific ESLint rules |

### 3.4 No External CSS Frameworks

The project uses **vanilla CSS with CSS custom properties** (no Tailwind, Bootstrap, or other framework). All styling is implemented through a custom design system defined in `globals.css`.

---

## 4. System Architecture

### 4.1 Next.js App Router Architecture

The application uses the **Next.js App Router** (introduced in Next.js 13) with all pages as client components (`'use client'`). The App Router provides:

- **File-based routing** — Each directory under `src/app/` defines a route
- **Nested layouts** — A root `layout.js` wraps all pages with shared UI (sidebar, theme, toaster)
- **Automatic code splitting** — Each page is lazy-loaded for optimal performance

### 4.2 Component Hierarchy

```
RootLayout (layout.js)
├── ThemeProvider (Context)
│   ├── Sidebar (Navigation)
│   └── <main> (Page Content)
│       ├── DashboardPage      (/)
│       ├── PasswordGenerator  (/password-generator)
│       ├── TextEncryption     (/text-encryption)
│       ├── FileCrypto         (/file-crypto)
│       ├── PhishingScanner    (/phishing-scanner)
│       ├── PdfDecryptor       (/pdf-decryptor)
│       └── TempEmail          (/temp-email)
└── Toaster (Notifications)
```

### 4.3 State Management

The application uses **local component state** (`useState`, `useRef`) for tool-specific data and **React Context** for global state:

| State Type | Mechanism | Scope |
|-----------|-----------|-------|
| **Theme** (dark/light) | React Context + localStorage | Global |
| **Active Route** | `usePathname()` from Next.js | Sidebar |
| **Tool Data** (passwords, URLs, files) | `useState` hooks | Per-page |
| **UI State** (loading, mode toggles) | `useState` hooks | Per-page |
| **Sidebar collapsed/mobile** | `useState` hooks | Sidebar component |

### 4.4 API Proxy Configuration

All API calls from the frontend are proxied via Next.js rewrites to the backend server. This eliminates CORS issues during development.

**Configuration** (`next.config.mjs`):
```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};
```

| Frontend Request | Proxied To |
|-----------------|------------|
| `POST /api/password/generate` | `http://localhost:8000/api/password/generate` |
| `POST /api/encrypt/text` | `http://localhost:8000/api/encrypt/text` |
| `POST /api/file/encrypt` | `http://localhost:8000/api/file/encrypt` |
| `POST /api/phishing/scan` | `http://localhost:8000/api/phishing/scan` |
| `POST /api/pdf/decrypt` | `http://localhost:8000/api/pdf/decrypt` |

---

## 5. Project Structure & File Inventory

```
frontend/
├── package.json                    # Dependencies & scripts
├── next.config.mjs                 # API proxy rewrites
├── src/
│   └── app/
│       ├── layout.js               # Root layout (Sidebar + Theme + Toaster)
│       ├── page.js                 # Dashboard / Home page
│       ├── globals.css             # Global design system (27 KB)
│       ├── icon.svg                # SVG favicon (shield + lock)
│       ├── favicon.ico             # Legacy favicon
│       ├── components/
│       │   ├── Sidebar.js          # Navigation sidebar component
│       │   └── ThemeProvider.js    # Dark/Light theme context
│       ├── password-generator/
│       │   └── page.js             # Password Generator tool
│       ├── text-encryption/
│       │   └── page.js             # Text Encryption tool
│       ├── file-crypto/
│       │   └── page.js             # File Encryptor tool
│       ├── phishing-scanner/
│       │   └── page.js             # Phishing Scanner tool
│       ├── pdf-decryptor/
│       │   └── page.js             # PDF Decryptor tool
│       └── temp-email/
│           └── page.js             # Temporary Email tool
```

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `layout.js` | 48 | 1.5 KB | Root layout, metadata, icons |
| `page.js` (Dashboard) | 406 | 11.9 KB | Hero, stats, tool cards, mission |
| `globals.css` | 935+ | 27.3 KB | Complete design system |
| `Sidebar.js` | 174 | 5.6 KB | Navigation, collapse, mobile |
| `ThemeProvider.js` | 44 | 1.3 KB | Theme context & persistence |
| `password-generator/page.js` | 365 | 15.6 KB | Password generation tool |
| `text-encryption/page.js` | 213 | 8.5 KB | Text encrypt/decrypt tool |
| `file-crypto/page.js` | 365 | 14.5 KB | File encrypt/decrypt tool |
| `phishing-scanner/page.js` | 306 | 12.0 KB | URL threat analysis tool |
| `pdf-decryptor/page.js` | 163 | 9.2 KB | PDF password cracker tool |
| `temp-email/page.js` | 179 | 9.7 KB | Disposable email tool |

---

## 6. Functional Requirements

### FR-01: Dashboard / Home Page

| ID | Requirement | Priority |
|----|------------|----------|
| FR-01.1 | Display a hero section with the "CyberGuard Toolkit" branding and gradient text | High |
| FR-01.2 | Show a "Cybersecurity Suite" badge with ShieldCheck icon | Medium |
| FR-01.3 | Display 3 statistics cards: "6 Security Tools", "256-bit Encryption", "Real-time Threat Scanning" | High |
| FR-01.4 | Render a 3-column grid of 6 tool cards, each linking to its respective tool page | High |
| FR-01.5 | Each tool card must display: color-coded icon, title, description, and "Open Tool" link with hover animation | High |
| FR-01.6 | Display a mission statement section with badges: "Open Source", "Military-Grade Crypto", "Real-Time Analysis" | Medium |
| FR-01.7 | All cards must animate in with staggered fade + slide using Framer Motion | Medium |
| FR-01.8 | Must be responsive: 3 columns → 2 columns (≤1024px) → 1 column (≤768px) | High |

### FR-02: Password Generator

| ID | Requirement | Priority |
|----|------------|----------|
| FR-02.1 | Provide a slider to set password length from 4 to 128 characters | High |
| FR-02.2 | Provide toggle switches for: Uppercase Letters, Numbers, Special Characters | High |
| FR-02.3 | Generate passwords via backend API (`POST /api/password/generate`) using CSPRNG | High |
| FR-02.4 | If the backend is unavailable, fallback to client-side generation using `crypto.getRandomValues()` and show an error toast | High |
| FR-02.5 | Display the generated password in a click-to-copy result box with animation | High |
| FR-02.6 | Provide "Copy" and "Regenerate" buttons with icon state feedback (Copy → Check) | Medium |
| FR-02.7 | Check password breach status via HaveIBeenPwned API (`POST /api/password/check-strength`) | High |
| FR-02.8 | Display entropy bits and breach status as colored badge pills (green = safe, red = breached) | Medium |
| FR-02.9 | Show a 5-segment visual strength meter: Weak, Fair, Good, Strong, Very Strong | High |
| FR-02.10 | Maintain a scrollable history of last 10 generated passwords with click-to-copy | Medium |
| FR-02.11 | Layout: 2-column grid (380px controls panel + flexible result area) collapsing to 1 column at ≤900px | High |
| FR-02.12 | Controls panel must be `position: sticky` on desktop | Low |

### FR-03: Text Encryption

| ID | Requirement | Priority |
|----|------------|----------|
| FR-03.1 | Provide an Encrypt/Decrypt mode toggle with Lock/Unlock icons | High |
| FR-03.2 | Display an algorithm badge: "AES-256-GCM • PBKDF2-HMAC-SHA256" | Medium |
| FR-03.3 | Provide a textarea for inputting plaintext (encrypt) or ciphertext (decrypt) — 6 rows | High |
| FR-03.4 | Provide a password input for the passphrase (encryption key) | High |
| FR-03.5 | Display informational text: "Your passphrase is used to derive a 256-bit key via PBKDF2 (100,000 iterations)" | Medium |
| FR-03.6 | Encrypt via `POST /api/encrypt/text` with `{text, passphrase}` and display base64 ciphertext | High |
| FR-03.7 | Decrypt via `POST /api/decrypt/text` with `{ciphertext, passphrase}` and display plaintext | High |
| FR-03.8 | Provide a "Swap" button to move output → input and toggle mode | Medium |
| FR-03.9 | Provide a "Copy Result" button with check feedback icon | Medium |
| FR-03.10 | Show a spinner during processing with "Processing..." label | Medium |
| FR-03.11 | Show a toast: "Message encrypted with AES-256-GCM!" or "Message decrypted!" on success | Medium |
| FR-03.12 | Layout: 2-column grid (input | output) collapsing to 1 column at ≤768px | High |

### FR-04: File Encryptor & Decryptor

| ID | Requirement | Priority |
|----|------------|----------|
| FR-04.1 | Provide an Encrypt/Decrypt mode toggle | High |
| FR-04.2 | Implement a drag-and-drop file upload zone with click fallback | High |
| FR-04.3 | Display file information chip: name, size (formatted as B/KB/MB), and remove button | Medium |
| FR-04.4 | In **encrypt** mode: upload file via `POST /api/file/encrypt` (FormData), receive encrypted base64 + Fernet key | High |
| FR-04.5 | In **decrypt** mode: require a Fernet key input, upload via `POST /api/file/decrypt` (FormData + key) | High |
| FR-04.6 | Display the generated Fernet encryption key in a result box with "Keep this safe" warning and copy button | High |
| FR-04.7 | Provide a "Download Encrypted/Decrypted File" button that creates a blob URL and triggers download | High |
| FR-04.8 | Show an animated processing state with rotating FileKey icon and progress bar | Medium |
| FR-04.9 | Show a success badge "✓ Encryption Complete" or "✓ Decryption Complete" | Medium |
| FR-04.10 | Layout: 2-column grid (upload panel | result panel) collapsing to 1 column at ≤768px | High |

### FR-05: Phishing Scanner

| ID | Requirement | Priority |
|----|------------|----------|
| FR-05.1 | Display feature pills: "SSL Validation", "WHOIS Lookup", "Keyword Analysis", "Domain Age Check", "Redirect Detection" | Medium |
| FR-05.2 | Provide a URL input field with a Globe icon prefix and "Scan URL" button | High |
| FR-05.3 | Support Enter key to trigger scan | Medium |
| FR-05.4 | Show an animated scanning state with: radar pulse rings (2 concentric rings with scale + opacity animation), rotating scan phase labels, and progress bar | High |
| FR-05.5 | Scan URL via `POST /api/phishing/scan` with `{url}` payload | High |
| FR-05.6 | Display results in a score + meta grid (240px score card + flexible meta card) | High |
| FR-05.7 | Render an **animated SVG circular score ring** (0–100) with color coding: green ≥70, orange 40–69, red <40 | High |
| FR-05.8 | Display a level badge: "Safe", "Warning", or "Danger" with corresponding icon | High |
| FR-05.9 | Show scan metadata: URL, Page Title, Domain Age (years/days), Checks Performed count | Medium |
| FR-05.10 | Render a **3-column tile grid** of individual security checks, each showing: per-check icon (11 mapped icons), label, detail, and color-coded status | High |
| FR-05.11 | Each check tile must animate in with staggered delay (0.08s per tile) | Medium |
| FR-05.12 | Tiles must have hover lift effect with colored border on hover based on status | Low |
| FR-05.13 | Show appropriate toast: success (safe), warning (suspicious), or error (dangerous) | Medium |
| FR-05.14 | Responsive: 3 columns → 2 columns (≤1024px) → 1 column (≤768px) | High |

### FR-06: PDF Decryptor

| ID | Requirement | Priority |
|----|------------|----------|
| FR-06.1 | Provide two file upload zones: PDF file (.pdf) and Wordlist file (.txt) | High |
| FR-06.2 | Both zones must support drag-and-drop and click-to-browse | High |
| FR-06.3 | Display file chips with name, size, and remove button for each uploaded file | Medium |
| FR-06.4 | Submit both files via `POST /api/pdf/decrypt` as FormData | High |
| FR-06.5 | Show an animated cracking state with rotating Key icon and progress bar (10s duration) | Medium |
| FR-06.6 | On success (found=true): display green CheckCircle icon with "Password Found!" and the password in a result box | High |
| FR-06.7 | On failure (found=false): display red XCircle icon with "Password Not Found" and "Try a larger wordlist" suggestion | High |
| FR-06.8 | Display statistics pills: attempts/total tried, elapsed time in seconds | Medium |
| FR-06.9 | Layout: 2-column grid (upload panel | result panel) | High |

### FR-07: Temporary Email

| ID | Requirement | Priority |
|----|------------|----------|
| FR-07.1 | Auto-generate a random email address on page load (e.g., `abc123def0@tempbox.io`) | High |
| FR-07.2 | Randomly select from domains: tempbox.io, quickmail.dev, dropmail.cc, fastmail.tmp | Medium |
| FR-07.3 | Display the generated email in a result box with Copy and New buttons | High |
| FR-07.4 | Show domain info: "Domain: {domain} • This email will auto-expire" | Medium |
| FR-07.5 | Provide an inbox panel with a "Refresh" button that loads 3 mock emails after 1.5s delay | High |
| FR-07.6 | Each inbox item must show: sender, subject, timestamp, with click-to-select | High |
| FR-07.7 | Selected email must have cyan left border and highlighted background | Medium |
| FR-07.8 | Provide an email detail panel that renders: subject (h3), sender, time, and body in monospace | High |
| FR-07.9 | Show empty states for both inbox ("No emails yet") and detail pane ("Select an email to view") | Medium |
| FR-07.10 | Layout: 2-column grid (inbox | detail) collapsing to 1 column at ≤768px | High |

### FR-08: Navigation & Sidebar

| ID | Requirement | Priority |
|----|------------|----------|
| FR-08.1 | Display a persistent sidebar with 7 navigation items and icon+label layout | High |
| FR-08.2 | Highlight the active route with an animated background pill using Framer Motion `layoutId` | High |
| FR-08.3 | Support **collapsed mode** (icon-only) with a Collapse/Expand toggle button | Medium |
| FR-08.4 | In collapsed mode, show tooltips on hover with item labels | Low |
| FR-08.5 | On mobile (≤768px), replace sidebar with a **top bar** (hamburger menu, brand name, theme toggle) | High |
| FR-08.6 | Mobile sidebar must open as a full-height overlay with a semi-transparent backdrop | High |
| FR-08.7 | Provide a **theme toggle button** (Sun/Moon icon) in both sidebar footer and mobile top bar | High |
| FR-08.8 | Display brand: CyberGuard icon (ShieldCheck) + "CyberGuard" title + "Security Toolkit" subtitle | Medium |

### FR-09: Theme System

| ID | Requirement | Priority |
|----|------------|----------|
| FR-09.1 | Default to **dark theme** on first visit | High |
| FR-09.2 | Persist theme choice to `localStorage` under key `cyberguard-theme` | High |
| FR-09.3 | Apply theme via `data-theme` attribute on `<html>` element | High |
| FR-09.4 | Prevent flash of wrong theme on page load (FOUC prevention with mounted check) | Medium |
| FR-09.5 | All colors must use CSS custom properties (e.g., `var(--bg-primary)`, `var(--text-primary)`) | High |

---

## 7. Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement | Target |
|----|------------|--------|
| NFR-01.1 | First Contentful Paint (FCP) | < 1.5 seconds |
| NFR-01.2 | Page transition animation latency | < 300ms |
| NFR-01.3 | Automatic code splitting per route | Enabled via App Router |
| NFR-01.4 | No blocking renders during API calls | All I/O via async/await with loading states |

### NFR-02: Responsiveness

| ID | Requirement | Breakpoints |
|----|------------|-------------|
| NFR-02.1 | Full 3-column layouts on desktop | ≥1024px |
| NFR-02.2 | 2-column layouts on tablets | 768px–1024px |
| NFR-02.3 | Single-column stacked layout on mobile | ≤768px |
| NFR-02.4 | Sidebar collapse to icon-only on demand | Desktop toggle |
| NFR-02.5 | Replace sidebar with top bar on mobile | ≤768px |

### NFR-03: Accessibility

| ID | Requirement |
|----|------------|
| NFR-03.1 | All interactive elements have `aria-label` attributes |
| NFR-03.2 | Color contrast ratios meet WCAG 2.1 AA standards |
| NFR-03.3 | Keyboard navigation supported for all form elements |
| NFR-03.4 | `suppressHydrationWarning` on `<html>` to prevent SSR mismatches |

### NFR-04: Browser Compatibility

| ID | Requirement |
|----|------------|
| NFR-04.1 | Chrome 90+, Firefox 88+, Safari 15+, Edge 90+ |
| NFR-04.2 | `backdrop-filter` for glassmorphism (with fallback for unsupported browsers) |
| NFR-04.3 | `crypto.getRandomValues()` for client-side password fallback |

### NFR-05: Maintainability

| ID | Requirement |
|----|------------|
| NFR-05.1 | All CSS uses custom properties for theming — no hardcoded colors in component styles |
| NFR-05.2 | Component architecture follows single-responsibility principle |
| NFR-05.3 | ESLint configured with Next.js recommended rules |

---

## 8. UI/UX Design System

### 8.1 Color Palette

#### Dark Theme (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#06080f` | Main background |
| `--bg-secondary` | `#0d1220` | Card backgrounds |
| `--bg-input` | `#131a2e` | Input fields, secondary surfaces |
| `--text-primary` | `#e8edf5` | Headings, primary text |
| `--text-secondary` | `#8b95a8` | Body text, descriptions |
| `--text-muted` | `#4e5a6e` | Hints, labels |
| `--cyan` | `#00bcd4` | Primary accent (buttons, links, active states) |
| `--purple` | `#7c3aed` | Secondary accent |
| `--green` | `#16a34a` | Success states, safe indicators |
| `--orange` | `#ea580c` | Warning states |
| `--red` | `#dc2626` | Danger states, error indicators |
| `--border` | `rgba(255,255,255,0.06)` | Card/element borders |

#### Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#f5f7fa` | Main background |
| `--bg-secondary` | `#ffffff` | Card backgrounds |
| `--bg-input` | `#eef1f6` | Input fields |
| `--text-primary` | `#0f172a` | Headings |
| `--text-secondary` | `#475569` | Body text |
| `--border` | `rgba(0,0,0,0.08)` | Borders |

### 8.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **Headings** | `var(--font-heading)` (system) | 1.3–3.6rem | 700–900 |
| **Body** | `var(--font-body)` (system stack) | 0.88–1.05rem | 400–500 |
| **Mono/Code** | `var(--font-mono)` | 0.78–0.92rem | 500 |
| **Labels** | Body font | 0.72–0.78rem | 600 (uppercase) |

### 8.3 Component Library

#### Glass Cards

| Class | Description |
|-------|-------------|
| `.glass-card` | Interactive card with backdrop-blur, hover glow, border animation |
| `.glass-card-static` | Non-interactive card with backdrop-blur background |

**Properties:**
- `background: var(--glass-bg)` (rgba with opacity)
- `backdrop-filter: blur(16px)`
- `border: 1px solid var(--border)`
- `border-radius: var(--radius-lg)` (16px)
- `box-shadow: var(--shadow-card)` (layered shadow)

#### Buttons

| Class | Style |
|-------|-------|
| `.btn-primary` | Cyan background, white text, hover scale + glow |
| `.btn-secondary` | Transparent background, border, hover fill |
| `.btn-ghost` | No border/background, icon-only actions |

#### Form Elements

| Component | Class | Features |
|-----------|-------|----------|
| Text Input | `.input-field` | Transparent bg, bottom highlight on focus |
| Textarea | `.input-field` | Auto-height support |
| Range Slider | `.range-slider` | Custom thumb with cyan accent, track gradient |
| Toggle Switch | `.switch` | iOS-style toggle with cyan active state |
| Mode Toggle | `.toggle-group` | Segmented control with active highlight |
| Drop Zone | `.drop-zone` | Dashed border, hover glow, drag-over state |

#### Badges

| Class | Color | Usage |
|-------|-------|-------|
| `.badge-safe` | Green | Safe/pass status |
| `.badge-warning` | Orange | Warning/caution |
| `.badge-danger` | Red | Danger/fail status |

#### Feedback Elements

| Component | Implementation |
|-----------|----------------|
| **Toast Notifications** | `react-hot-toast` with custom dark/light styling |
| **Loading Spinners** | CSS `@keyframes spin` with border-top animation |
| **Progress Bars** | `.progress-bar-track` + `.progress-bar-fill` with animated width |
| **Strength Meter** | 5-segment bar with color transitions (weak → very strong) |

### 8.4 Animation System

| Animation | Library | Details |
|-----------|---------|---------|
| **Page entry** | Framer Motion | `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}` |
| **Staggered grid** | Framer Motion | `delay: index * 0.07-0.1` on each card/tile |
| **Score ring** | Framer Motion + SVG | `strokeDashoffset` animation on circle element |
| **Radar pulse** | Framer Motion | `scale: [1, 1.8]`, `opacity: [0.5, 0]` on concentric rings |
| **Active nav indicator** | Framer Motion | `layoutId="sidebarActiveBg"` spring animation |
| **Hover effects** | CSS transitions | `transform: translateY(-2px)`, border color changes |
| **Loading spinners** | CSS `@keyframes` | 360° rotate at 0.6–1s linear |

---

## 9. Module Specifications

### 9.1 Root Layout (`layout.js`)

**Purpose:** Provides the shared shell for every page.

```
<html lang="en" data-theme="dark">
  <body>
    <ThemeProvider>
      <div class="app-container">
        <Sidebar />
        <main class="main-content">
          <div class="main-content-inner">{page}</div>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  </body>
</html>
```

**Metadata:**
- Title: "CyberGuard Toolkit — Cybersecurity Suite"
- Keywords: cybersecurity, encryption, password generator, phishing scanner, toolkit
- Favicon: `/icon.svg` (SVG shield with lock icon, cyan gradient on dark navy)

### 9.2 ThemeProvider (`ThemeProvider.js`)

**Purpose:** Manages dark/light theme state globally.

| Feature | Implementation |
|---------|----------------|
| **Context** | `ThemeContext` with `{ theme, toggleTheme }` |
| **Persistence** | `localStorage.getItem('cyberguard-theme')` |
| **DOM sync** | `document.documentElement.setAttribute('data-theme', theme)` |
| **FOUC prevention** | Returns default `'dark'` until `mounted` is true |
| **Toggle** | Cycles between `'dark'` and `'light'` |

### 9.3 Sidebar (`Sidebar.js`)

**Navigation Items:**

| Route | Label | Icon |
|-------|-------|------|
| `/` | Dashboard | LayoutDashboard |
| `/password-generator` | Password Generator | KeyRound |
| `/text-encryption` | Text Encryption | Lock |
| `/file-crypto` | File Encryptor | FileKey |
| `/phishing-scanner` | Phishing Scanner | Shield |
| `/pdf-decryptor` | PDF Decryptor | FileText |
| `/temp-email` | Temp Email | Mail |

**States:**
- **Expanded** (default): Icon + label, width: 260px
- **Collapsed**: Icon only, width: 72px
- **Mobile**: Hidden sidebar + top bar with hamburger, full-height overlay on open

**Active State Indicator:**
- Uses Framer Motion `layoutId` for a spring-animated background pill
- Active icon stroke width: 2.3 (vs 1.8 for inactive)

### 9.4 Password Generator (Detailed Logic)

**State Variables:**

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `length` | number | 16 | Password length |
| `upper` | boolean | true | Include uppercase |
| `numbers` | boolean | true | Include numbers |
| `symbols` | boolean | true | Include special chars |
| `password` | string | '' | Current password |
| `entropy` | number | null | Entropy bits from backend |
| `breached` | boolean | null | HaveIBeenPwned result |
| `breachCount` | number | 0 | Breach appearances count |
| `history` | array | [] | Last 10 passwords |
| `loading` | boolean | false | Generation in progress |
| `copied` | boolean | false | Copy feedback state |

**Strength Calculation (Client-Side Fallback):**
```
Score 0: baseline (lowercase only)
+1: length ≥ 8
+1: length ≥ 16
+1: contains uppercase
+1: contains numbers
+1: contains special characters
Max score: 5 → "Very Strong"
```

**Fallback Logic:**
When the backend API fails, the frontend uses `crypto.getRandomValues()` to generate a password from the selected character set, shows a toast "Backend unavailable — generated locally", and sets entropy/breach to null.

---

## 10. API Integration Layer

### 10.1 API Endpoints Consumed

| Endpoint | Method | Request Body | Response | Used By |
|----------|--------|-------------|----------|---------|
| `/api/password/generate` | POST | `{ length, uppercase, numbers, symbols }` | `{ password, entropy_bits }` | Password Generator |
| `/api/password/check-strength` | POST | `{ password }` | `{ breached, breach_count, strength }` | Password Generator |
| `/api/encrypt/text` | POST | `{ text, passphrase }` | `{ ciphertext }` | Text Encryption |
| `/api/decrypt/text` | POST | `{ ciphertext, passphrase }` | `{ plaintext }` | Text Encryption |
| `/api/file/encrypt` | POST | FormData: `file` | `{ key, encrypted_base64, original_size, encrypted_size }` | File Crypto |
| `/api/file/decrypt` | POST | FormData: `file`, `key` | Binary blob | File Crypto |
| `/api/phishing/scan` | POST | `{ url }` | `{ score, level, label, url, page_title, domain_age_days, checks[] }` | Phishing Scanner |
| `/api/pdf/decrypt` | POST | FormData: `pdf_file`, `wordlist` | `{ found, password, attempts, total_passwords, elapsed_seconds }` | PDF Decryptor |

### 10.2 Error Handling Pattern

All API calls follow a consistent error handling pattern:

```javascript
try {
    const res = await fetch(endpoint, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Default error message');
    }
    const data = await res.json();
    // Handle success
    toast.success('Success message');
} catch (e) {
    toast.error(e.message || 'Operation failed');
    // Optional: client-side fallback (password generator)
}
```

### 10.3 Client-Side Fallbacks

| Tool | Fallback Behavior |
|------|-------------------|
| **Password Generator** | Full client-side generation using `crypto.getRandomValues()` |
| **Text Encryption** | No fallback — requires backend for AES-256-GCM |
| **File Crypto** | No fallback — requires backend for Fernet |
| **Phishing Scanner** | No fallback — requires backend for WHOIS/SSL checks |
| **PDF Decryptor** | No fallback — requires backend for pikepdf |
| **Temp Email** | Fully client-side (mock data, no backend API dependency) |

---

## 11. Security Considerations

### 11.1 Frontend Security Measures

| Concern | Mitigation |
|---------|-----------|
| **Password exposure** | Passwords are never logged; clipboard access via `navigator.clipboard` |
| **Key handling** | Fernet keys displayed once with "Keep this safe" warning |
| **Passphrase security** | Passphrase inputs use `type="password"` |
| **XSS prevention** | React's built-in JSX escaping prevents injection |
| **CORS** | API proxy via Next.js rewrites eliminates CORS exposure |
| **No secret storage** | No API keys, tokens, or secrets stored in frontend code |
| **Entropy source** | `crypto.getRandomValues()` for CSPRNG in fallback mode |

### 11.2 Data Flow Security

- **Passwords** — Generated server-side with `secrets` module, transmitted over localhost proxy
- **Encryption keys** — Fernet keys generated server-side, displayed in UI, never stored by frontend
- **Passphrases** — Sent to backend in POST body, used for PBKDF2 derivation, never persisted
- **Files** — Uploaded via FormData, encrypted/decrypted server-side, returned as blob/base64

---

## 12. Deployment & Build Configuration

### 12.1 Development Server

```bash
npm run dev          # Start Next.js dev server (port 3000)
```

**Prerequisites:**
- Node.js 18.17+
- Backend running on port 8000 (for API functionality)

### 12.2 Production Build

```bash
npm run build        # Generate optimized production build
npm run start        # Start production server
```

### 12.3 Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server with Turbopack |
| `build` | `next build` | Production build with optimizations |
| `start` | `next start` | Serve production build |
| `lint` | `eslint` | Code quality checks |

### 12.4 Environment Requirements

| Requirement | Value |
|-------------|-------|
| Node.js | ≥ 18.17.0 |
| npm | ≥ 9.0.0 |
| Backend URL | `http://localhost:8000` (configurable in `next.config.mjs`) |

---

## 13. Appendices

### Appendix A: Route Map

| Route | Page Title | Component |
|-------|-----------|-----------|
| `/` | Dashboard | `DashboardPage` |
| `/password-generator` | Password Generator | `PasswordGeneratorPage` |
| `/text-encryption` | Text Encryption | `TextEncryptionPage` |
| `/file-crypto` | File Encryptor & Decryptor | `FileCryptoPage` |
| `/phishing-scanner` | Phishing Link Scanner | `PhishingScannerPage` |
| `/pdf-decryptor` | PDF Decryptor | `PdfDecryptorPage` |
| `/temp-email` | Temporary Email | `TempEmailPage` |

### Appendix B: Icon Usage Map

| Icon (Lucide) | Usage Context |
|---------------|---------------|
| `ShieldCheck` | Brand logo, mission badge |
| `KeyRound` | Password Generator nav/card |
| `Lock` / `Unlock` | Text Encryption toggle, SSL |
| `FileKey` | File Crypto nav/card, processing |
| `Shield` | Phishing Scanner nav/card, pills |
| `FileText` | PDF Decryptor nav/card |
| `Mail` | Temp Email nav/card |
| `Copy` / `Check` | Copy-to-clipboard with feedback |
| `RefreshCw` | Regenerate, refresh inbox |
| `Search` | Scan URL button |
| `Globe` | URL input prefix, domain check |
| `AlertTriangle` | Warning status |
| `CheckCircle` | Success/safe status |
| `XCircle` | Danger/fail status |
| `Sun` / `Moon` | Theme toggle |
| `Menu` / `X` | Mobile menu open/close |
| `ChevronLeft` | Sidebar collapse toggle |

### Appendix C: CSS Keyframe Animations

| Animation | Duration | Usage |
|-----------|----------|-------|
| `@keyframes spin` | 0.6s linear ∞ | Loading spinners |
| `@keyframes pulse` | 2s ease ∞ | Skeleton loading states |
| Framer `layoutId` | Spring (stiffness: 400, damping: 35) | Sidebar active indicator |
| Framer stagger | 0.07–0.1s delay per item | Dashboard cards, check tiles |
| SVG `strokeDashoffset` | 1.2s ease-out | Phishing score ring |
| Radar pulse | 2s ease-out ∞ (+ 0.5s delay) | Scanning animation |

---

*End of Frontend SRS Document*
