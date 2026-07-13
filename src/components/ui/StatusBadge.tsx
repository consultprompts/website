import React from 'react';

interface StatusBadgeProps {
  label: string;
  color: string;
  className?: string;
}

export default function StatusBadge({ label, color, className = '' }: StatusBadgeProps) {
  return (
    <span className={`flex items-center gap-1.5 flex-shrink-0 ${className}`}>
      <span className="relative w-2 h-2 flex-shrink-0">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.6, animationDuration: '1.6s' }}
        />
        <span className="relative block w-2 h-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
