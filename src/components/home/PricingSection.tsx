import React from 'react';
import AuroraBackground from '../ui/AuroraBackground';
import { PACKAGES } from '../../data/content';
import CustomButton from '../ui/CustomButton';

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export default function PricingSection({ onSelectPackage }: PricingSectionProps) {
  return (
    <section id="pricing" aria-label="Pricing and Web Design Services" className="py-16 md:py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center pb-20 max-[1250px]:pb-5 px-7">
          <span className="section-badge">Scalable Growth Tiers</span>
          <h2 className="section-title">Pick Your Fuel.</h2>
          <p className="section-sub-title">We build fast, no-nonsense sites for local businesses. Three days, three prices, no agency overhead.</p>
        </div>

        <div className="grid grid-cols-1 min-[1250px]:grid-cols-3 gap-8 md:gap-12 px-5 pt-4 pb-4">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`p-8 rounded-xl border ${pkg.featured ? 'border-brand-primary min-[1250px]:-translate-y-3' : 'border-white/[0.08]'} flex flex-col relative hover-shadow-theme transition-all duration-300 hover:scale-[1.02]`}>
              {pkg.featured && (
                <div className="absolute top-0 right-0 bg-brand-primary text-bg-base text-[10px] font-black px-4 py-1 uppercase tracking-widest rounded-tr-lg rounded-bl-lg">
                  Best Value
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-xl font-bold italic mb-2">{pkg.name}</h3>
                <p className="text-ink-muted text-sm font-light">{pkg.tagline}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-black leading-none">
                    {pkg.price}
                  </span>
                  <span className="text-xs text-ink-muted font-bold tracking-widest uppercase">
                    / {pkg.tier}
                  </span>
                </div>
                <span className="inline-block mt-3 text-l font-display font-normal leading-none bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                  + {pkg.maintenance} maintenance
                </span>
              </div>

              <ul className={`space-y-4 mb-10 flex-1 border-t pt-8 ${pkg.featured ? 'border-white/10' : 'border-white/5'}`}>
                {pkg.featuresIntro && (
                  <li className="font-bold text-xs uppercase tracking-widest text-brand-primary mb-5 italic">
                    {pkg.featuresIntro}
                  </li>
                )}
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    {feature.icon}<span>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <CustomButton onClick={() => onSelectPackage(pkg.id)} variant="filled">
                {pkg.cta}
              </CustomButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
