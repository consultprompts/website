import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SettingsHeaderProps {
  /** Plain string for a top-level section, or a "Parent / Child" breadcrumb for a sub-page. */
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Present for a sub-page nested under a section — renders a back arrow that returns to it. */
  onBack?: () => void;
}

/**
 * Section header shared across Settings. Top-level sections (Account, My
 * Projects, Agency, Products, Academy) stay desktop-only here, since mobile
 * has its own Back/title/close row owned by SettingsPanel for those. A
 * sub-page passing `onBack` renders on every breakpoint instead, because at
 * that nesting depth this *is* the only way back to the section's list on mobile.
 */
export default function SettingsHeader({ title, subtitle, onClose, onBack }: SettingsHeaderProps) {
  return (
    <div
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className={`${onBack ? 'flex' : 'hidden md:flex'} px-4 md:px-8 py-4 md:py-6 items-center justify-between gap-6 flex-shrink-0`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer text-white flex items-center justify-center flex-shrink-0 hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display font-bold italic text-[18px] md:text-[22px] m-0 truncate">{title}</h1>
          {subtitle && (
            <p className="text-ink-muted text-[11px] uppercase tracking-[0.14em] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        className="w-8 h-8 rounded-full bg-transparent text-white cursor-pointer text-base leading-none flex items-center justify-center flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
