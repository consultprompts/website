import React from 'react';
import { motion } from 'motion/react';
import { FADE_UP } from '../ui/animations';
import { PROCESS_STEPS } from '../../data/content';

export default function ProcessSection() {
  return (
    <section id="process" aria-label="Our Web Design Process" className="py-16 md:py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div {...FADE_UP} className="mb-12 md:mb-20 text-center md:text-left relative">
          <span className="text-brand-primary text-xs font-bold uppercase tracking-widest block mb-4">Our DNA</span>
          <h2 className="font-display text-3xl md:text-6xl font-bold mb-6 italic">Simple. Brutal. Fast Web Design.</h2>
          <p className="text-ink-muted text-base md:text-lg max-w-2xl font-light">
            We've automated the fluff out of local business web design. Here's how we get your new site live in record time.
          </p>
        </motion.div>

        <div className="lg:hidden flex items-center gap-3 mb-8 opacity-60">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-primary italic">Slide</span>
          <div className="h-[1.5px] w-12 bg-brand-primary" />
        </div>

        <div className="flex md:flex-row overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-3 gap-8 md:gap-12 px-1 pt-4 pb-8 lg:pb-4 snap-x snap-mandatory brutalist-scrollbar scroll-smooth">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="liquid-glass group p-8 relative overflow-hidden flex-shrink-0 w-[calc(100vw-3rem)] md:w-[calc(50vw-3rem)] lg:w-auto snap-start rounded-xl border border-white/[0.08] transition-[border-color,box-shadow] duration-300 hover:border-brand-primary/60 hover:ring-[3px] hover:ring-brand-primary/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.12)]"
            >
              <div className="absolute top-0 right-0 font-display text-8xl font-black text-white/[0.03] -translate-y-4 translate-x-1 group-hover:text-brand-primary/5 transition-colors">
                {step.id}
              </div>
              <div className="mb-6">{step.icon}</div>
              <h3 className="font-display text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-ink-muted leading-relaxed text-sm font-light">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
