'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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
                <p>Protect your files with Fernet symmetric encryption (AES-128-CBC + HMAC-SHA256)</p>
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

            <style jsx>{`
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
