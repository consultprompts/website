import React from 'react';
import { PROCESS_STEPS } from '../../data/content';

export default function ProcessSection() {
  return (
    <section id="process" aria-label="Our Web Design Process" className="py-16 md:py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 max-[1250px]:pb-5 px-7">
          <span className="section-badge">
            Our DNA
          </span>
          <h2 className="section-title">
            Simple. Brutal. Fast.
          </h2>
          <p className="section-sub-title">
            We've automated the fluff out of local business web design. Here's how we get your new site live in record time.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[1250px]:grid-cols-3 gap-8 md:gap-12 px-5 pt-4 pb-4">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.id} className={`group p-8 relative overflow-hidden rounded-xl border border-white/[0.08] transition-all duration-300 hover:scale-[1.02] hover:shadow-[-12px_14px_40px_-8px_rgba(249,115,22,0.4),12px_14px_40px_-8px_rgba(59,130,246,0.4)] ${i === 1 ? 'min-[1250px]:-translate-y-3' : ''}`}>
              <div className="absolute top-0 right-0 font-display text-8xl font-black text-white/[0.03] -translate-y-4 translate-x-1 group-hover:text-brand-primary/5 transition-colors">
                {step.id}
              </div>
              <div className="mb-6">
                {step.icon}
              </div>
              <h3 className="font-display text-xl font-bold mb-4">
                {step.title}
              </h3>
              <p className="text-ink-muted leading-relaxed text-sm font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
