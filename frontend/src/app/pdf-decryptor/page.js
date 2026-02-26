'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Key, Play, CheckCircle, XCircle, Trash2, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PdfDecryptorPage() {
    const [pdfFile, setPdfFile] = useState(null);
    const [wordlistFile, setWordlistFile] = useState(null);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const pdfRef = useRef(null);
    const wlRef = useRef(null);

    const handleStart = async () => {
        if (!pdfFile) { toast.error('Upload a PDF file'); return; }
        if (!wordlistFile) { toast.error('Upload a wordlist file'); return; }
        setRunning(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('pdf_file', pdfFile);
            formData.append('wordlist', wordlistFile);

            const res = await fetch('/api/pdf/decrypt', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Decryption failed');
            }

            const data = await res.json();
            setResult(data);

            if (data.found) toast.success(`Password found: ${data.password}`);
            else toast.error('Password not found in wordlist');
        } catch (e) {
            toast.error(e.message || 'Decryption failed');
            setResult(null);
        }
        setRunning(false);
    };

    const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

    const FileChip = ({ file, icon, onClear }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 12 }}>
            {icon}
            <span>{file.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{fmtSize(file.size)}</span>
            <button className="btn btn-ghost" onClick={onClear}><Trash2 size={14} /></button>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1>PDF Decryptor</h1>
                <p>Unlock password-protected PDFs using real dictionary-based attacks with pikepdf</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                <div className="glass-card-static">
                    <span className="input-label">PDF File</span>
                    <div className="drop-zone" onClick={() => pdfRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setPdfFile(f); }} style={{ marginBottom: 20 }}>
                        <FileText size={32} className="drop-zone-icon" />
                        <div className="drop-zone-text"><span>Upload PDF</span> file</div>
                        <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && setPdfFile(e.target.files[0])} />
                    </div>
                    {pdfFile && <FileChip file={pdfFile} icon={<FileText size={16} style={{ color: 'var(--red)' }} />} onClear={() => setPdfFile(null)} />}

                    <span className="input-label" style={{ marginTop: 20 }}>Wordlist File</span>
                    <div className="drop-zone" onClick={() => wlRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setWordlistFile(f); }}>
                        <Key size={32} className="drop-zone-icon" />
                        <div className="drop-zone-text"><span>Upload Wordlist</span> (.txt)</div>
                        <input ref={wlRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={e => e.target.files[0] && setWordlistFile(e.target.files[0])} />
                    </div>
                    {wordlistFile && <FileChip file={wordlistFile} icon={<Key size={16} style={{ color: 'var(--cyan)' }} />} onClear={() => setWordlistFile(null)} />}

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={handleStart} disabled={running}>
                        {running ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Key size={18} /></motion.div>Cracking...</> : <><Play size={18} />Start Decryption</>}
                    </button>
                </div>

                <div className="glass-card-static">
                    <span className="input-label">Result</span>
                    {!running && !result && <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><Key size={40} /><p style={{ marginTop: 12 }}>Upload files and start to see results</p></div>}

                    {running && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                                <Key size={40} style={{ color: 'var(--cyan)' }} />
                            </motion.div>
                            <p style={{ marginTop: 12 }}>Trying passwords from wordlist...</p>
                            <div className="progress-bar-track" style={{ maxWidth: 300, margin: '16px auto 0' }}>
                                <motion.div
                                    className="progress-bar-fill"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '95%' }}
                                    transition={{ duration: 10, ease: 'linear' }}
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {result && !running && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px 0' }}>
                                {result.found ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <CheckCircle size={40} style={{ color: 'var(--green)' }} />
                                        <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: 12 }}>Password Found!</h3>
                                        <div className="result-box" style={{ marginTop: 16, textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                                            {result.password}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <XCircle size={40} style={{ color: 'var(--red)' }} />
                                        <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: 12 }}>Password Not Found</h3>
                                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Try a larger wordlist</p>
                                    </div>
                                )}

                                {/* Stats */}
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                                    <div className="pdf-stat">
                                        <Zap size={14} />
                                        <span>{result.attempts} / {result.total_passwords} tried</span>
                                    </div>
                                    <div className="pdf-stat">
                                        <Clock size={14} />
                                        <span>{result.elapsed_seconds}s elapsed</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
        .pdf-stat {
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
      `}</style>
        </div>
    );
}
