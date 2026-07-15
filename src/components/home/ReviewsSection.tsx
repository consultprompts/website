import React, { useState } from 'react';
import { REVIEWS } from '../../data/content';

export default function ReviewsSection() {
  const [openReview, setOpenReview] = useState<string | null>(null);

  return (
    <section id="reviews" aria-label="Client Results and Success Stories" className="py-16 md:py-24 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 px-7">
          <span className="section-badge">The Receipts</span>
          <h2 className="section-title">Built for the <span className="text-gradient">block.</span><br /><span className="text-gradient">Loved</span> by it.</h2>
          <p className="section-sub-title">We've automated the fluff out of local business web design. Here's how we get your new site live in record time.</p>
        </div>

        <div className="grid grid-cols-1 min-[1250px]:grid-cols-2 gap-8 pt-4 pb-4 px-1">
          {REVIEWS.map((review, i) => (
            <div
              key={review.client}
              className="group rounded-xl border border-white/[0.08] flex flex-col relative overflow-hidden cursor-pointer lg:cursor-default transition-all duration-300 hover:scale-[1.02] hover:shadow-[-12px_14px_40px_-8px_rgba(249,115,22,0.4),12px_14px_40px_-8px_rgba(59,130,246,0.4)]"
              onClick={() => {
                if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
                setOpenReview(prev => prev === review.client ? null : review.client);
              }}
            >
              <div className="rounded-t-xl overflow-hidden aspect-[16/9] bg-[#0d0d0d] relative">
                <div className="shimmer-skeleton absolute inset-0" />
                <img
                  src={review.image}
                  alt={review.client}
                  className="w-full h-full object-cover opacity-0 transition-all duration-700"
                  onLoad={(e) => {
                    e.currentTarget.classList.add('opacity-100');
                    const shimmer = e.currentTarget.previousElementSibling as HTMLElement | null;
                    if (shimmer) shimmer.style.opacity = '0';
                  }}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-x-0 bottom-0 z-10 bg-white/80 backdrop-blur-sm p-6 pointer-events-none transition-all duration-300 ease-out lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:pointer-events-auto ${
                    openReview === review.client ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-full'
                  }`}
                >
                  <p className="italic text-base leading-relaxed text-black">"{review.quote}"</p>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="font-bold text-sm leading-tight">{review.author}</div>
                    <div className="text-sm text-ink-muted mt-0.5">{review.client}</div>
                  </div>
                  {review.metrics[0] && (
                    <div className="text-2xl font-display font-black text-brand-primary leading-none whitespace-nowrap">{review.metrics[0].value}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
