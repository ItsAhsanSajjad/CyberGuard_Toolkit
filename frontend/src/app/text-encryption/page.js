'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Copy, Check, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TextEncryptionPage() {
    const [mode, setMode] = useState('encrypt');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [copied, setCopied] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleProcess = async () => {
        if (!inputText.trim()) {
            toast.error('Please enter some text');
            return;
        }
        if (!passphrase.trim()) {
            toast.error('Please enter a passphrase');
            return;
        }

        setProcessing(true);
        try {
            const endpoint = mode === 'encrypt' ? '/api/encrypt/text' : '/api/decrypt/text';
            const body = mode === 'encrypt'
                ? { text: inputText, passphrase }
                : { ciphertext: inputText, passphrase };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Operation failed');
            }

            const data = await res.json();
            setOutputText(mode === 'encrypt' ? data.ciphertext : data.plaintext);
            toast.success(mode === 'encrypt' ? 'Message encrypted with AES-256-GCM!' : 'Message decrypted!');
        } catch (e) {
            toast.error(e.message || 'Operation failed — check your passphrase');
        }
        setProcessing(false);
    };

    const handleSwap = () => {
        setInputText(outputText);
        setOutputText('');
        setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
    };

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Text Encryption</h1>
                <p>Encrypt and decrypt messages using AES-256-GCM with PBKDF2 key derivation</p>
            </div>

            {/* Mode Toggle */}
            <div className="toggle-group" style={{ maxWidth: 320, marginBottom: 28 }}>
                <button
                    className={`toggle-option ${mode === 'encrypt' ? 'active' : ''}`}
                    onClick={() => setMode('encrypt')}
                >
                    <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Encrypt
                </button>
                <button
                    className={`toggle-option ${mode === 'decrypt' ? 'active' : ''}`}
                    onClick={() => setMode('decrypt')}
                >
                    <Unlock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Decrypt
                </button>
            </div>

            <div className="te-layout">
                {/* Input */}
                <div className="glass-card-static">
                    <span className="input-label">{mode === 'encrypt' ? 'Plaintext Message' : 'Encrypted Ciphertext'}</span>
                    <textarea
                        className="input-field"
                        placeholder={mode === 'encrypt' ? 'Type your message to encrypt...' : 'Paste the base64 ciphertext here...'}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={6}
                    />

                    {/* Passphrase */}
                    <div style={{ marginTop: 18 }}>
                        <span className="input-label">Passphrase (Encryption Key)</span>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter a strong passphrase..."
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                        />
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            Your passphrase is used to derive a 256-bit key via PBKDF2 (600,000 iterations)
                        </div>
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={handleProcess} disabled={processing}>
                            {processing ? (
                                <><span className="te-spinner" /> Processing...</>
                            ) : (
                                <>{mode === 'encrypt' ? <Lock size={16} /> : <Unlock size={16} />}
                                    {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</>
                            )}
                        </button>
                        <button className="btn btn-secondary" onClick={handleSwap} disabled={!outputText}>
                            <ArrowRightLeft size={16} />
                            Swap
                        </button>
                    </div>
                </div>

                {/* Output */}
                <div className="glass-card-static">
                    <span className="input-label">{mode === 'encrypt' ? 'Encrypted Result (Base64)' : 'Decrypted Plaintext'}</span>
                    {outputText ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="result-box"
                            style={{ minHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                        >
                            {outputText}
                        </motion.div>
                    ) : (
                        <div className="result-box" style={{ minHeight: 120, color: 'var(--text-muted)' }}>
                            Result will appear here...
                        </div>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={handleCopy}
                        disabled={!outputText}
                        style={{ marginTop: 14 }}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Result'}
                    </button>
                </div>
            </div>

            {/* Algorithm chip — animates in below the action area */}
            <div className="te-algo-wrap">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.94 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className={`te-algo-chip te-algo-${mode}`}
                    >
                        <span className="te-algo-shine" aria-hidden />
                        <span className="te-algo-dot" />
                        <div className="te-algo-left">
                            <span className="te-algo-mode">
                                {mode === 'encrypt' ? 'ENCRYPT MODE' : 'DECRYPT MODE'}
                            </span>
                            <span className="te-algo-name">AES-256-GCM</span>
                        </div>
                        <span className="te-algo-sep" />
                        <div className="te-algo-spec">
                            <div className="te-algo-spec-row">
                                <span className="te-algo-spec-label">Key derivation:</span>
                                <span className="te-algo-spec-val">PBKDF2-HMAC-SHA-256</span>
                            </div>
                            <div className="te-algo-spec-row">
                                <span className="te-algo-spec-label">Iterations:</span>
                                <span className="te-algo-spec-val">600,000</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
        .te-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .te-algo-wrap {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          margin-bottom: 8px;
        }

        .te-algo-chip {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 14px 26px;
          background: linear-gradient(120deg, rgba(0, 240, 255, 0.10), rgba(10, 116, 255, 0.06));
          border: 1px solid rgba(0, 240, 255, 0.32);
          border-radius: 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.2px;
          box-shadow:
            0 0 0 4px rgba(0, 240, 255, 0.05),
            0 8px 22px rgba(0, 200, 255, 0.18);
          overflow: hidden;
          backdrop-filter: blur(6px);
        }
        :global([data-theme="light"]) .te-algo-chip {
          background: linear-gradient(120deg, rgba(10, 116, 255, 0.08), rgba(0, 188, 212, 0.05));
          border-color: rgba(10, 116, 255, 0.28);
          box-shadow:
            0 0 0 4px rgba(10, 116, 255, 0.05),
            0 6px 18px rgba(10, 116, 255, 0.12);
        }

        .te-algo-encrypt { border-color: rgba(0, 240, 255, 0.45); }
        .te-algo-decrypt { border-color: rgba(124, 58, 237, 0.45); }
        :global([data-theme="light"]) .te-algo-encrypt { border-color: rgba(10, 116, 255, 0.4); }
        :global([data-theme="light"]) .te-algo-decrypt { border-color: rgba(124, 58, 237, 0.4); }

        .te-algo-shine {
          position: absolute;
          top: 0;
          left: -50%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.22) 50%,
            transparent 75%);
          pointer-events: none;
          animation: teShine 1.4s ease-out 1;
        }
        @keyframes teShine {
          0%   { left: -60%; }
          100% { left: 130%; }
        }

        .te-algo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.9), 0 0 18px rgba(0, 240, 255, 0.5);
          animation: teDotPulse 1.6s ease-in-out infinite;
          flex-shrink: 0;
        }
        .te-algo-decrypt .te-algo-dot {
          background: #b794f4;
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.85), 0 0 18px rgba(167, 139, 250, 0.45);
        }
        :global([data-theme="light"]) .te-algo-dot {
          background: #0a74ff;
          box-shadow: 0 0 10px rgba(10, 116, 255, 0.8);
        }
        :global([data-theme="light"]) .te-algo-decrypt .te-algo-dot {
          background: #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.7);
        }
        @keyframes teDotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }

        .te-algo-mode {
          color: var(--text-primary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-size: 0.74rem;
        }

        .te-algo-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 1.2;
        }

        .te-algo-sep {
          width: 1px;
          height: 34px;
          background: linear-gradient(180deg, transparent, rgba(125, 180, 255, 0.45) 50%, transparent);
          flex-shrink: 0;
        }
        :global([data-theme="light"]) .te-algo-sep {
          background: linear-gradient(180deg, transparent, rgba(15, 35, 75, 0.25) 50%, transparent);
        }

        .te-algo-name {
          color: var(--cyan);
          font-weight: 700;
          font-size: 0.92rem;
          letter-spacing: 0.1px;
        }
        .te-algo-decrypt .te-algo-name { color: #b794f4; }
        :global([data-theme="light"]) .te-algo-name { color: #0a74ff; }
        :global([data-theme="light"]) .te-algo-decrypt .te-algo-name { color: #7c3aed; }

        .te-algo-spec {
          display: flex;
          flex-direction: column;
          gap: 5px;
          line-height: 1.3;
        }
        .te-algo-spec-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          white-space: nowrap;
          font-size: 0.78rem;
          letter-spacing: 0.2px;
        }
        .te-algo-spec-label {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .te-algo-spec-val {
          color: var(--text-primary);
          font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        :global([data-theme="light"]) .te-algo-spec-label { color: #64748b; }
        :global([data-theme="light"]) .te-algo-spec-val { color: #0f172a; }

        @media (max-width: 640px) {
          .te-algo-chip {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 22px;
          }
          .te-algo-sep {
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(125, 180, 255, 0.35) 50%, transparent);
          }
          :global([data-theme="light"]) .te-algo-sep {
            background: linear-gradient(90deg, transparent, rgba(15, 35, 75, 0.2) 50%, transparent);
          }
        }
        :global([data-theme="light"]) .te-algo-spec { color: #64748b; }

        .te-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .te-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
