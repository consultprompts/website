import React from 'react';
import { Mail as MailIcon, Instagram, MessageCircle } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 md:py-24 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="max-w-xl">
          <span className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-4 block">Direct Comms</span>
          <h2 className="font-display text-3xl md:text-6xl font-bold mb-6 italic">
            No gatekeepers. <br /> Just results.
          </h2>
          <p className="text-ink-muted font-light leading-relaxed">
            Have a question about a specific integration or a custom bulk deal? Reach out to the source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <a
            href="mailto:consultprompts@gmail.com"
            className="flex items-center gap-4 p-6 liquid-glass brutalist-border rounded-xl group min-w-0 transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 rounded bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-bg-base transition-colors shrink-0">
              <MailIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-muted block mb-1">Email Strategy</span>
              <span className="text-sm md:text-base lg:text-lg font-display font-bold break-words block leading-tight">
                consultprompts@gmail.com
              </span>
            </div>
          </a>
          <a
            href="https://instagram.com/consultprompts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 liquid-glass brutalist-border rounded-xl group min-w-0 transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 rounded bg-brand-secondary/10 text-brand-secondary group-hover:bg-brand-secondary group-hover:text-bg-base transition-colors shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-muted block mb-1">Visual Log</span>
              <span className="text-sm md:text-base lg:text-lg font-display font-bold truncate block">@consultprompts</span>
            </div>
          </a>
          <a
            href="https://wa.me/13026622736"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 liquid-glass brutalist-border rounded-xl group min-w-0 transition-all duration-300 cursor-pointer"
          >
            <div className="p-3 rounded bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-bg-base transition-colors shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-muted block mb-1">WhatsApp Chat</span>
              <span className="text-sm md:text-base lg:text-lg font-display font-bold truncate block">+1 (302) 662 2736</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
