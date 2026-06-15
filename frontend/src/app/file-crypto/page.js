'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileKey, Download, Key, Copy, Check, Lock, Unlock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FileCryptoPage() {
    const [mode, setMode] = useState('encrypt');
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('');
    const [generatedKey, setGeneratedKey] = useState('');
    const [result, setResult] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleProcess = async () => {
        if (!file) {
            toast.error('Please upload a file first');
            return;
        }
        if (mode === 'decrypt' && !key.trim()) {
            toast.error('Decryption key is required');
            return;
        }

        setProcessing(true);
        try {
            if (mode === 'encrypt') {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/file/encrypt', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Encryption failed');
                }

                const data = await res.json();
                setGeneratedKey(data.key);

                // Convert base64 encrypted data to blob for download
                const binaryStr = atob(data.encrypted_base64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/octet-stream' });

                setResult({
                    blob,
                    name: `encrypted_${file.name}`,
                    originalSize: data.original_size,
                    encryptedSize: data.encrypted_size,
                });
                toast.success('File encrypted with Fernet (AES-128-CBC + HMAC)!');
            } else {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('key', key);

                const res = await fetch('/api/file/decrypt', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Decryption failed — wrong key?');
                }

                const blob = await res.blob();
                setResult({
                    blob,
                    name: `decrypted_${file.name}`,
                });
                setGeneratedKey('');
                toast.success('File decrypted successfully!');
            }
        } catch (e) {
            toast.error(e.message || 'Operation failed');
        }
        setProcessing(false);
    };

    const handleDownload = () => {
        if (!result) return;
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        toast.success('Key copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div>
            <div className="page-header">
                <h1>File Encryptor & Decryptor</h1>
                <p>Lock or unlock any file with a single key. Tamper detection built in.</p>
            </div>

            {/* Mode Toggle */}
            <div className="toggle-group" style={{ maxWidth: 320, marginBottom: 28 }}>
                <button
                    className={`toggle-option ${mode === 'encrypt' ? 'active' : ''}`}
                    onClick={() => { setMode('encrypt'); setResult(null); setGeneratedKey(''); }}
                >
                    <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Encrypt
                </button>
                <button
                    className={`toggle-option ${mode === 'decrypt' ? 'active' : ''}`}
                    onClick={() => { setMode('decrypt'); setResult(null); setGeneratedKey(''); }}
                >
                    <Unlock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Decrypt
                </button>
            </div>

            <div className="fc-layout">
                {/* Upload */}
                <div className="glass-card-static">
                    <span className="input-label">Upload File</span>
                    <div
                        className={`drop-zone ${dragOver ? 'dragover' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={36} className="drop-zone-icon" />
                        <div className="drop-zone-text">
                            <span>Click to upload</span> or drag and drop
                        </div>
                        <div className="drop-zone-hint">Any file type (max 50 MB)</div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    {file && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="file-info"
                        >
                            <FileKey size={20} style={{ color: 'var(--cyan)' }} />
                            <div className="file-info-details">
                                <span className="file-info-name">{file.name}</span>
                                <span className="file-info-size">{formatSize(file.size)}</span>
                            </div>
                            <button className="btn btn-ghost" onClick={() => { setFile(null); setResult(null); }}>
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    )}

                    {/* Key Input for Decrypt */}
                    {mode === 'decrypt' && (
                        <div style={{ marginTop: 20 }}>
                            <span className="input-label">Decryption Key (Fernet)</span>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Paste your Fernet encryption key here..."
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={handleProcess}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="spinner" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {mode === 'encrypt' ? <Lock size={18} /> : <Unlock size={18} />}
                                {mode === 'encrypt' ? 'Encrypt File' : 'Decrypt File'}
                            </>
                        )}
                    </button>
                </div>

                {/* Result */}
                <div className="glass-card-static">
                    <span className="input-label">Result</span>

                    {!result && !processing && (
                        <div className="fc-empty">
                            <Key size={40} style={{ color: 'var(--text-muted)' }} />
                            <p>Upload a file and click process to see results</p>
                        </div>
                    )}

                    {processing && (
                        <div className="fc-empty">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <FileKey size={40} style={{ color: 'var(--cyan)' }} />
                            </motion.div>
                            <p>{mode === 'encrypt' ? 'Encrypting' : 'Decrypting'} your file...</p>
                            <div className="progress-bar-track" style={{ maxWidth: 300, margin: '16px auto 0' }}>
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '90%' }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>
                        </div>
                    )}

                    {result && !processing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="fc-success">
                                <div className="badge badge-safe" style={{ marginBottom: 16 }}>
                                    ✓ {mode === 'encrypt' ? 'Encryption' : 'Decryption'} Complete
                                </div>
                                <p className="fc-result-filename">{result.name}</p>
                            </div>

                            {generatedKey && (
                                <div style={{ marginTop: 20 }}>
                                    <span className="input-label">Your Encryption Key (save this!)</span>
                                    <div className="result-box" style={{ fontSize: '0.82rem' }}>
                                        {generatedKey}
                                        <span className="copy-hint">Keep this safe — you need it to decrypt</span>
                                    </div>
                                    <button className="btn btn-secondary" onClick={handleCopyKey} style={{ marginTop: 10 }}>
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy Key'}
                                    </button>
                                </div>
                            )}

                            <button className="btn btn-primary" onClick={handleDownload} style={{ width: '100%', marginTop: 20 }}>
                                <Download size={18} />
                                Download {mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} File
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Algorithm chip — animates in below the action area */}
            <div className="fc-algo-wrap">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.94 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className={`fc-algo-chip fc-algo-${mode}`}
                    >
                        <span className="fc-algo-shine" aria-hidden />
                        <span className="fc-algo-dot" />
                        <div className="fc-algo-left">
                            <span className="fc-algo-mode">
                                {mode === 'encrypt' ? 'LOCK MODE' : 'UNLOCK MODE'}
                            </span>
                            <span className="fc-algo-name">Fernet</span>
                        </div>
                        <span className="fc-algo-sep" />
                        <div className="fc-algo-spec">
                            <div className="fc-algo-spec-row">
                                <span className="fc-algo-spec-label">Encryption:</span>
                                <span className="fc-algo-spec-val">AES-128-CBC</span>
                            </div>
                            <div className="fc-algo-spec-row">
                                <span className="fc-algo-spec-label">Integrity:</span>
                                <span className="fc-algo-spec-val">HMAC-SHA-256</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <style jsx>{`
        .fc-algo-wrap {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          margin-bottom: 8px;
        }

        .fc-algo-chip {
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

        .fc-algo-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 1.2;
        }
        :global([data-theme="light"]) .fc-algo-chip {
          background: linear-gradient(120deg, rgba(10, 116, 255, 0.08), rgba(0, 188, 212, 0.05));
          border-color: rgba(10, 116, 255, 0.28);
          box-shadow:
            0 0 0 4px rgba(10, 116, 255, 0.05),
            0 6px 18px rgba(10, 116, 255, 0.12);
        }

        /* Mode-specific accent border tint */
        .fc-algo-encrypt { border-color: rgba(0, 240, 255, 0.45); }
        .fc-algo-decrypt { border-color: rgba(124, 58, 237, 0.45); }
        :global([data-theme="light"]) .fc-algo-encrypt { border-color: rgba(10, 116, 255, 0.4); }
        :global([data-theme="light"]) .fc-algo-decrypt { border-color: rgba(124, 58, 237, 0.4); }

        /* Sweeping shine on mode change */
        .fc-algo-shine {
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
          animation: fcShine 1.4s ease-out 1;
        }
        @keyframes fcShine {
          0%   { left: -60%; }
          100% { left: 130%; }
        }

        .fc-algo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.9), 0 0 18px rgba(0, 240, 255, 0.5);
          animation: fcDotPulse 1.6s ease-in-out infinite;
          flex-shrink: 0;
        }
        .fc-algo-decrypt .fc-algo-dot {
          background: #b794f4;
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.85), 0 0 18px rgba(167, 139, 250, 0.45);
        }
        :global([data-theme="light"]) .fc-algo-dot {
          background: #0a74ff;
          box-shadow: 0 0 10px rgba(10, 116, 255, 0.8);
        }
        :global([data-theme="light"]) .fc-algo-decrypt .fc-algo-dot {
          background: #7c3aed;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.7);
        }
        @keyframes fcDotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }

        .fc-algo-mode {
          color: var(--text-primary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-size: 0.74rem;
        }

        .fc-algo-sep {
          width: 1px;
          height: 34px;
          background: linear-gradient(180deg, transparent, rgba(125, 180, 255, 0.45) 50%, transparent);
          flex-shrink: 0;
        }
        :global([data-theme="light"]) .fc-algo-sep {
          background: linear-gradient(180deg, transparent, rgba(15, 35, 75, 0.25) 50%, transparent);
        }

        .fc-algo-name {
          color: var(--cyan);
          font-weight: 700;
          font-size: 0.92rem;
          letter-spacing: 0.1px;
        }
        .fc-algo-decrypt .fc-algo-name { color: #b794f4; }
        :global([data-theme="light"]) .fc-algo-name { color: #0a74ff; }
        :global([data-theme="light"]) .fc-algo-decrypt .fc-algo-name { color: #7c3aed; }

        .fc-algo-spec {
          display: flex;
          flex-direction: column;
          gap: 5px;
          line-height: 1.3;
        }
        .fc-algo-spec-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          white-space: nowrap;
          font-size: 0.78rem;
          letter-spacing: 0.2px;
        }
        .fc-algo-spec-label {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .fc-algo-spec-val {
          color: var(--text-primary);
          font-family: var(--font-mono, ui-monospace, SFMono-Regular, monospace);
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        :global([data-theme="light"]) .fc-algo-spec-label { color: #64748b; }
        :global([data-theme="light"]) .fc-algo-spec-val { color: #0f172a; }

        @media (max-width: 640px) {
          .fc-algo-chip {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 22px;
          }
          .fc-algo-sep {
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(125, 180, 255, 0.35) 50%, transparent);
          }
          :global([data-theme="light"]) .fc-algo-sep {
            background: linear-gradient(90deg, transparent, rgba(15, 35, 75, 0.2) 50%, transparent);
          }
        }

        .fc-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          margin-top: 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .file-info-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .file-info-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .file-info-size {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .fc-empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--text-muted);
        }

        .fc-empty p {
          margin-top: 12px;
          font-size: 0.88rem;
        }

        .fc-success {
          text-align: center;
          padding: 20px 0;
        }

        .fc-result-filename {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @media (max-width: 768px) {
          .fc-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
