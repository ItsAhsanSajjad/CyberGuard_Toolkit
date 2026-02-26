'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Globe, Lock, Clock, Link2, Eye, AtSign, Hash, FileWarning, Type, Server, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const CHECK_ICONS = {
  'SSL Certificate': Lock,
  'URL Shortener': Link2,
  'Suspicious Keywords': Type,
  'URL Length': Hash,
  'IP Address': Server,
  'Domain Format': Globe,
  'Redirect Trick': AtSign,
  'Subdomain Depth': ExternalLink,
  'File Extension': FileWarning,
  'Typosquatting': Eye,
  'Domain Age': Clock,
};

export default function PhishingScannerPage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [scanPhase, setScanPhase] = useState('');

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to scan');
      return;
    }
    setScanning(true);
    setResult(null);

    // Animated phase labels
    const phases = ['Checking SSL certificate...', 'Analyzing URL structure...', 'Looking up WHOIS data...', 'Fetching page content...', 'Scoring threat level...'];
    let i = 0;
    const interval = setInterval(() => {
      setScanPhase(phases[i % phases.length]);
      i++;
    }, 900);

    try {
      const res = await fetch('/api/phishing/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Scan failed');
      }

      const data = await res.json();
      setResult(data);
      if (data.level === 'safe') toast.success('URL appears safe!');
      else if (data.level === 'warning') toast('⚠️ URL is suspicious');
      else toast.error('⛔ URL appears dangerous!');
    } catch (e) {
      toast.error(e.message || 'Scan failed');
    }
    clearInterval(interval);
    setScanPhase('');
    setScanning(false);
  };

  const statusIcon = (status, size = 18) => {
    const props = { size, strokeWidth: 2.2 };
    if (status === 'safe') return <CheckCircle {...props} style={{ color: 'var(--green)' }} />;
    if (status === 'warning') return <AlertTriangle {...props} style={{ color: 'var(--orange)' }} />;
    return <XCircle {...props} style={{ color: 'var(--red)' }} />;
  };

  const scoreColor = (score) => {
    if (score >= 70) return 'var(--green)';
    if (score >= 40) return 'var(--orange)';
    return 'var(--red)';
  };

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="ps-root">
      {/* ── Header ── */}
      <div className="page-header">
        <h1>Phishing Link Scanner</h1>
        <p>Multi-layered URL threat analysis with real-time WHOIS, SSL, and heuristic checks</p>
      </div>

      {/* ── Feature Pills ── */}
      <div className="ps-pills">
        {['SSL Validation', 'WHOIS Lookup', 'Keyword Analysis', 'Domain Age Check', 'Redirect Detection'].map((t) => (
          <span key={t} className="ps-pill">
            <Shield size={12} />
            {t}
          </span>
        ))}
      </div>

      {/* ── Scanner Card ── */}
      <div className="glass-card-static ps-scanner-card">
        <div className="ps-scanner-inner">
          <div className="ps-input-wrap">
            <Globe size={20} className="ps-input-icon" />
            <input
              type="text"
              className="input-field ps-url-input"
              placeholder="Enter a URL to analyze  (e.g. https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
          </div>
          <button className="btn btn-primary ps-scan-btn" onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <>
                <motion.span className="ps-btn-spinner" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <Search size={18} />
                </motion.span>
                Scanning...
              </>
            ) : (
              <>
                <Search size={18} />
                Scan URL
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Scanning Animation ── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card-static ps-scanning-card"
          >
            <div className="ps-radar-wrap">
              <motion.div
                className="ps-radar-ring ps-radar-ring-1"
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="ps-radar-ring ps-radar-ring-2"
                animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
              <Shield size={28} className="ps-radar-icon" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={scanPhase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="ps-scan-phase"
              >
                {scanPhase}
              </motion.p>
            </AnimatePresence>
            <div className="progress-bar-track" style={{ maxWidth: 360, margin: '8px auto 0' }}>
              <motion.div
                className="progress-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="ps-results"
          >
            {/* Score + Meta */}
            <div className="ps-results-top">
              {/* Circular Score */}
              <div className="glass-card-static ps-score-card">
                <div className="ps-ring-wrapper">
                  <svg width="130" height="130" viewBox="0 0 120 120" className="ps-ring-svg">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke={scoreColor(result.score)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - (result.score / 100) * circumference }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="ps-ring-center">
                    <motion.span
                      className="ps-ring-value"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {result.score}
                    </motion.span>
                    <span className="ps-ring-label">/ 100</span>
                  </div>
                </div>
                <div className={`badge badge-${result.level}`} style={{ marginTop: 16 }}>
                  {statusIcon(result.level, 15)}
                  {result.label}
                </div>
              </div>

              {/* Meta Info */}
              <div className="glass-card-static ps-meta-card">
                <span className="input-label">Scan Details</span>

                <div className="ps-meta-row">
                  <Globe size={16} className="ps-meta-icon" />
                  <div className="ps-meta-content">
                    <span className="ps-meta-key">URL</span>
                    <span className="ps-meta-val">{result.url}</span>
                  </div>
                </div>

                {result.page_title && (
                  <div className="ps-meta-row">
                    <FileWarning size={16} className="ps-meta-icon" />
                    <div className="ps-meta-content">
                      <span className="ps-meta-key">Page Title</span>
                      <span className="ps-meta-val">{result.page_title}</span>
                    </div>
                  </div>
                )}

                {result.domain_age_days != null && (
                  <div className="ps-meta-row">
                    <Clock size={16} className="ps-meta-icon" />
                    <div className="ps-meta-content">
                      <span className="ps-meta-key">Domain Age</span>
                      <span className="ps-meta-val">
                        {result.domain_age_days >= 365
                          ? `${(result.domain_age_days / 365).toFixed(1)} years`
                          : `${result.domain_age_days} days`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="ps-meta-row">
                  <Search size={16} className="ps-meta-icon" />
                  <div className="ps-meta-content">
                    <span className="ps-meta-key">Checks Performed</span>
                    <span className="ps-meta-val">{result.checks.length} security checks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Checks */}
            <div className="glass-card-static ps-checks-card">
              <span className="input-label">Security Analysis</span>
              <div className="ps-checks-grid">
                {result.checks.map((check, i) => {
                  const Icon = CHECK_ICONS[check.label] || Shield;
                  return (
                    <motion.div
                      key={i}
                      className={`ps-check-tile ps-check-${check.status}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="ps-check-top">
                        <div className={`ps-check-icon-wrap ps-icon-${check.status}`}>
                          <Icon size={16} />
                        </div>
                        {statusIcon(check.status, 16)}
                      </div>
                      <span className="ps-check-name">{check.label}</span>
                      <span className="ps-check-desc">{check.detail}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
