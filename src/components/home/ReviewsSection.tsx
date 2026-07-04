import React from 'react';
import { motion } from 'motion/react';
import { Star, User as UserIcon } from 'lucide-react';
import { FADE_UP, REVIEWS_VARIANTS } from '../ui/animations';
import { REVIEWS } from '../../data/content';

const STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34', label: 'Shops Shipped' },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" aria-label="Client Results and Success Stories" className="py-16 md:py-24 px-6 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          {...FADE_UP}
          className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8"
        >
          <div>
            <span className="text-brand-primary text-xs font-bold uppercase tracking-widest block mb-4">The Receipts</span>
            <h2 className="font-display text-4xl md:text-6xl font-bold italic leading-tight">
              Built for the block.
              <br />
              <span className="text-brand-primary">Loved</span> by it.
            </h2>
          </div>
          <div className="flex gap-10 lg:gap-14 items-start lg:pt-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl md:text-5xl font-black text-brand-primary leading-none">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex md:flex-row overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-3 gap-6 pt-4 pb-6 lg:pb-4 px-1 snap-x snap-mandatory brutalist-scrollbar scroll-smooth">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.client}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={REVIEWS_VARIANTS}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="liquid-glass group flex flex-col gap-5 p-6 rounded-2xl flex-shrink-0 w-[calc(100vw-3rem)] md:w-[calc(50vw-3rem)] lg:w-auto snap-start transition-[border-color,box-shadow,ring] duration-300 hover:border-brand-primary/60 hover:ring-[3px] hover:ring-brand-primary/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.12)]"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-brand-primary fill-current" />
                ))}
              </div>

              <p className="text-white text-sm leading-relaxed flex-1">"{review.quote}"</p>

              <div className="rounded-xl overflow-hidden aspect-[16/9] bg-[#0d0d0d] relative">
                <div className="shimmer-skeleton absolute inset-0" />
                <img
                  src={review.image}
                  alt={review.client}
                  className="w-full h-full object-cover opacity-0 transition-all duration-700 group-hover:scale-105"
                  onLoad={(e) => {
                    e.currentTarget.classList.add('opacity-100');
                    const shimmer = e.currentTarget.previousElementSibling as HTMLElement | null;
                    if (shimmer) shimmer.style.opacity = '0';
                  }}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm leading-tight">{review.author}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{review.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
