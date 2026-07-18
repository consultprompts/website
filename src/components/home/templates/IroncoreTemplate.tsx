import React, { useState } from 'react';
import { Menu, X, Dumbbell, Flame, HeartPulse, ArrowRight, Check, Zap } from 'lucide-react';
import Reveal from './Reveal';

// High-energy athletic dark mode. Black/neon-green, condensed uppercase
// type, hard edges, sharp pricing cards.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const CONDENSED = '"Arial Narrow", "Helvetica Neue Condensed", ui-sans-serif, sans-serif';

const BLACK = '#070907';
const PANEL = '#10140F';
const NEON = '#B4FF39';
const NEON_DIM = '#8BCC22';
const GRAY = '#8A9385';
const LINE = '#1E241C';

const STATS = [
  { value: '1,200+', label: 'Active members' },
  { value: '46', label: 'Classes / week' },
  { value: '24/7', label: 'Open gym' },
];

const PROGRAMS = [
  { icon: Dumbbell, name: 'Strength', desc: 'Barbell-first programming with tested percentages and coaching eyes on every set.' },
  { icon: Flame, name: 'Conditioning', desc: 'Engine work that scales from first class to competition pace. Sweat guaranteed.' },
  { icon: HeartPulse, name: 'Recovery', desc: 'Sauna, cold plunge and mobility labs — the half of training most gyms skip.' },
];

const TIERS = [
  { name: 'OFF-PEAK', price: '$59', per: '/mo', perks: ['Open gym 10am–4pm', 'Locker access', 'App tracking'], featured: false },
  { name: 'UNLIMITED', price: '$99', per: '/mo', perks: ['All classes', 'Open gym 24/7', 'Recovery zone', 'Guest passes'], featured: true },
  { name: 'COMPETE', price: '$149', per: '/mo', perks: ['Everything in Unlimited', '1-on-1 monthly coaching', 'Comp programming'], featured: false },
];

const NAV_LINKS = ['Programs', 'Schedule', 'Membership'];

export default function IroncoreTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full" style={{ background: BLACK, color: '#F2F5EE', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur-sm border-b" style={{ background: `${BLACK}F2`, borderColor: LINE }}>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter text-lg" style={{ fontFamily: CONDENSED }}>
            <Zap className="w-5 h-5" style={{ color: NEON }} aria-hidden="true" />
            Iron<span style={{ color: NEON }}>core</span>
          </span>
          <nav className="hidden @md:flex items-center gap-7 text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: GRAY }}>
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#F2F5EE] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-[2px] after:bg-[#B4FF39] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-sm text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-200 hover:shadow-[0_0_24px_-4px_rgba(180,255,57,0.6)] cursor-pointer" style={{ background: NEON, color: BLACK }}>
              Free trial
            </button>
            <button
              type="button"
              className="@md:hidden p-1.5 cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm border-t" style={{ color: GRAY, borderColor: LINE }}>
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer font-bold uppercase tracking-[0.15em] text-[12px] hover:text-[#F2F5EE] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-sm text-[12px] font-black uppercase tracking-[0.15em] cursor-pointer self-start" style={{ background: NEON, color: BLACK }}>
              Free trial
            </button>
          </nav>
        )}
      </header>

      {/* Hero — gritty photo, huge condensed type, neon slash */}
      <Reveal>
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BLACK}66 0%, ${BLACK} 94%)` }} />
        <div className="relative px-6 pt-24 pb-20 @md:pt-32 @md:pb-24">
          <div className="max-w-3xl mx-auto">
            <p className="text-[11px] font-black tracking-[0.35em] mb-5" style={{ color: NEON }}>STRENGTH & CONDITIONING · EST. 2016</p>
            <h3 className="text-6xl @md:text-8xl font-black uppercase tracking-tighter leading-[0.88] mb-6" style={{ fontFamily: CONDENSED }}>
              Earn<br />every <span style={{ color: NEON }}>rep.</span>
            </h3>
            <p className="text-sm max-w-md mb-9 leading-relaxed" style={{ color: GRAY }}>
              18,000 square feet of iron, engine work and cold water. First week free —
              bring shoes, we handle the rest.
            </p>
            <div className="flex flex-col @md:flex-row gap-3">
              <button type="button" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:shadow-[0_0_32px_-4px_rgba(180,255,57,0.7)] cursor-pointer" style={{ background: NEON, color: BLACK }}>
                Start free week <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <button type="button" className="px-8 py-4 rounded-sm border text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:border-[#B4FF39] hover:text-[#B4FF39] cursor-pointer" style={{ borderColor: '#3A4436', color: '#F2F5EE' }}>
                Tour the floor
              </button>
            </div>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Stats — neon rules */}
      <Reveal>
      <div className="border-y px-6" style={{ borderColor: LINE }}>
        <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x" style={{ borderColor: LINE }}>
          {STATS.map(s => (
            <div key={s.label} className="py-7 text-center cursor-default group" style={{ borderColor: LINE }}>
              <p className="text-3xl @md:text-4xl font-black uppercase tracking-tighter transition-colors duration-200 group-hover:text-[#B4FF39]" style={{ fontFamily: CONDENSED }}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mt-1.5" style={{ color: GRAY }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      </Reveal>

      {/* Programs */}
      <Reveal>
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-black tracking-[0.35em] mb-3" style={{ color: NEON }}>TRAIN HERE</p>
        <h4 className="text-4xl font-black uppercase tracking-tighter mb-10" style={{ fontFamily: CONDENSED }}>Programs</h4>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
          {PROGRAMS.map(({ icon: Icon, name, desc }) => (
            <div key={name} className="group rounded-sm border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B4FF39] cursor-default" style={{ background: PANEL, borderColor: LINE }}>
              <Icon className="w-6 h-6 mb-4 transition-transform duration-300 group-hover:scale-110" style={{ color: NEON }} aria-hidden="true" />
              <p className="text-xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: CONDENSED }}>{name}</p>
              <p className="text-xs leading-relaxed" style={{ color: GRAY }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      </Reveal>

      {/* Pricing — sharp cards, neon featured tier */}
      <Reveal>
      <div className="px-6 py-16" style={{ background: PANEL }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-black tracking-[0.35em] mb-3 text-center" style={{ color: NEON }}>NO CONTRACTS · CANCEL ANYTIME</p>
          <h4 className="text-4xl font-black uppercase tracking-tighter mb-10 text-center" style={{ fontFamily: CONDENSED }}>Membership</h4>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4 items-stretch">
            {TIERS.map(t => (
              <div
                key={t.name}
                className={`relative rounded-sm border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1.5 cursor-default ${t.featured ? 'hover:shadow-[0_0_40px_-8px_rgba(180,255,57,0.5)]' : 'hover:border-[#3A4436]'}`}
                style={t.featured ? { background: NEON, borderColor: NEON, color: BLACK } : { background: BLACK, borderColor: LINE }}
              >
                {t.featured && (
                  <span className="absolute -top-2.5 left-7 px-2 py-0.5 text-[9px] font-black tracking-[0.25em]" style={{ background: BLACK, color: NEON }}>
                    MOST LIFTED
                  </span>
                )}
                <p className="text-[12px] font-black tracking-[0.25em] mb-4" style={{ color: t.featured ? '#3A4A12' : GRAY }}>{t.name}</p>
                <p className="mb-6" style={{ fontFamily: CONDENSED }}>
                  <span className="text-5xl font-black tracking-tighter">{t.price}</span>
                  <span className="text-sm font-bold" style={{ color: t.featured ? '#3A4A12' : GRAY }}>{t.per}</span>
                </p>
                <ul className="flex flex-col gap-2.5 text-xs flex-1">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.featured ? BLACK : NEON }} aria-hidden="true" />
                      <span style={{ color: t.featured ? '#1E2609' : '#C7CEC1' }}>{p}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-7 w-full py-3 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer hover:opacity-85"
                  style={t.featured ? { background: BLACK, color: NEON } : { background: 'transparent', color: '#F2F5EE', border: `1px solid #3A4436` }}
                >
                  Choose {t.name.toLowerCase()}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      </Reveal>

      {/* Quote band */}
      <Reveal>
      <div className="px-6 py-16 text-center border-b" style={{ borderColor: LINE }}>
        <div className="max-w-xl mx-auto">
          <p className="text-3xl @md:text-4xl font-black uppercase tracking-tighter leading-tight mb-5" style={{ fontFamily: CONDENSED }}>
            “The loudest gym in the city.<br /><span style={{ color: NEON }}>In the best way.</span>”
          </p>
          <p className="text-[10px] font-bold tracking-[0.3em]" style={{ color: GRAY }}>DANA REYES · HEAD COACH · CSCS, USAW L2</p>
        </div>
      </div>
      </Reveal>

      {/* CTA */}
      <Reveal>
      <div className="px-6 py-16 text-center">
        <h4 className="text-4xl @md:text-5xl font-black uppercase tracking-tighter mb-3" style={{ fontFamily: CONDENSED }}>
          First week's <span style={{ color: NEON }}>on us.</span>
        </h4>
        <p className="text-sm mb-8" style={{ color: GRAY }}>No card. No contract. Just show up.</p>
        <button type="button" className="px-10 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:shadow-[0_0_32px_-4px_rgba(180,255,57,0.7)] cursor-pointer" style={{ background: NEON, color: BLACK }}>
          Claim free week
        </button>
      </div>
      </Reveal>

      {/* Footer */}
      <footer className="border-t px-6 py-10" style={{ borderColor: LINE }}>
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter" style={{ fontFamily: CONDENSED }}>
            <Zap className="w-4 h-4" style={{ color: NEON }} aria-hidden="true" />
            Iron<span style={{ color: NEON }}>core</span>
          </span>
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: GRAY }}>
            {['Programs', 'Schedule', 'Membership', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#B4FF39]">{l}</span>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: '#4A5346' }}>© 2026 Ironcore Athletics</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-sm text-xs shadow-lg z-10 border" style={{ background: PANEL, color: GRAY, borderColor: LINE }}>
        <span className="flex-1">We use cookies. They don't count as a cheat meal.</span>
        <button type="button" className="px-3 py-1.5 rounded-sm font-black uppercase text-[10px] tracking-widest flex-shrink-0 transition-opacity duration-200 hover:opacity-85 cursor-pointer" style={{ background: NEON, color: BLACK }}>Accept</button>
      </div>
    </div>
  );
}
