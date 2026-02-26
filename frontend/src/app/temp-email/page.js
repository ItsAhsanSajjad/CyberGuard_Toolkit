'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, RefreshCw, Inbox, Clock, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function randomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

const mockEmails = [
    { id: 1, from: 'newsletter@techcorp.com', subject: 'Welcome to TechCorp!', time: '2 min ago', body: 'Thank you for signing up. Your account has been created successfully. Start exploring our platform today.' },
    { id: 2, from: 'no-reply@verify.io', subject: 'Verify your email address', time: '5 min ago', body: 'Please click the link below to verify your email address. This link will expire in 24 hours.\n\nVerification code: 847291' },
    { id: 3, from: 'support@service.net', subject: 'Your temporary access code', time: '8 min ago', body: 'Your one-time access code is: XK7-M2P-9QR\n\nThis code is valid for 10 minutes.' },
];

export default function TempEmailPage() {
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    const [copied, setCopied] = useState(false);
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateEmail = useCallback(() => {
        const domains = ['tempbox.io', 'quickmail.dev', 'dropmail.cc', 'fastmail.tmp'];
        const d = domains[Math.floor(Math.random() * domains.length)];
        const addr = randomString(10) + '@' + d;
        setEmail(addr);
        setDomain(d);
        setEmails([]);
        setSelectedEmail(null);
        toast.success('New email generated!');
    }, []);

    useEffect(() => { generateEmail(); }, [generateEmail]);

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        toast.success('Email copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRefresh = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setEmails(mockEmails);
        setLoading(false);
        toast.success(`${mockEmails.length} emails received!`);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Temporary Email</h1>
                <p>Generate disposable email addresses for anonymous sign-ups and privacy</p>
            </div>

            {/* Email Address Display */}
            <div className="glass-card-static" style={{ marginBottom: 24 }}>
                <span className="input-label">Your Temporary Email</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="result-box" style={{ flex: 1, minWidth: 200 }}>
                        <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle', opacity: 0.6 }} />
                        {email}
                    </div>
                    <button className="btn btn-primary" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn btn-secondary" onClick={generateEmail}>
                        <RefreshCw size={16} />
                        New
                    </button>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Domain: <span style={{ color: 'var(--cyan)' }}>{domain}</span> • This email will auto-expire
                </div>
            </div>

            {/* Inbox */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                <div className="glass-card-static">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <span className="input-label" style={{ marginBottom: 0 }}>
                            <Inbox size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Inbox ({emails.length})
                        </span>
                        <button className="btn btn-ghost" onClick={handleRefresh} disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                            Refresh
                        </button>
                    </div>

                    {emails.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            <Inbox size={36} />
                            <p style={{ marginTop: 12 }}>No emails yet. Click Refresh to check.</p>
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
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedEmail(em)}
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
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{em.from}</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{em.time}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{em.subject}</div>
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
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 12 }}>{selectedEmail.subject}</h3>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> {selectedEmail.from}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {selectedEmail.time}</span>
                            </div>
                            <div style={{ padding: '18px 20px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                                {selectedEmail.body}
                            </div>
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
