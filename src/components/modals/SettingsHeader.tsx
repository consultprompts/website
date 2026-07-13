import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
  /** Kept for compatibility — no longer renders a close button (the panel header owns that now). */
  onClose?: () => void;
  onBack?: () => void;
}

export default function SettingsHeader({ title, subtitle, onBack }: SettingsHeaderProps) {
  return (
    <div
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className={`${onBack ? 'flex' : 'hidden md:flex'} px-4 md:px-8 py-3 md:py-4 items-center gap-4 flex-shrink-0`}
    >
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
        <h2 className="font-display font-bold text-2xl m-0 truncate">{title}</h2>
        {subtitle && (
          <p className="text-ink-muted text-[13px] mt-1 m-0">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
