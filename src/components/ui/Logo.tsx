import React from 'react';
import logoSrc from '../../logo.png';

const FALLBACK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-bg-base w-5 h-5 fill-current"><path d="m5 14 7-3 7 3V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v9Z"/><path d="M7 18h10"/><path d="M10 22h4"/></svg>';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };

export default function Logo({ size = 'lg', showText = true, textClassName = 'font-display font-bold tracking-tight uppercase text-xl' }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeMap[size]} flex items-center justify-center overflow-hidden`}>
        <img
          src={logoSrc}
          alt="ConsultPrompts Logo"
          className="w-full h-full object-contain border-none bg-transparent"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) parent.innerHTML = FALLBACK_SVG;
          }}
        />
      </div>
      {showText && <span className={textClassName}>Consult Prompts</span>}
    </div>
  );
}
