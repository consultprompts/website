import React from 'react';
import { Mail, MessageCircle, Instagram } from 'lucide-react';
import logoSrc from '../../logo.png';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-8 text-center xl:text-left">
        <div className="flex flex-col gap-2 items-center xl:items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt="ConsultPrompts Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-display font-bold uppercase tracking-tight">Consult Prompts</span>
          </div>
        </div>

        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-ink-muted">
          <a href="mailto:consultprompts@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Mail className="w-4 h-4" />
            Email
          </a>
          <a href="https://wa.me/13026622736" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a href="https://instagram.com/consultprompts" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        </div>

        <div className="text-[10px] text-ink-muted/50 uppercase tracking-[0.3em]">
          © 2026 CONSULT PROMPTS. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
