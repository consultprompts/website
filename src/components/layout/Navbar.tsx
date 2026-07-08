import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User as UserIcon } from 'lucide-react';
import logoSrc from '../../logo.png';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onStartProject: () => void;
  onOpenAuth: () => void;
  onToggleProfile: () => void;
  onOpenMobileMenu: () => void;
  isProfileOpen: boolean;
}

const NAV_LINKS = [
  { href: '/about',    label: 'About' },
  { href: '/process',  label: 'Process' },
  { href: '/pricing',  label: 'Pricing' },
  { href: '/work',     label: 'Work' },
  { href: '/academy',  label: 'Academy' },
];

export default function Navbar({
  onStartProject,
  onOpenAuth,
  onToggleProfile,
  isProfileOpen,
}: NavbarProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

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
                onClick={onToggleProfile}
                className="p-1 rounded-full border-2 border-white/10 hover:border-brand-primary transition-all cursor-pointer relative"
              >
                <div className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                {isProfileOpen && <div className="absolute inset-0 bg-brand-primary/10 rounded-full" />}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="xl:hidden p-2 text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-bg-base flex flex-col pt-20 px-6 pb-8 overflow-y-auto">
          <nav className="flex flex-col mt-4">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMobile}
                className="text-2xl font-display font-bold py-5 border-b border-white/5 hover:text-brand-primary transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
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
              <button
                onClick={() => { onToggleProfile(); closeMobile(); }}
                className="w-full py-4 border border-white/10 text-sm font-bold uppercase tracking-widest rounded-xl hover:border-brand-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4" /> My Account
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
