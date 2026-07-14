import React from 'react';
import { ChevronLeft } from 'lucide-react';
import CustomButton from '../ui/CustomButton';

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
      style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' }}
      className={`${onBack ? 'flex' : 'hidden md:flex'} px-4 md:px-8 py-3 md:py-4 items-center gap-4 flex-shrink-0`}
    >
      {onBack && (
        <CustomButton
          onClick={onBack}
          aria-label="Back"
          variant="icon"
          size="sm"
          className="hover:bg-white/5 flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </CustomButton>
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
