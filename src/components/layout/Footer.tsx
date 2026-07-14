import React from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../../logo.png';

const EXPLORE_LINKS = [
  { label: 'About Us',    to: '/about' },
  { label: 'Our Process', to: '/process' },
  { label: 'Pricing',     to: '/pricing' },
  { label: 'Our Work',    to: '/work' },
];

const MORE_LINKS: { label: string; to: string }[] = [
  { label: 'Track My Project', to: '/settings/my-projects' },
  { label: 'Academy',          to: '/academy' },
  { label: 'Digital Products', to: '/ebooks' },
];

const colLabel = 'text-[11px] font-bold uppercase tracking-[0.14em] text-white m-0';
const navLink  = 'text-[13px] text-ink-muted no-underline transition-colors hover:text-brand-primary';

export default function Footer() {
  return (
    <footer className="font-sans border-t border-white/5 bg-bg-base" style={{ padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10 xl:gap-12 pb-12 border-b border-white/5">
          {/* Brand */}
          <div className="flex flex-col gap-[18px]">
            <Link to="/" className="flex items-center gap-[10px] no-underline">
              <img src={logoSrc} alt="Consult Prompts" className="h-[30px] w-auto object-contain navbar-logo" />
              <span className="font-display font-bold uppercase text-white text-base">Consult Prompts</span>
            </Link>
            <p className="text-ink-muted font-light text-[13px] leading-relaxed m-0 max-w-[280px]">Brutally fast, no-nonsense websites for local businesses. Live in 72 hours, or it's free.</p>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-brand-primary text-[15px]">4.9★</span>
              <span className="text-ink-muted text-xs">from 34 shops shipped</span>
            </div>
          </div>

          {/* Explore */}
          <div className="flex flex-col gap-[14px]">
            <p className={colLabel}>Explore</p>
            {EXPLORE_LINKS.map(l => (
              <Link key={l.label} to={l.to} className={navLink}>{l.label}</Link>
            ))}
          </div>

          {/* More From Us */}
          <div className="flex flex-col gap-[14px]">
            <p className={colLabel}>More From Us</p>
            {MORE_LINKS.map(l => (
              <Link key={l.label} to={l.to} className={navLink}>{l.label}</Link>
            ))}
          </div>

          {/* Contact + Newsletter */}
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-3">
              <p className={colLabel}>Direct Comms</p>
              <a href="mailto:consultprompts@gmail.com" className={navLink}>consultprompts@gmail.com</a>
              <a href="https://wa.me/13026622736" target="_blank" rel="noopener noreferrer" className={navLink}>+1 (302) 662 2736</a>
              <a href="https://instagram.com/consultprompts" target="_blank" rel="noopener noreferrer" className={navLink}>@consultprompts</a>
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
          <div className="text-[10px] uppercase" style={{ color: 'rgba(161,161,161,0.5)', letterSpacing: '0.25em' }}>© 2026 Consult Prompts. All Rights Reserved.</div>
          <div className="flex gap-6">
            {(['Privacy', 'Terms'] as const).map(label => (
              <a key={label} href="#" className="text-ink-muted no-underline uppercase text-[11px] transition-colors hover:text-white" style={{ letterSpacing: '0.08em' }}>{label}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
