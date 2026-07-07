import React from 'react';
import { motion } from 'motion/react';
import { FADE_UP } from '../ui/animations';

interface FinalCTAProps {
  onStartProject: () => void;
}

export default function FinalCTA({ onStartProject }: FinalCTAProps) {
  return (
    <section className="relative py-24 md:py-36 px-6 text-center overflow-hidden bg-bg-base flex flex-col items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(0,240,255,0.18)_0%,transparent_70%)]" />
        <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-primary/25 rounded-full blur-[90px]" />
      </div>
      <div className="relative max-w-3xl mx-auto w-full">
        <motion.p {...FADE_UP} className="text-brand-primary text-xs font-bold uppercase tracking-[0.3em] mb-6">
          Get Started
        </motion.p>
        <motion.h2
          {...FADE_UP}
          transition={{ delay: 0.1 }}
          className="font-display font-black tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-4xl sm:text-6xl md:text-8xl text-white block">Live in 72 hours.</span>
          <span className="text-4xl sm:text-6xl md:text-8xl text-brand-primary italic block">Or it's free.</span>
        </motion.h2>
        <motion.p
          {...FADE_UP}
          transition={{ delay: 0.2 }}
          className="text-ink-muted text-base md:text-lg max-w-md mx-auto mb-10"
        >
          Tell us about your business in 5 minutes. We'll send back a mockup in 24 hours.
        </motion.p>
        <motion.div
          {...FADE_UP}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartProject}
            className="bg-brand-primary text-bg-base font-black text-base md:text-lg px-8 py-4 rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-200 cursor-pointer"
          >
            Start your project →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
