import './globals.css';
import Sidebar from './components/Sidebar';
import ThemeProvider from './components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'CyberGuard Toolkit — Cybersecurity Suite',
  description:
    'A comprehensive cybersecurity toolkit featuring encryption, password generation, phishing detection, and more.',
  keywords: ['cybersecurity', 'encryption', 'password generator', 'phishing scanner', 'toolkit'],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <div className="main-content-inner">{children}</div>
            </main>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                fontSize: '0.86rem',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#00bcd4', secondary: '#fff' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
