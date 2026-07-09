import React from 'react';
import { PACKAGES } from '../../data/content';

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export default function PricingSection({ onSelectPackage }: PricingSectionProps) {
  return (
    <section id="pricing" aria-label="Pricing and Web Design Services" className="py-16 md:py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <span className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-4 block">Scalable Growth Tiers</span>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-8 italic leading-tight">Pick Your Fuel.</h2>
        </div>

        <div
          className="grid lg:grid-cols-3 gap-8 pt-4"
        >
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={
                pkg.featured
                  ? 'liquid-glass p-8 rounded-xl border border-brand-primary/40 relative flex flex-col bg-linear-to-br from-white/10 to-white/5 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-brand-primary hover:ring-[3px] hover:ring-brand-primary/40 hover:shadow-[0_0_48px_rgba(0,240,255,0.18)]'
                  : 'liquid-glass p-8 rounded-xl border border-white/[0.08] flex flex-col relative transition-[border-color,box-shadow] duration-300 hover:border-brand-primary/60 hover:ring-[3px] hover:ring-brand-primary/30 hover:shadow-[0_0_40px_rgba(0,240,255,0.12)]'
              }
            >
              {pkg.featured && (
                <div className="absolute top-0 right-0 bg-brand-primary text-bg-base text-[10px] font-black px-4 py-1 uppercase tracking-widest">
                  Best Value
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold italic mb-2">{pkg.name}</h3>
                <p className="text-ink-muted text-sm font-light">{pkg.tagline}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-display font-black leading-none">{pkg.price}</span>
                  <span className="text-xs text-ink-muted font-bold tracking-widest uppercase">/ {pkg.tier}</span>
                </div>
              </div>

              <ul className={`space-y-4 mb-10 flex-1 border-t pt-8 ${pkg.featured ? 'border-white/10' : 'border-white/5'}`}>
                {pkg.featuresIntro && (
                  <li className="font-bold text-xs uppercase tracking-widest text-brand-primary mb-2 italic">{pkg.featuresIntro}</li>
                )}
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    {feature.icon}
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPackage(pkg.id)}
                className={`liquid-glass w-full py-4 text-white font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer ${
                  pkg.featured ? 'hover:border-brand-primary' : 'hover:border-brand-primary/50'
                }`}
              >
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
