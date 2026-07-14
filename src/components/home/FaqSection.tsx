import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../../data/content';
import CustomButton from '../ui/CustomButton';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="py-24 px-6 relative border-b border-white/5">
      <div className="max-w-2xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 px-7">
          <h2 className="section-title">Web Design FAQ.</h2>
          <p className="section-sub-title">Everything you need to know about our high-speed development process.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="liquid-glass border border-white/10 rounded-xl">
              <CustomButton 
                onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                variant="ghost" 
                size="none" 
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02]"
              >
                <span className="font-bold tracking-wide italic">{faq.question}</span>
                {openFaq === i ? <Minus className="w-4 h-4 text-brand-primary" /> : <Plus className="w-4 h-4 text-brand-primary" />}
              </CustomButton>
              <>
                {openFaq === i && (
                  <div><p className="px-6 pb-6 text-ink-muted text-sm leading-relaxed font-light">{faq.answer}</p></div>
                )}
              </>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
