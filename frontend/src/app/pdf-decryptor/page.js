'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Key, CheckCircle, Trash2, Lock, Unlock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PdfDecryptorPage() {
    const [mode, setMode] = useState('lock'); // 'lock' | 'unlock'
    const [pdfFile, setPdfFile] = useState(null);
    const [password, setPassword] = useState('');
    const [running, setRunning] = useState(false);
    const [resultBlob, setResultBlob] = useState(null);
    const pdfRef = useRef(null);

    const reset = () => setResultBlob(null);

    const handleSwitchMode = (m) => {
        setMode(m);
        setPdfFile(null);
        setPassword('');
        reset();
    };

    const handleSubmit = async () => {
        if (!pdfFile) { toast.error('Upload a PDF file'); return; }
        if (!password.trim()) { toast.error('Password required'); return; }

        setRunning(true);
        reset();
        const endpoint = mode === 'lock' ? '/api/pdf/encrypt' : '/api/pdf/unlock';
        const outName = (mode === 'lock' ? 'locked_' : 'unlocked_') + pdfFile.name;

        try {
            const fd = new FormData();
            fd.append('pdf_file', pdfFile);
            fd.append('password', password);
            const res = await fetch(endpoint, { method: 'POST', body: fd });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Operation failed');
            }
            const blob = await res.blob();
            setResultBlob({ blob, name: outName });
            toast.success(mode === 'lock' ? 'PDF locked!' : 'PDF unlocked!');
        } catch (e) {
            toast.error(e.message || 'Operation failed');
        }
        setRunning(false);
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob.blob);
        const a = document.createElement('a');
        a.href = url; a.download = resultBlob.name; a.click();
        URL.revokeObjectURL(url);
    };

    const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

    const FileChip = ({ file, onClear }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 12 }}>
            <FileText size={16} style={{ color: 'var(--red)' }} />
            <span>{file.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{fmtSize(file.size)}</span>
            <button className="btn btn-ghost" onClick={onClear}><Trash2 size={14} /></button>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1>PDF Lock & Unlock</h1>
                <p>Lock any PDF with a password, or unlock a password-protected PDF</p>
            </div>

            {/* Mode Toggle */}
            <div className="toggle-group" style={{ maxWidth: 320, marginBottom: 24 }}>
                <button className={`toggle-option ${mode === 'lock' ? 'active' : ''}`} onClick={() => handleSwitchMode('lock')}>
                    <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Lock PDF
                </button>
                <button className={`toggle-option ${mode === 'unlock' ? 'active' : ''}`} onClick={() => handleSwitchMode('unlock')}>
                    <Unlock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Unlock PDF
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* LEFT: input panel */}
                <div className="glass-card-static">
                    <span className="input-label">PDF File</span>
                    <div
                        className="drop-zone"
                        onClick={() => pdfRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setPdfFile(f); }}
                        style={{ marginBottom: 20 }}
                    >
                        <FileText size={32} className="drop-zone-icon" />
                        <div className="drop-zone-text"><span>Upload PDF</span> file</div>
                        <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && setPdfFile(e.target.files[0])} />
                    </div>
                    {pdfFile && <FileChip file={pdfFile} onClear={() => setPdfFile(null)} />}

                    <div style={{ marginTop: 20 }}>
                        <span className="input-label">
                            {mode === 'lock' ? 'Password to Set' : 'PDF Password'}
                        </span>
                        <input
                            type="password"
                            className="input-field"
                            placeholder={mode === 'lock' ? 'Choose a password to lock the PDF...' : 'Enter the PDF password...'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            {mode === 'lock'
                                ? 'Anyone opening the PDF will need this password.'
                                : 'Type the password used to lock this PDF.'}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 24 }}
                        onClick={handleSubmit}
                        disabled={running}
                    >
                        {running ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                                    <Key size={18} />
                                </motion.div>
                                {mode === 'lock' ? 'Locking...' : 'Unlocking...'}
                            </>
                        ) : (
                            <>
                                {mode === 'lock' ? <Lock size={18} /> : <Unlock size={18} />}
                                {mode === 'lock' ? 'Lock PDF' : 'Unlock PDF'}
                            </>
                        )}
                    </button>
                </div>

                {/* RIGHT: result panel */}
                <div className="glass-card-static">
                    <span className="input-label">Result</span>

                    {!running && !resultBlob && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <Key size={40} />
                            <p style={{ marginTop: 12 }}>
                                Upload a PDF and enter a password to {mode === 'lock' ? 'lock' : 'unlock'} it
                            </p>
                        </div>
                    )}

                    {running && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                                <Key size={40} style={{ color: 'var(--cyan)' }} />
                            </motion.div>
                            <p style={{ marginTop: 12 }}>Processing...</p>
                            <div className="progress-bar-track" style={{ maxWidth: 300, margin: '16px auto 0' }}>
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '95%' }}
                                    transition={{ duration: 3, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {resultBlob && !running && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px 0', textAlign: 'center' }}>
                                <CheckCircle size={40} style={{ color: 'var(--green)' }} />
                                <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: 12 }}>
                                    {mode === 'lock' ? 'PDF Locked' : 'PDF Unlocked'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.86rem' }}>
                                    {mode === 'lock'
                                        ? 'Download the locked file. Use the password to open it.'
                                        : 'Download the decrypted file — opens without a password.'}
                                </p>
                                <button className="btn btn-primary" onClick={handleDownload} style={{ marginTop: 18 }}>
                                    <Download size={16} />
                                    Download
                                </button>
                                <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                    {resultBlob.name}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
