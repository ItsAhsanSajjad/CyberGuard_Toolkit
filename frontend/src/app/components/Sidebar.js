'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  KeyRound,
  Lock,
  FileKey,
  Shield,
  FileText,
  Mail,
  ChevronLeft,
  Menu,
  ShieldCheck,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/password-generator', label: 'Password Generator', icon: KeyRound },
  { href: '/text-encryption', label: 'Text Encryption', icon: Lock },
  { href: '/file-crypto', label: 'File Encryption', icon: FileKey },
  { href: '/phishing-scanner', label: 'Phishing Scanner', icon: Shield },
  { href: '/pdf-decryptor', label: 'PDF Unlocker', icon: FileText },
  { href: '/temp-email', label: 'Temporary Email', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div className="sb-topbar">
        <button className="sb-topbar-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <span className="sb-topbar-title">
          <ShieldCheck size={16} style={{ color: "var(--cyan)" }} />
          Cyber Security Toolkit
        </span>
        <button className="sb-topbar-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* ── Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className="sb-root"
        data-collapsed={collapsed ? 'true' : 'false'}
        data-mobile-open={mobileOpen ? 'true' : 'false'}
      >
        {/* Logo */}
        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-icon">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="sb-brand-text">
                <span className="sb-brand-name">Cyber Security</span>
                <span className="sb-brand-tag">Toolkit</span>
              </div>
            )}
          </div>
          <button className="sb-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={17} />
          </button>
        </div>

        {/* Separator */}
        <div className="sb-sep" />

        {/* Nav label */}
        {!collapsed && <div className="sb-section-label">Tools</div>}

        {/* Nav Items */}
        <nav className="sb-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${isActive ? ' sb-item-active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    className="sb-item-bg"
                    layoutId="sidebarActiveBg"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="sb-item-icon">
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {!collapsed && (
                  <span className="sb-item-label">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom */}
        <div className="sb-footer">
          <div className="sb-sep" style={{ marginBottom: 12 }} />

          <button
            className="sb-item sb-theme-item"
            onClick={toggleTheme}
            title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            <span className="sb-item-icon">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </span>
            {!collapsed && (
              <span className="sb-item-label">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <button
            className="sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : undefined}
          >
            <span className="sb-item-icon">
              <ChevronLeft
                size={15}
                strokeWidth={2}
                style={{
                  transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  display: 'block',
                }}
              />
            </span>
            {!collapsed && <span className="sb-item-label">Collapse</span>}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        /* Sidebar Styling Overrides to achieve the premium "floating" look */
        .sb-root {
          position: fixed;
          top: 16px;
          left: 16px;
          height: calc(100vh - 32px);
          width: var(--sidebar-width);
          background: var(--bg-sidebar);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          z-index: 999;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 4px 24px -6px rgba(0, 0, 0, 0.4);
        }

        .sb-root[data-collapsed="true"] {
          width: var(--sidebar-collapsed);
        }

        @media (max-width: 768px) {
          .sb-root {
            top: 0;
            left: 0;
            height: 100vh;
            border-radius: 0;
            border: none;
            border-right: 1px solid var(--border);
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
          }

          .sb-root[data-mobile-open="true"] {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
