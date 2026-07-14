import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Settings, User as UserIcon, Sun, Moon } from 'lucide-react';
import logoSrc from '../../logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBodyScrollLock } from '../../hooks';

interface NavbarProps {
  onStartProject: () => void;
  onOpenAuth: () => void;
}

const NAV_LINKS = [
  { href: '/about',    label: 'About' },
  { href: '/process',  label: 'Process' },
  { href: '/pricing',  label: 'Pricing' },
  { href: '/work',     label: 'Work' },
  { href: '/academy',  label: 'Academy' },
];

export default function Navbar({ onStartProject, onOpenAuth }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useBodyScrollLock(mobileOpen);

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) closeMobile();
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-base/95 md:bg-bg-base/90 md:backdrop-blur-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline text-white" onClick={closeMobile}>
            <img src={logoSrc} alt="Consult Prompts" className="h-10 w-auto object-contain" />
            <span className="font-display font-bold tracking-tight uppercase text-xl pl-5">Consult Prompts</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-8 text-sm font-medium text-ink-muted">
            {NAV_LINKS.map(link => (
              <Link key={link.href} to={link.href} className="hover:text-white transition-colors cursor-pointer">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-4">
            <button
              onClick={onStartProject}
              className="bg-brand-primary text-bg-base font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
            >
              Start a project
            </button>
            {!user ? (
              <button
                onClick={onOpenAuth}
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 hover:text-brand-primary transition-colors cursor-pointer"
              >
                Sign up
              </button>
            ) : (
              <button
                onClick={() => navigate('/settings/my-projects')}
                className="p-1 rounded-full border-2 border-white/10 hover:border-brand-primary transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-white/10 hover:border-brand-primary flex items-center justify-center transition-colors cursor-pointer"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile actions: theme toggle + hamburger */}
          <div className="xl:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-white cursor-pointer"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="p-2 text-white cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-bg-base flex flex-col pt-20 px-6 pb-8 overflow-y-auto">
          <nav className="flex-1 flex flex-col items-center justify-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMobile}
                className="text-3xl font-display font-bold py-4 text-center w-full hover:text-brand-primary transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onStartProject(); closeMobile(); }}
              className="w-full py-4 bg-brand-primary text-bg-base font-bold text-sm rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
            >
              Start a project
            </button>
            {!user ? (
              <button
                onClick={() => { onOpenAuth(); closeMobile(); }}
                className="w-full py-4 border border-white/10 text-sm font-bold uppercase tracking-widest rounded-xl hover:border-brand-primary transition-colors cursor-pointer"
              >
                Sign up / Log in
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/settings/my-projects')}
                  className="w-full py-4 border border-white/10 text-sm font-bold uppercase tracking-widest rounded-xl hover:border-brand-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Console
                </button>
                <button
                  onClick={() => { logout(); closeMobile(); }}
                  className="w-full py-4 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
