'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, RefreshCw, Inbox, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'cstk_temp_email_session';

function formatTime(iso) {
    try {
        const d = new Date(iso);
        const diff = (Date.now() - d.getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
        return d.toLocaleString();
    } catch { return ''; }
}

export default function TempEmailPage() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState(false);
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const pollRef = useRef(null);

    const createMailbox = useCallback(async () => {
        setCreating(true);
        setEmails([]);
        setSelectedEmail(null);
        try {
            const res = await fetch('/api/temp-email/create', { method: 'POST' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Could not create mailbox');
            }
            const data = await res.json();
            setEmail(data.address);
            setToken(data.token);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: data.address, token: data.token }));
            toast.success('New temporary email ready!');
        } catch (e) {
            toast.error(e.message || 'Could not create mailbox');
        }
        setCreating(false);
    }, []);

    const refreshInbox = useCallback(async (silent = false) => {
        if (!token) return;
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`/api/temp-email/messages?token=${encodeURIComponent(token)}`);
            if (!res.ok) {
                if (!silent) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Could not load inbox');
                }
                return;
            }
            const data = await res.json();
            setEmails(data.messages || []);
            if (!silent) {
                if ((data.messages || []).length === 0) toast('Inbox is empty');
                else toast.success(`${data.messages.length} message(s)`);
            }
        } catch (e) {
            if (!silent) toast.error(e.message || 'Could not load inbox');
        }
        if (!silent) setLoading(false);
    }, [token]);

    const openEmail = async (em) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/temp-email/messages/${em.id}?token=${encodeURIComponent(token)}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Could not open message');
            }
            const data = await res.json();
            setSelectedEmail({ ...em, ...data });
        } catch (e) {
            toast.error(e.message || 'Could not open message');
        }
    };

    // On mount: restore saved session or create new mailbox
    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
            try {
                const { address, token } = JSON.parse(saved);
                if (address && token) {
                    setEmail(address);
                    setToken(token);
                    return;
                }
            } catch { /* fall through to create new */ }
        }
        createMailbox();
    }, [createMailbox]);

    // Poll every 10s while session active
    useEffect(() => {
        if (!token) return;
        refreshInbox(true);
        pollRef.current = setInterval(() => refreshInbox(true), 10000);
        return () => clearInterval(pollRef.current);
    }, [token, refreshInbox]);

    const handleCopy = () => {
        if (!email) return;
        navigator.clipboard.writeText(email);
        setCopied(true);
        toast.success('Email copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNew = () => {
        localStorage.removeItem(STORAGE_KEY);
        createMailbox();
    };

    const domain = email ? email.split('@')[1] : '';

    return (
        <div>
            <div className="page-header">
                <h1>Temporary Email</h1>
                <p>Real disposable email inbox. Receive verification codes, signup emails, and OTPs without exposing your real address.</p>
            </div>

            {/* Email Address Display */}
            <div className="glass-card-static" style={{ marginBottom: 24 }}>
                <span className="input-label">Your Temporary Email</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="result-box" style={{ flex: 1, minWidth: 200 }}>
                        <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle', opacity: 0.6 }} />
                        {email || (creating ? 'Creating mailbox...' : 'Loading...')}
                    </div>
                    <button className="btn btn-primary" onClick={handleCopy} disabled={!email}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleNew} disabled={creating}>
                        <RefreshCw size={16} />
                        New
                    </button>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Domain: <span style={{ color: 'var(--cyan)' }}>{domain || '—'}</span> • Inbox auto-refreshes every 10s • Powered by mail.tm
                </div>
            </div>

            {/* Inbox + Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                <div className="glass-card-static">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="input-label" style={{ marginBottom: 0 }}>
                            <Inbox size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Inbox ({emails.length})
                        </span>
                        <button className="btn btn-ghost" onClick={() => refreshInbox(false)} disabled={loading || !token}>
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                            Refresh
                        </button>
                    </div>

                    {emails.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <Inbox size={36} />
                            <p style={{ marginTop: 12 }}>Waiting for emails... Send something to your address.</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <RefreshCw size={28} />
                            </motion.div>
                            <p style={{ marginTop: 12 }}>Checking for new emails...</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {emails.map((em, i) => (
                            <motion.div
                                key={em.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => openEmail(em)}
                                style={{
                                    padding: '14px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                    transition: 'background 0.2s', marginBottom: 2,
                                    background: selectedEmail?.id === em.id ? 'var(--cyan-dim)' : 'transparent',
                                    borderLeft: selectedEmail?.id === em.id ? '3px solid var(--cyan)' : '3px solid transparent',
                                }}
                                onMouseEnter={e => { if (selectedEmail?.id !== em.id) e.currentTarget.style.background = 'var(--bg-input)'; }}
                                onMouseLeave={e => { if (selectedEmail?.id !== em.id) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {em.from_name || em.from}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatTime(em.created_at)}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{em.subject || '(no subject)'}</div>
                                {em.intro && (
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {em.intro}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Email Detail */}
                <div className="glass-card-static">
                    <span className="input-label">Email Detail</span>
                    {!selectedEmail ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <Mail size={36} />
                            <p style={{ marginTop: 12 }}>Select an email to view</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 12 }}>
                                {selectedEmail.subject || '(no subject)'}
                            </h3>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <User size={14} /> {selectedEmail.from_name || selectedEmail.from}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} /> {formatTime(selectedEmail.created_at)}
                                </span>
                            </div>
                            {selectedEmail.html && selectedEmail.html.length > 0 ? (
                                <div
                                    style={{ padding: '18px 20px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', maxHeight: 400, overflowY: 'auto' }}
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.html.join('') }}
                                />
                            ) : (
                                <div style={{ padding: '18px 20px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', maxHeight: 400, overflowY: 'auto' }}>
                                    {selectedEmail.text || '(empty)'}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
