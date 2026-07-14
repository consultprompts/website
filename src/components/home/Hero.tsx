import React from 'react';
import AuroraBackground from '../ui/AuroraBackground';
import CustomButton from '../ui/CustomButton';

const STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34',  label: 'Sites Shipped' },
  { value: '72h', label: 'Avg. Turnaround' },
];

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header id="hero" className="relative overflow-hidden">
      <AuroraBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pt-40 pb-20 px-7">
        <p className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-6">Local Web Design — Live in 72 Hours</p>
        <h1 className="font-display font-black leading-[0.95] tracking-[-0.03em] mb-6 text-white text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem]">A website your neighbors{' '} <span className="text-gradient">actually</span> use.</h1>
        <p className="text-ink-muted text-base md:text-lg leading-relaxed mb-10 max-w-lg">We build fast, no-nonsense sites for local businesses. Three days, three prices, no agency overhead.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <CustomButton onClick={() => scrollTo('pricing')} arrow>See pricing</CustomButton>
          <CustomButton onClick={() => scrollTo('reviews')} variant="outline">View recent work</CustomButton>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-20 border-y border-white/5 bg-bg-base/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-ink-muted mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
