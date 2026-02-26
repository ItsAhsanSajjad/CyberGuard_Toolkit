'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Copy, RefreshCw, Check, History, ShieldAlert, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

function getLocalStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = ['weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];
    const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { score, level: levels[score], label: labels[score] };
}

export default function PasswordGeneratorPage() {
    const [length, setLength] = useState(16);
    const [upper, setUpper] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);
    const [entropy, setEntropy] = useState(null);
    const [breached, setBreached] = useState(null);
    const [breachCount, setBreachCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/password/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ length, uppercase: upper, numbers, symbols }),
            });
            if (!res.ok) throw new Error('Backend error');
            const data = await res.json();
            setPassword(data.password);
            setEntropy(data.entropy_bits);
            setCopied(false);
            setHistory((prev) => [data.password, ...prev].slice(0, 10));

            // Check breach status
            const bRes = await fetch('/api/password/check-strength', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: data.password }),
            });
            if (bRes.ok) {
                const bData = await bRes.json();
                setBreached(bData.breached);
                setBreachCount(bData.breach_count);
            }
        } catch {
            // Fallback to client-side generation
            let chars = 'abcdefghijklmnopqrstuvwxyz';
            if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (numbers) chars += '0123456789';
            if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            let pwd = '';
            const arr = new Uint32Array(length);
            crypto.getRandomValues(arr);
            for (let i = 0; i < length; i++) pwd += chars[arr[i] % chars.length];
            setPassword(pwd);
            setCopied(false);
            setHistory((prev) => [pwd, ...prev].slice(0, 10));
            setEntropy(null);
            setBreached(null);
            toast.error('Backend unavailable — generated locally');
        }
        setLoading(false);
    }, [length, upper, numbers, symbols]);

    const handleCopy = useCallback(() => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        toast.success('Password copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    }, [password]);

    const strength = password ? getLocalStrength(password) : null;

    return (
        <div>
            <div className="page-header">
                <h1>Password Generator</h1>
                <p>Generate cryptographically secure passwords with real-time strength analysis</p>
            </div>

            <div className="pg-layout">
                {/* Controls */}
                <div className="glass-card-static pg-controls">
                    {/* Length Slider */}
                    <div className="section">
                        <div className="slider-header">
                            <span className="input-label">Password Length</span>
                            <span className="slider-value">{length}</span>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="128"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="range-slider"
                        />
                        <div className="slider-range">
                            <span>4</span>
                            <span>128</span>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="section">
                        <span className="input-label">Character Options</span>
                        <div className="switch-row">
                            <span className="switch-label">Uppercase Letters (A-Z)</span>
                            <label className="switch">
                                <input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} />
                                <span className="switch-slider"></span>
                            </label>
                        </div>
                        <div className="switch-row">
                            <span className="switch-label">Numbers (0-9)</span>
                            <label className="switch">
                                <input type="checkbox" checked={numbers} onChange={() => setNumbers(!numbers)} />
                                <span className="switch-slider"></span>
                            </label>
                        </div>
                        <div className="switch-row">
                            <span className="switch-label">Special Characters (!@#$)</span>
                            <label className="switch">
                                <input type="checkbox" checked={symbols} onChange={() => setSymbols(!symbols)} />
                                <span className="switch-slider"></span>
                            </label>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate} disabled={loading}>
                        {loading ? <><span className="spinner" /> Generating...</> : <><RefreshCw size={18} /> Generate Password</>}
                    </button>
                </div>

                {/* Result */}
                <div className="pg-result-area">
                    <div className="glass-card-static">
                        <span className="input-label">Generated Password</span>
                        <AnimatePresence mode="wait">
                            {password ? (
                                <motion.div
                                    key={password}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="result-box"
                                    onClick={handleCopy}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {password}
                                    <span className="copy-hint">Click to copy</span>
                                </motion.div>
                            ) : (
                                <div className="result-box" style={{ color: 'var(--text-muted)' }}>
                                    Click &quot;Generate Password&quot; to create a secure password
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Copy Button */}
                        <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary" onClick={handleCopy} disabled={!password}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                        </div>

                        {/* Entropy & Breach Info */}
                        {entropy !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}
                            >
                                <div className="pg-info-badge">
                                    <KeyRound size={14} />
                                    <span>{entropy} bits entropy</span>
                                </div>
                                {breached !== null && (
                                    <div className={`pg-info-badge ${breached ? 'pg-badge-danger' : 'pg-badge-safe'}`}>
                                        {breached ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                        <span>{breached ? `Breached (${breachCount.toLocaleString()}×)` : 'Not breached'}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Strength Meter */}
                        {strength && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 20 }}
                            >
                                <span className="input-label">Strength</span>
                                <div className="strength-meter">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`strength-bar ${i <= strength.score - 1 ? `active ${strength.level}` : ''}`}
                                        />
                                    ))}
                                </div>
                                <div className={`strength-label ${strength.level}`}>{strength.label}</div>
                            </motion.div>
                        )}
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <motion.div
                            className="glass-card-static"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ marginTop: 20 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <History size={16} style={{ color: 'var(--text-secondary)' }} />
                                <span className="input-label" style={{ marginBottom: 0 }}>
                                    Recent Passwords
                                </span>
                            </div>
                            {history.map((pwd, i) => (
                                <div
                                    key={i}
                                    className="history-item"
                                    onClick={() => {
                                        navigator.clipboard.writeText(pwd);
                                        toast.success('Copied!');
                                    }}
                                >
                                    <span className="history-pwd">{pwd}</span>
                                    <Copy size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .pg-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
          align-items: start;
        }

        .pg-controls {
          position: sticky;
          top: 32px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .slider-value {
          font-family: var(--font-mono);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--cyan);
        }

        .slider-range {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .pg-info-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .pg-badge-safe {
          background: rgba(22,163,74,0.10);
          border-color: rgba(22,163,74,0.25);
          color: #16a34a;
        }

        .pg-badge-danger {
          background: rgba(220,38,38,0.10);
          border-color: rgba(220,38,38,0.25);
          color: #dc2626;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background 0.2s;
        }

        .history-item:hover {
          background: var(--bg-input);
        }

        .history-pwd {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .pg-layout {
            grid-template-columns: 1fr;
          }

          .pg-controls {
            position: static;
          }
        }
      `}</style>
        </div>
    );
}
