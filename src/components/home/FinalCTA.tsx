import React from 'react';
import CustomButton from '../ui/CustomButton';
import AuroraBackground from '../ui/AuroraBackground';

interface FinalCTAProps {
  onStartProject: () => void;
}

export default function FinalCTA({ onStartProject }: FinalCTAProps) {
  return (
    <section className="relative py-24 px-6 text-center overflow-hidden bg-bg-base flex flex-col items-center justify-center">
      <AuroraBackground />

      <div className="relative max-w-3xl mx-auto w-full">
        <p className="section-badge mb-6">Get Started</p>
        <h2 className="font-display font-black tracking-tight leading-[0.95] mb-6">
          <span className="text-4xl sm:text-4xl md:text-6xl text-white block">Live in 72 hours.</span>
          <span className="text-4xl sm:text-4xl md:text-6xl text-gradient italic block">Or it's free.</span>
        </h2>
        <p className="section-sub-title max-w-md mx-auto px-5 mb-10">Tell us about your business in 5 minutes. We'll send back a mockup in 24 hours.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CustomButton onClick={onStartProject} arrow className="hover:scale-105">Start your project</CustomButton>
        </div>
      </div>
    </section>
  );
}
