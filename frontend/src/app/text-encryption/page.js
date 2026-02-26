'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Copy, Check, ArrowRightLeft, Shield } from 'lucide-react';
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

            {/* Algorithm Badge */}
            <div style={{ marginBottom: 24 }}>
                <span className="te-algo-badge">
                    <Shield size={14} />
                    AES-256-GCM • PBKDF2-HMAC-SHA256
                </span>
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
                            Your passphrase is used to derive a 256-bit key via PBKDF2 (100,000 iterations)
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

            <style jsx>{`
        .te-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .te-algo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(124,58,237,0.10);
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #7c3aed;
          letter-spacing: 0.3px;
        }

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
