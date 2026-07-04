import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { FADE_UP } from '../ui/animations';
import { FAQS } from '../../data/content';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="py-24 px-6 relative border-b border-white/5">
      <div className="max-w-3xl mx-auto">
        <motion.div {...FADE_UP} className="mb-16 text-center">
          <h2 className="font-display text-3xl md:text-6xl font-bold italic">Web Design FAQ.</h2>
          <p className="text-ink-muted mt-4 font-light">Everything you need to know about our high-speed development process.</p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              className="liquid-glass border border-white/10 rounded-xl overflow-hidden mb-4 last:mb-0 transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span className="font-bold tracking-wide italic">{faq.question}</span>
                {openFaq === i ? <Minus className="w-4 h-4 text-brand-primary" /> : <Plus className="w-4 h-4 text-brand-primary" />}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-ink-muted text-sm leading-relaxed font-light">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
