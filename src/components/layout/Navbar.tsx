import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Settings, User as UserIcon } from 'lucide-react';
import logoSrc from '../../logo.png';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../hooks';
import CustomButton from '../ui/CustomButton';

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
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  useBodyScrollLock(mobileOpen);

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) closeMobile();
  }, [location.pathname]);

  return (
    <>
      <nav className="fixed px-6 top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-base/95 md:bg-bg-base/90 md:backdrop-blur-md py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline" onClick={closeMobile}>
            <img src={logoSrc} className="h-10 w-auto object-contain navbar-logo" />
            <span className="font-display font-bold tracking-tight uppercase text-xl">Consult Prompts</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-8 text-sm font-medium text-ink-muted">
            {NAV_LINKS.map(link => 
              <Link key={link.href} to={link.href} className="hover:text-white font-display transition-colors cursor-pointer">{link.label}</Link>)
            }
          </div>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-3">
            {!loading && (
              !user
                ? <CustomButton onClick={onOpenAuth} variant="ghost">Sign up</CustomButton>
                : <CustomButton onClick={() => navigate('/settings/my-projects')} variant="icon"><UserIcon/></CustomButton>
            )}
            <CustomButton onClick={onStartProject}>Start a project</CustomButton>
          </div>

          {/* Mobile actions: hamburger */}
          <div className="xl:hidden flex items-center gap-1">
            <CustomButton onClick={() => setMobileOpen(v => !v)} variant="icon" size="lg">{mobileOpen ? <X/> : <Menu/>}</CustomButton>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay — always mounted so the clip-path transition can animate both directions; a closed-state clip keeps it invisible and non-interactive. */}
      <div
        className={`xl:hidden fixed inset-0 z-40 bg-bg-base flex flex-col pt-20 px-6 pb-8 overflow-y-auto transition-[clip-path] duration-300 ease-in-out ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ clipPath: mobileOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex-1 flex flex-col">
          {NAV_LINKS.map((link, i) => (
            <Link key={link.href} to={link.href} onClick={closeMobile} tabIndex={mobileOpen ? 0 : -1} className="py-4 border-b border-white/10 last:border-b-0 hover:text-white font-display text-xl transition-colors cursor-pointer">{link.label}</Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <CustomButton onClick={() => { onStartProject(); closeMobile(); }} tabIndex={mobileOpen ? 0 : -1}>Start a project</CustomButton>
          <CustomButton onClick={() => navigate('/settings/my-projects')} variant="outline" tabIndex={mobileOpen ? 0 : -1}><Settings className="w-4 h-4" /> Console</CustomButton>
          {!loading && (
            !user
              ? <CustomButton onClick={() => { onOpenAuth(); closeMobile(); }} variant="outline" tabIndex={mobileOpen ? 0 : -1}>Sign up / Log in</CustomButton>
              : <CustomButton onClick={() => { logout(); closeMobile(); }} variant="outline" tabIndex={mobileOpen ? 0 : -1}>Logout</CustomButton>
          )}
        </div>
      </div>
    </>
  );
}
