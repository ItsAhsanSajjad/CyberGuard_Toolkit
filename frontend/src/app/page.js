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
  ArrowRight,
  Globe,
  Cloud,
  Wifi,
  Laptop,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    href: '/password-generator',
    icon: KeyRound,
    title: 'Password Generator',
    desc: 'Create strong passwords and check if they have ever been leaked online.',
    tech: 'AES-grade RNG',
    color: '#00f0ff',
  },
  {
    href: '/text-encryption',
    icon: Lock,
    title: 'Text Encryption',
    desc: 'Encrypt messages with a password so only the right person can read them.',
    tech: 'AES-256',
    color: '#0a74ff',
  },
  {
    href: '/file-crypto',
    icon: FileKey,
    title: 'File Encryption',
    desc: 'Lock any file with a key. We detect if the file has been changed.',
    tech: 'Fernet',
    color: '#00f0ff',
  },
  {
    href: '/phishing-scanner',
    icon: Shield,
    title: 'Phishing Scanner',
    desc: 'Check if a website link is safe to open before you click it.',
    tech: '10 checks',
    color: '#0a74ff',
  },
  {
    href: '/pdf-decryptor',
    icon: FileText,
    title: 'PDF Unlocker',
    desc: 'Recover access to a locked PDF by trying passwords from a wordlist.',
    tech: 'Wordlist',
    color: '#00f0ff',
  },
  {
    href: '/temp-email',
    icon: Mail,
    title: 'Temporary Email',
    desc: 'Generate a throwaway email address to keep your real inbox private.',
    tech: 'Demo',
    color: '#0a74ff',
  },
];

const trustStats = [
  { value: 'Private', label: 'Nothing Stored', icon: ShieldCheck },
  { value: 'Strong', label: '256-bit Encryption', icon: Lock },
  { value: 'Fast', label: 'In Your Browser', icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="dash-root">
      {/* ── Hero ── */}
      <div className="dash-hero">
        {/* Ambient backdrop layers */}
        <div className="hero-grid-bg" aria-hidden />
        <div className="hero-aurora aurora-a" aria-hidden />
        <div className="hero-aurora aurora-b" aria-hidden />

        {/* Left Content */}
        <div className="dash-hero-content">
          <motion.div
            className="dash-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge-pulse" />
            <ShieldCheck size={13} className="badge-icon" />
            <span className="badge-text">Cyber Security Toolkit</span>
          </motion.div>

          <motion.h1
            className="dash-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="title-line">Practical security tools</span>
            <span className="dash-gradient">for everyday use.</span>
          </motion.h1>

          <motion.p
            className="dash-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Generate passwords, encrypt files, scan suspicious links and more — all in your
            browser. No accounts, no installs, nothing stored on our servers.
          </motion.p>

          <motion.div
            className="dash-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link href="/password-generator" className="hero-btn hero-btn-primary">
              <span className="hero-btn-content">
                Get started <ArrowRight size={15} strokeWidth={2.2} />
              </span>
            </Link>
            <a href="#features" className="hero-btn hero-btn-secondary">
              <span className="hero-btn-content">Explore tools</span>
            </a>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {trustStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className="hero-stat">
                    <span className="hero-stat-icon"><Icon size={13} strokeWidth={1.8} /></span>
                    <span className="hero-stat-meta">
                      <span className="hero-stat-value">{s.value}</span>
                      <span className="hero-stat-label">{s.label}</span>
                    </span>
                  </span>
                  {i < trustStats.length - 1 && <span className="hero-stat-sep" aria-hidden />}
                </span>
              );
            })}
          </motion.div>
        </div>

        {/* Right Cyber Graphic — SVG-based for perfect concentric alignment */}
        <div className="dash-hero-visual">
          <motion.div
            className="cyber-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* HUD corner brackets */}
            <span className="hud-corner hud-tl" aria-hidden />
            <span className="hud-corner hud-tr" aria-hidden />
            <span className="hud-corner hud-bl" aria-hidden />
            <span className="hud-corner hud-br" aria-hidden />

            {/* SVG layer — all concentric geometry, mathematically perfect */}
            <svg className="cyber-svg" viewBox="0 0 400 400" aria-hidden>
              {/* Concentric guide rings */}
              <circle cx="200" cy="200" r="180" className="svg-ring svg-ring-outer" />
              <circle cx="200" cy="200" r="140" className="svg-ring svg-ring-mid" />
              <circle cx="200" cy="200" r="100" className="svg-ring svg-ring-inner" />

              {/* Pulse waves expanding outward */}
              <circle cx="200" cy="200" r="80" className="svg-pulse svg-pulse-0" />
              <circle cx="200" cy="200" r="80" className="svg-pulse svg-pulse-1" />
              <circle cx="200" cy="200" r="80" className="svg-pulse svg-pulse-2" />

              {/* Orbiting dot — rotating group around the SAME center */}
              <g className="svg-orbit-rotate">
                <circle cx="200" cy="60" r="4" className="svg-orbit-dot" />
              </g>
            </svg>

            {/* Orbiting hex nodes — positioned via CSS using percentages of stage */}
            <div className="hex-orbits" aria-hidden>
              {[Globe, Shield, Wifi, Laptop, Cloud, KeyRound].map((Icon, idx) => (
                <motion.div
                  key={idx}
                  className="hex-slot"
                  style={{ transform: `rotate(${idx * 60}deg) translateY(-160px)` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + (idx * 0.07), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className="hex-counter"
                    style={{ transform: `rotate(${-idx * 60}deg)` }}
                  >
                    <div className="hex-tile">
                      <Icon size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating particles */}
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={`p-${i}`} className={`particle particle-${i}`} aria-hidden />
            ))}

            {/* Center Shield Core — pinned to exact center */}
            <div className="cyber-core">
              <ShieldCheck size={66} className="cyber-core-icon" strokeWidth={1.75} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Security Tools ── */}
      <div id="features" className="dash-section">
        <motion.div
          className="dash-section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-eyebrow">
            <span className="eyebrow-line" aria-hidden />
            <span className="eyebrow-text">Toolkit</span>
          </div>
          <h2 className="dash-section-title">Six tools, one place</h2>
          <p className="dash-section-subtitle">
            Every module runs real cryptographic primitives — no client-side mocks. Pick a tool to get started.
          </p>
        </motion.div>

        <div className="dash-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', height: '100%' }}
              >
                <Link href={f.href} className="dash-card" style={{ '--accent': f.color }}>
                  <div className="dash-card-accent" aria-hidden />
                  <div className="dash-card-glow" aria-hidden />

                  <div className="dash-card-icon-wrap">
                    <Icon size={20} color={f.color} strokeWidth={1.7} />
                  </div>

                  <div className="dash-card-body">
                    <h3 className="dash-card-title">{f.title}</h3>
                    <p className="dash-card-desc">{f.desc}</p>
                  </div>

                  <div className="dash-card-foot">
                    <span className="dash-card-tech">{f.tech}</span>
                    <span className="dash-card-cta">
                      Open
                      <ArrowRight size={14} className="dash-card-cta-arrow" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .dash-root {
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 120px;
        }

        /* ──────────────── Hero ──────────────── */
        .dash-hero {
          position: relative;
          padding: 60px 0 40px;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 56px;
          align-items: center;
          max-width: 1180px;
          margin: 0 auto;
          isolation: isolate;
        }

        .hero-grid-bg {
          position: absolute;
          inset: -80px -40px -40px -40px;
          background-image:
            linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 70% 80% at 50% 40%, #000 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 40%, #000 30%, transparent 75%);
          opacity: 0.7;
          z-index: -2;
          pointer-events: none;
        }

        :global([data-theme="light"]) .hero-grid-bg {
          background-image:
            linear-gradient(rgba(10, 116, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 116, 255, 0.07) 1px, transparent 1px);
          opacity: 0.55;
        }

        .hero-aurora {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          pointer-events: none;
          z-index: -1;
          will-change: transform, opacity;
        }
        .aurora-a {
          top: -120px;
          left: -80px;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.55), transparent 65%);
          animation: auroraDrift 14s ease-in-out infinite alternate;
        }
        .aurora-b {
          bottom: -160px;
          right: -100px;
          background: radial-gradient(circle, rgba(10, 116, 255, 0.55), transparent 65%);
          animation: auroraDrift 18s ease-in-out infinite alternate-reverse;
        }
        :global([data-theme="light"]) .hero-aurora { opacity: 0.18; }

        @keyframes auroraDrift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.15); }
        }

        .dash-hero-content { text-align: left; }

        /* ──────────────── Badge ──────────────── */
        .dash-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 11px;
          background: linear-gradient(120deg, rgba(0, 240, 255, 0.08), rgba(10, 116, 255, 0.04));
          border: 1px solid rgba(0, 240, 255, 0.32);
          border-radius: 100px;
          color: #7df1ff;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          margin-bottom: 24px;
          box-shadow:
            0 0 20px rgba(0, 240, 255, 0.1),
            inset 0 0 10px rgba(0, 240, 255, 0.04);
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        :global([data-theme="light"]) .dash-badge {
          color: #0a74ff;
          background: linear-gradient(120deg, rgba(10, 116, 255, 0.06), rgba(0, 240, 255, 0.03));
          border-color: rgba(10, 116, 255, 0.25);
          box-shadow: 0 2px 14px rgba(10, 116, 255, 0.08);
        }

        .badge-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 10px #00f0ff, 0 0 18px rgba(0, 240, 255, 0.6);
          animation: badgePulse 2.2s ease-in-out infinite;
        }
        :global([data-theme="light"]) .badge-pulse {
          background: #0a74ff;
          box-shadow: 0 0 8px rgba(10, 116, 255, 0.6);
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        .badge-icon { color: inherit; }
        .badge-text { font-weight: 700; }

        /* ──────────────── Title ──────────────── */
        .dash-title {
          position: relative;
          font-family: var(--font-heading);
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.05;
          color: var(--text-primary);
          margin-bottom: 22px;
          letter-spacing: -0.04em;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .title-line { display: block; }

        .dash-gradient {
          display: inline-block;
          background: linear-gradient(135deg, #4dd0ff 0%, #0a74ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        :global([data-theme="light"]) .dash-gradient {
          background: linear-gradient(135deg, #00bcd4 0%, #0a74ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .dash-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 540px;
          line-height: 1.65;
          margin-bottom: 32px;
          font-weight: 400;
        }

        /* ──────────────── Buttons ──────────────── */
        .dash-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 36px;
        }

        .hero-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 26px;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.1px;
          border-radius: 10px;
          text-decoration: none !important;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.25s ease,
                      background 0.25s ease,
                      border-color 0.25s ease;
        }

        .hero-btn-content {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Primary — solid blue pill */
        .hero-btn-primary {
          background: #0a74ff;
          border: 1px solid #0a74ff;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(10, 116, 255, 0.3);
        }
        .hero-btn-primary:hover {
          transform: translateY(-1px);
          background: #0958c4;
          border-color: #0958c4;
          box-shadow: 0 6px 18px rgba(10, 116, 255, 0.4);
        }

        /* Secondary — outlined */
        .hero-btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: var(--text-primary);
        }
        :global([data-theme="light"]) .hero-btn-secondary {
          border-color: rgba(15, 35, 75, 0.18);
        }
        .hero-btn-secondary:hover {
          transform: translateY(-1px);
          border-color: rgba(125, 180, 255, 0.5);
          background: rgba(125, 180, 255, 0.06);
        }
        :global([data-theme="light"]) .hero-btn-secondary:hover {
          border-color: rgba(10, 116, 255, 0.4);
          background: rgba(10, 116, 255, 0.04);
        }

        /* ──────────────── Stats ──────────────── */
        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0;
          padding: 4px 0;
          width: fit-content;
          max-width: 100%;
        }

        .hero-stat {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px 8px 0;
        }
        .hero-stat:not(:first-child) { padding-left: 20px; }

        .hero-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          color: #00bcd4;
          background: rgba(0, 188, 212, 0.10);
          border: 1px solid rgba(0, 188, 212, 0.22);
          flex-shrink: 0;
        }
        :global([data-theme="light"]) .hero-stat-icon {
          color: #0a74ff;
          background: rgba(10, 116, 255, 0.08);
          border-color: rgba(10, 116, 255, 0.20);
        }
        .hero-stat-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          line-height: 1.2;
          white-space: nowrap;
        }
        .hero-stat-value {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .hero-stat-label {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.1px;
        }
        .hero-stat-sep {
          width: 1px;
          height: 28px;
          background: rgba(125, 180, 255, 0.18);
          flex-shrink: 0;
          align-self: center;
        }
        :global([data-theme="light"]) .hero-stat-sep {
          background: rgba(15, 35, 75, 0.12);
        }

        /* ──────────────── Hero Visual ──────────────── */
        .dash-hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 460px;
        }

        /* Square stage — every child uses this 1:1 box as its coordinate system */
        .cyber-stage {
          position: relative;
          width: 420px;
          height: 420px;
        }

        /* SVG fills stage; viewBox 0..400 maps to entire stage */
        .cyber-svg {
          position: absolute;
          inset: 10px;            /* leaves 10px ring around the SVG for HUD corners */
          width: calc(100% - 20px);
          height: calc(100% - 20px);
          overflow: visible;
        }

        /* Rings — perfectly concentric SVG circles */
        .svg-ring {
          fill: none;
          stroke: rgba(0, 240, 255, 0.35);
          stroke-width: 1;
          transform-origin: 200px 200px;
        }
        .svg-ring-outer { stroke-dasharray: 1 6;  animation: svgSpin        70s linear infinite; }
        .svg-ring-mid   { stroke-dasharray: 6 5;  stroke: rgba(10, 116, 255, 0.32); animation: svgSpinReverse 55s linear infinite; }
        .svg-ring-inner { stroke-dasharray: 2 3;  stroke: rgba(0, 240, 255, 0.45); animation: svgSpin        40s linear infinite; }

        @keyframes svgSpin        { to { transform: rotate(360deg); } }
        @keyframes svgSpinReverse { to { transform: rotate(-360deg); } }

        :global([data-theme="light"]) .svg-ring-outer { stroke: rgba(10, 116, 255, 0.45); }
        :global([data-theme="light"]) .svg-ring-mid   { stroke: rgba(10, 116, 255, 0.4); }
        :global([data-theme="light"]) .svg-ring-inner { stroke: rgba(10, 116, 255, 0.55); }

        /* Pulse waves — same center, expand outward */
        .svg-pulse {
          fill: none;
          stroke: rgba(0, 240, 255, 0.5);
          stroke-width: 1.5;
          transform-origin: 200px 200px;
          opacity: 0;
          animation: svgPulse 4.2s ease-out infinite;
        }
        .svg-pulse-0 { animation-delay: 0s; }
        .svg-pulse-1 { animation-delay: 1.4s; }
        .svg-pulse-2 { animation-delay: 2.8s; }

        :global([data-theme="light"]) .svg-pulse {
          stroke: rgba(10, 116, 255, 0.55);
          stroke-width: 1.8;
        }

        @keyframes svgPulse {
          0%   { transform: scale(0.5); opacity: 0; }
          15%  { opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Orbit dot — rotating group around SVG center (200,200) */
        .svg-orbit-rotate {
          transform-origin: 200px 200px;
          animation: svgSpin 9s linear infinite;
        }
        .svg-orbit-dot {
          fill: #00f0ff;
          filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.95)) drop-shadow(0 0 14px rgba(0, 240, 255, 0.5));
        }
        :global([data-theme="light"]) .svg-orbit-dot {
          fill: #0a74ff;
          filter: drop-shadow(0 0 4px rgba(10, 116, 255, 0.7));
        }

        /* HUD corner brackets — anchored to stage corners */
        .hud-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 1px solid rgba(0, 240, 255, 0.5);
          pointer-events: none;
          z-index: 2;
        }
        .hud-tl { top: 0;     left: 0;    border-right: none;  border-bottom: none; }
        .hud-tr { top: 0;     right: 0;   border-left: none;   border-bottom: none; }
        .hud-bl { bottom: 0;  left: 0;    border-right: none;  border-top: none;    }
        .hud-br { bottom: 0;  right: 0;   border-left: none;   border-top: none;    }
        :global([data-theme="light"]) .hud-corner {
          border-color: rgba(10, 116, 255, 0.7);
          border-width: 1.5px;
        }

        /* Center shield core — pinned to exact stage center */
        .cyber-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150px;
          height: 150px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 30%, #4dd0ff 0%, #00bcd4 35%, #0a74ff 100%);
          box-shadow:
            0 0 60px rgba(0, 240, 255, 0.5),
            0 12px 40px rgba(10, 116, 255, 0.35),
            inset 0 2px 0 rgba(255, 255, 255, 0.55),
            inset 0 -10px 24px rgba(10, 50, 120, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.25);
          z-index: 10;
          animation: corePulse 4s ease-in-out infinite;
        }
        :global([data-theme="light"]) .cyber-core {
          background: linear-gradient(135deg, #0a74ff 0%, #00bcd4 100%);
          box-shadow:
            0 12px 36px rgba(10, 116, 255, 0.4),
            0 0 60px rgba(10, 116, 255, 0.2),
            inset 0 2px 0 rgba(255, 255, 255, 0.5),
            inset 0 -8px 20px rgba(10, 50, 120, 0.25);
          border: 1px solid rgba(10, 116, 255, 0.3);
        }
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 60px rgba(0, 240, 255, 0.5), 0 12px 40px rgba(10, 116, 255, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.55), inset 0 -10px 24px rgba(10, 50, 120, 0.3); }
          50%      { box-shadow: 0 0 90px rgba(0, 240, 255, 0.7), 0 12px 50px rgba(10, 116, 255, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.6),  inset 0 -10px 24px rgba(10, 50, 120, 0.3); }
        }

        .cyber-core-icon {
          color: #ffffff;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
          position: relative;
          z-index: 2;
        }

        /* Hex orbits — anchor at stage center, rotate-translate to position around 160px radius */
        .hex-orbits {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          z-index: 6;
        }
        .hex-slot {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
        }
        .hex-counter {
          position: absolute;
          top: -27px;
          left: -24px;
          width: 48px;
          height: 54px;
        }
        .hex-tile {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, rgba(0, 240, 255, 0.22), rgba(10, 116, 255, 0.1));
          border: 1px solid rgba(0, 240, 255, 0.5);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00f0ff;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 16px rgba(0, 240, 255, 0.25);
          filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.4));
        }
        :global([data-theme="light"]) .hex-tile {
          background: linear-gradient(145deg, #ffffff, rgba(10, 116, 255, 0.08));
          border: 1.5px solid rgba(10, 116, 255, 0.5);
          color: #0a74ff;
          box-shadow: 0 4px 12px rgba(10, 116, 255, 0.18);
          filter: none;
        }

        @keyframes spin        { 0% { transform: translate(-50%, -50%) rotate(0deg); }   100% { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spinReverse { 0% { transform: translate(-50%, -50%) rotate(0deg); }   100% { transform: translate(-50%, -50%) rotate(-360deg); } }

        /* Drifting particles */
        .particle {
          position: absolute;
          top: 50%; left: 50%;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff, 0 0 16px rgba(0, 240, 255, 0.6);
          pointer-events: none;
          opacity: 0.7;
        }
        :global([data-theme="light"]) .particle {
          background: #0a74ff;
          width: 5px;
          height: 5px;
          box-shadow: 0 0 8px rgba(10, 116, 255, 0.9), 0 0 14px rgba(10, 116, 255, 0.5);
          opacity: 0.95;
        }
        .particle-0 { animation: drift0 9s linear infinite; }
        .particle-1 { animation: drift1 11s linear infinite; }
        .particle-2 { animation: drift2 13s linear infinite; }
        .particle-3 { animation: drift3 10s linear infinite; }
        .particle-4 { animation: drift4 12s linear infinite; }
        .particle-5 { animation: drift5 14s linear infinite; }
        .particle-6 { animation: drift6 11.5s linear infinite; }
        .particle-7 { animation: drift7 9.5s linear infinite; }
        .particle-8 { animation: drift8 13.5s linear infinite; }
        .particle-9 { animation: drift9 10.5s linear infinite; }

        @keyframes drift0 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(180px, -90px); opacity: 0; } }
        @keyframes drift1 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(-150px, -140px); opacity: 0; } }
        @keyframes drift2 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(-180px, 100px); opacity: 0; } }
        @keyframes drift3 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(140px, 160px); opacity: 0; } }
        @keyframes drift4 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(200px, 30px); opacity: 0; } }
        @keyframes drift5 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(-200px, -20px); opacity: 0; } }
        @keyframes drift6 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(70px, -190px); opacity: 0; } }
        @keyframes drift7 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(-90px, 200px); opacity: 0; } }
        @keyframes drift8 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(170px, -160px); opacity: 0; } }
        @keyframes drift9 { 0% { transform: translate(-50%, -50%) translate(0, 0); opacity: 0; } 10% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) translate(-110px, 70px); opacity: 0; } }


        /* ──────────────── Section ──────────────── */
        .dash-section-header {
          margin-bottom: 40px;
        }

        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #00f0ff;
          margin-bottom: 14px;
        }
        :global([data-theme="light"]) .section-eyebrow { color: #0a74ff; }

        .eyebrow-line {
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00f0ff);
        }
        :global([data-theme="light"]) .eyebrow-line {
          background: linear-gradient(90deg, transparent, #0a74ff);
        }

        .dash-section-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
          letter-spacing: -0.035em;
          line-height: 1.1;
        }
        :global([data-theme="light"]) .dash-section-title { color: #0f172a; }

        .dash-section-subtitle {
          color: var(--text-secondary);
          font-size: 1.02rem;
          max-width: 540px;
          line-height: 1.55;
        }
        :global([data-theme="light"]) .dash-section-subtitle { color: #475569; }

        /* ──────────────── Cards ──────────────── */
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
          gap: 16px;
          align-items: stretch;
        }

        .dash-card {
          position: relative;
          display: flex;
          flex-direction: column;
          text-decoration: none !important;
          padding: 24px 24px 20px !important;
          width: 100%;
          height: 100%;
          min-height: 240px;
          border: 1px solid rgba(125, 180, 255, 0.14) !important;
          border-radius: 14px;
          background: linear-gradient(180deg, #142a4f 0%, #0d1d3a 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 2px 6px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          transition:
            border-color 0.3s ease,
            transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.3s ease,
            background 0.3s ease;
        }
        :global([data-theme="light"]) .dash-card {
          background: #ffffff;
          border: 1px solid rgba(15, 35, 75, 0.10) !important;
          box-shadow:
            0 1px 2px rgba(15, 35, 75, 0.04),
            0 1px 3px rgba(15, 35, 75, 0.03);
          backdrop-filter: none;
        }

        /* Top accent line — invisible by default, brightens on hover */
        .dash-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent) 50%, transparent);
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: 2;
        }
        .dash-card:hover .dash-card-accent { opacity: 1; }

        .dash-card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 100% 0%, var(--accent), transparent 60%);
          opacity: 0;
          transition: opacity 0.45s ease;
          z-index: 0;
          pointer-events: none;
        }
        .dash-card:hover .dash-card-glow { opacity: 0.08; }

        .dash-card:hover {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent) !important;
          transform: translateY(-3px);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 12px 28px rgba(0, 0, 0, 0.35),
            0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent);
        }
        :global([data-theme="light"]) .dash-card:hover {
          background: #ffffff;
          box-shadow:
            0 8px 24px rgba(15, 35, 75, 0.08),
            0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent);
        }

        .dash-card > * { position: relative; z-index: 1; }

        /* Icon — sits alone at the top of the card */
        .dash-card-icon-wrap {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
          margin-bottom: 18px;
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
        }
        :global([data-theme="light"]) .dash-card-icon-wrap {
          background: color-mix(in srgb, var(--accent) 10%, white);
          border-color: color-mix(in srgb, var(--accent) 28%, transparent);
        }
        .dash-card:hover .dash-card-icon-wrap {
          background: color-mix(in srgb, var(--accent) 18%, transparent);
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
        }

        /* Body — takes remaining space so footer pins to the bottom */
        .dash-card-body { flex: 1; min-height: 0; }

        .dash-card-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          line-height: 1.3;
          letter-spacing: -0.015em;
        }
        :global([data-theme="light"]) .dash-card-title { color: #0f172a; }

        .dash-card-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        :global([data-theme="light"]) .dash-card-desc { color: #475569; }

        /* Footer — tech badge on the left, CTA on the right */
        .dash-card-foot {
          margin-top: 22px;
          padding-top: 14px;
          border-top: 1px solid rgba(125, 180, 255, 0.10);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        :global([data-theme="light"]) .dash-card-foot {
          border-top-color: rgba(10, 30, 60, 0.10);
        }

        .dash-card-tech {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        :global([data-theme="light"]) .dash-card-tech { color: #94a3b8; }

        .dash-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--accent);
          transition: gap 0.25s ease;
        }
        .dash-card-cta-arrow {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-card:hover .dash-card-cta { gap: 10px; }
        .dash-card:hover .dash-card-cta-arrow { transform: translateX(2px); }

        /* ──────────────── Responsive ──────────────── */
        @media (max-width: 1024px) {
          .dash-hero { grid-template-columns: 1fr; text-align: center; gap: 24px; }
          .dash-hero-content { display: flex; flex-direction: column; align-items: center; }
          .dash-subtitle { text-align: center; }
          .dash-actions { justify-content: center; }
          .hero-stats { margin: 0 auto; }
          .cyber-stage { margin-top: 24px; transform: scale(0.92); }
          .dash-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .dash-title { font-size: 3.2rem; }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-root { gap: 80px; }
          .cyber-stage { transform: scale(0.78); }
          .dash-hero-visual { height: 380px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dash-gradient,
          .badge-pulse,
          .badge-shimmer,
          .svg-pulse,
          .svg-ring-outer, .svg-ring-mid, .svg-ring-inner,
          .svg-orbit-rotate,
          .particle,
          .cyber-core,
          .hero-aurora {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
