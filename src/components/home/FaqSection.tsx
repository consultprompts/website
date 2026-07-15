import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../../data/content';
import CustomButton from '../ui/CustomButton';

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="py-24 px-6 relative border-b border-white/5">
      <div className="max-w-2xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 max-[1250px]:pb-5 px-7">
          <h2 className="section-title">Web Design FAQ.</h2>
          <p className="section-sub-title">Everything you need to know about our high-speed development process.</p>
        </div>

        <div className="space-y-4 px-5 pt-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="liquid-glass border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[-12px_14px_40px_-8px_rgba(249,115,22,0.4),12px_14px_40px_-8px_rgba(59,130,246,0.4)]">
              <CustomButton 
                onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                variant="ghost" 
                size="none" 
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className="font-bold tracking-wide italic">{faq.question}</span>
                {openFaq === i ? <Minus className="w-4 h-4 text-brand-primary" /> : <Plus className="w-4 h-4 text-brand-primary" />}
              </CustomButton>
              <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-ink-muted text-sm leading-relaxed font-light">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
