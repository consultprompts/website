import React from 'react';
import { Zap } from 'lucide-react';

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header id="hero" className="relative min-h-screen flex flex-col px-6 overflow-hidden">
      {/* Subtle top-right glow */}
      <div className="hidden md:block absolute top-0 right-0 w-[700px] h-[550px] bg-brand-primary/6 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 relative z-10">
        <p
          className="text-brand-primary text-xs font-bold uppercase tracking-widest mt-32 mb-10"
        >
          Local Web Design — Live in 72 Hours
        </p>

        <h1
          className="font-display font-black leading-[0.95] tracking-[-0.03em] mb-8"
        >
          <span className="block text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-white">
            A website your
          </span>
          <span className="block text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-white">
            neighbors <em className="text-brand-primary italic">actually</em> use.
          </span>
        </h1>

        <div
          className="max-w-lg"
        >
          <p className="text-ink-muted text-base md:text-lg leading-relaxed mb-10">
            We build fast, no-nonsense sites for local businesses. Three days, three prices, no
            agency overhead. Starting at $299.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollTo('pricing')}
              className="bg-brand-primary text-bg-base font-bold px-8 py-4 rounded-xl hover:bg-brand-primary/90 transition-colors cursor-pointer"
            >
              See pricing →
            </button>
            <button
              onClick={() => scrollTo('reviews')}
              className="border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:border-white/50 transition-colors cursor-pointer"
            >
              View recent work
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-10 md:py-16 border-y border-white/5 bg-bg-base/50 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <div className="marquee-track">
            {[0, 1, 2, 3].map((g) => (
              <span
                key={g}
                className="text-xs md:text-2xl uppercase tracking-widest font-black text-white flex items-center gap-4 md:gap-10 pr-4 md:pr-10"
              >
                <Zap className="w-5 h-5 md:w-8 md:h-8 text-brand-primary fill-current" />
                72-HOUR DELIVERY
                <Zap className="w-5 h-5 md:w-8 md:h-8 text-brand-primary fill-current" />
                GLOBAL SEO BOOST
                <Zap className="w-5 h-5 md:w-8 md:h-8 text-brand-primary fill-current" />
                5+ YEARS EXPERIENCE
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
