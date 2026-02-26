'use client';

import { motion } from 'framer-motion';
import {
  KeyRound,
  Lock,
  FileKey,
  Shield,
  FileText,
  Mail,
  ShieldCheck,
  Zap,
  Lock as LockIcon,
  ScanEye,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    href: '/password-generator',
    icon: KeyRound,
    title: 'Password Generator',
    desc: 'Generate ultra-secure passwords with customizable length, complexity, and real-time strength analysis.',
    color: '#00bcd4',
    bg: 'rgba(0,188,212,0.10)',
    border: 'rgba(0,188,212,0.18)',
  },
  {
    href: '/text-encryption',
    icon: Lock,
    title: 'Text Encryption',
    desc: 'Encrypt and decrypt messages using substitution cipher with adjustable shift keys.',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    border: 'rgba(124,58,237,0.18)',
  },
  {
    href: '/file-crypto',
    icon: FileKey,
    title: 'File Encryptor',
    desc: 'Protect your files with Fernet symmetric encryption. Upload, encrypt, and download securely.',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.10)',
    border: 'rgba(22,163,74,0.18)',
  },
  {
    href: '/phishing-scanner',
    icon: Shield,
    title: 'Phishing Scanner',
    desc: 'Analyze URLs for phishing threats, suspicious patterns, and security risks in real-time.',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.10)',
    border: 'rgba(234,88,12,0.18)',
  },
  {
    href: '/pdf-decryptor',
    icon: FileText,
    title: 'PDF Decryptor',
    desc: 'Unlock password-protected PDFs using dictionary-based wordlist attacks with progress tracking.',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.10)',
    border: 'rgba(220,38,38,0.18)',
  },
  {
    href: '/temp-email',
    icon: Mail,
    title: 'Temp Email',
    desc: 'Generate disposable email addresses instantly for anonymous sign-ups and privacy protection.',
    color: '#ca8a04',
    bg: 'rgba(202,138,4,0.10)',
    border: 'rgba(202,138,4,0.18)',
  },
];

const stats = [
  { value: '6', label: 'Security Tools', icon: Zap },
  { value: '256-bit', label: 'Encryption', icon: LockIcon },
  { value: 'Real-time', label: 'Threat Scanning', icon: ScanEye },
];

export default function DashboardPage() {
  return (
    <div className="dash-root">
      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="dash-badge">
          <ShieldCheck size={13} />
          <span>Cybersecurity Suite</span>
        </div>
        <h1 className="dash-title">
          <span className="dash-gradient">CyberGuard</span> Toolkit
        </h1>
        <p className="dash-subtitle">
          Your comprehensive cybersecurity arsenal — encrypt data, generate secure passwords,
          detect phishing threats, and protect your digital assets.
        </p>
        <div className="dash-actions">
          <Link href="/password-generator" className="btn btn-primary">
            <Zap size={16} /> Get Started
          </Link>
          <a href="#features" className="btn btn-secondary">Explore Tools</a>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="dash-stats">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="dash-stat-card glass-card-static"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Icon size={20} className="dash-stat-icon" />
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Security Tools ── */}
      <div id="features" className="dash-section">
        <h2 className="dash-section-title">Security Tools</h2>
        <div className="dash-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                style={{ display: 'flex' }}
              >
                <Link href={f.href} className="dash-card glass-card">
                  <div
                    className="dash-card-icon"
                    style={{
                      background: f.bg,
                      border: `1px solid ${f.border}`,
                      color: f.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="dash-card-title">{f.title}</h3>
                  <p className="dash-card-desc">{f.desc}</p>
                  <span className="dash-card-link" style={{ color: f.color }}>
                    Open Tool <ArrowRight size={13} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Mission ── */}
      <div className="dash-section">
        <div className="dash-mission glass-card-static">
          <h2 className="dash-section-title">Our Mission</h2>
          <p className="dash-mission-text">
            We are dedicated to empowering individuals and organizations with the knowledge and
            tools needed to protect their data and privacy in an increasingly digital world.
            Our mission is to make cybersecurity accessible, understandable, and impactful for
            everyone — from students to security professionals.
          </p>
          <div className="dash-mission-badges">
            <span className="dash-mission-badge">
              <ShieldCheck size={16} style={{ color: 'var(--cyan)' }} /> Open Source
            </span>
            <span className="dash-mission-badge">
              <Lock size={16} style={{ color: 'var(--green)' }} /> Military-Grade Crypto
            </span>
            <span className="dash-mission-badge">
              <Zap size={16} style={{ color: 'var(--purple)' }} /> Real-Time Analysis
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dash-root {
          padding: 0;
        }

        /* ── Hero ── */
        .dash-hero {
          padding: 48px 0 52px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 52px;
        }

        .dash-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          background: var(--cyan-dim);
          border: 1px solid var(--border-hover);
          border-radius: 20px;
          color: var(--cyan);
          font-size: 0.73rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 22px;
        }

        .dash-title {
          font-family: var(--font-heading);
          font-size: 3.6rem;
          font-weight: 900;
          line-height: 1.08;
          color: var(--text-primary);
          margin-bottom: 18px;
          letter-spacing: -2px;
        }

        .dash-gradient {
          background: linear-gradient(120deg, var(--cyan) 0%, var(--purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dash-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.72;
          margin-bottom: 32px;
        }

        .dash-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        /* ── Stats ── */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 56px;
        }

        .dash-stat-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 28px 24px !important;
          gap: 6px;
        }

        .dash-stat-icon {
          color: var(--cyan);
          margin-bottom: 4px;
        }

        .dash-stat-value {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--cyan), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .dash-stat-label {
          font-size: 0.76rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-weight: 600;
        }

        /* ── Section ── */
        .dash-section {
          margin-bottom: 56px;
        }

        .dash-section-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }

        /* ── Grid ── */
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* ── Card ── */
        .dash-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-decoration: none !important;
          padding: 28px 24px !important;
          width: 100%;
        }

        .dash-card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          margin-bottom: 18px;
          flex-shrink: 0;
        }

        .dash-card-title {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .dash-card-desc {
          font-size: 0.878rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
          margin-bottom: 20px;
        }

        .dash-card-link {
          font-size: 0.84rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: auto;
          transition: gap 0.2s ease;
        }

        .dash-card:hover .dash-card-link {
          gap: 8px;
        }

        /* ── Mission ── */
        .dash-mission {
          padding: 40px !important;
        }

        .dash-mission-text {
          color: var(--text-secondary);
          font-size: 0.96rem;
          line-height: 1.8;
          max-width: 760px;
          margin-bottom: 28px;
        }

        .dash-mission-badges {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .dash-mission-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .dash-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .dash-title { font-size: 2.4rem; letter-spacing: -1px; }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-stats { grid-template-columns: 1fr; }
          .dash-hero { padding: 24px 0 36px; margin-bottom: 36px; }
          .dash-stat-card { align-items: center; text-align: center; }
        }
      `}</style>
    </div>
  );
}
