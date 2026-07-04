import React from 'react';
import { Menu, User as UserIcon, LayoutDashboard } from 'lucide-react';
import logoSrc from '../../logo.png';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onStartProject: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onToggleProfile: () => void;
  onOpenMobileMenu: () => void;
  isProfileOpen: boolean;
}

const NAV_LINKS = [
  { href: '#process', label: 'Process' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#reviews', label: 'Work' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar({
  onStartProject,
  onOpenAuth,
  onOpenAdmin,
  onToggleProfile,
  onOpenMobileMenu,
  isProfileOpen,
}: NavbarProps) {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-base/95 md:bg-bg-base/90 md:backdrop-blur-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img src={logoSrc} alt="Consult Prompts" className="h-10 w-auto object-contain" />
          <span className="font-display font-bold tracking-tight uppercase text-xl pl-5">Consult Prompts</span>
        </div>

        <div className="hidden xl:flex items-center gap-8 text-sm font-medium text-ink-muted">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors cursor-pointer">
              {link.label}
            </a>
          ))}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 text-brand-primary hover:text-white transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin
            </button>
          )}
        </div>

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
              className="p-1 rounded-full border-2 border-white/10 hover:border-brand-primary transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              {isProfileOpen && <div className="absolute inset-0 bg-brand-primary/10" />}
            </button>
          )}
        </div>

        <button onClick={onOpenMobileMenu} className="xl:hidden p-2 text-white cursor-pointer">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </nav>
  );
}
