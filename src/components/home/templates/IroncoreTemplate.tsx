import React, { useState } from 'react';
import { Menu, X, Dumbbell, Flame, Timer, HeartPulse, ArrowRight } from 'lucide-react';

// High-energy strength & conditioning gym. Black/electric-blue palette.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const CONDENSED = '"Arial Narrow", "Helvetica Neue Condensed", ui-sans-serif, sans-serif';

const STATS = [
  { value: '1,200+', label: 'Active members' },
  { value: '46', label: 'Classes / week' },
  { value: '18k', label: 'Sq ft of iron' },
  { value: '24/7', label: 'Open gym' },
];

const PROGRAMS = [
  { icon: Dumbbell, name: 'Strength', desc: 'Barbell-first programming with tested percentages and real coaching eyes on every set.' },
  { icon: Flame, name: 'Conditioning', desc: 'Engine work that scales from first class to competition pace. Sweat guaranteed.' },
  { icon: HeartPulse, name: 'Recovery', desc: 'Sauna, cold plunge and mobility labs — the half of training most gyms skip.' },
];

const SCHEDULE = [
  { day: 'MON', name: 'Strength 101', time: '6:00 / 12:00 / 18:00' },
  { day: 'TUE', name: 'Conditioning', time: '6:30 / 17:30' },
  { day: 'WED', name: 'Olympic Lifting', time: '7:00 / 18:00' },
  { day: 'THU', name: 'Engine Room', time: '6:30 / 17:30' },
  { day: 'FRI', name: 'Heavy Day', time: '6:00 / 12:00 / 18:00' },
  { day: 'SAT', name: 'Team WOD + Recovery', time: '9:00 / 10:30' },
];

const COACHES = [
  { name: 'Dana Reyes', role: 'Head Coach · Strength', cred: 'CSCS · USAW L2', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Marcus Cole', role: 'Conditioning', cred: 'CF-L3 · 10y coaching', img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=400' },
  { name: 'Ava Lindqvist', role: 'Mobility & Recovery', cred: 'DPT · FRC certified', img: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=400' },
];

const TIERS = [
  { name: 'OFF-PEAK', price: '$59', per: '/mo', perks: ['Open gym 10am–4pm', 'Locker access', 'App tracking'] },
  { name: 'UNLIMITED', price: '$99', per: '/mo', perks: ['All classes', 'Open gym 24/7', 'Recovery zone', 'Guest passes'], featured: true },
  { name: 'COMPETE', price: '$149', per: '/mo', perks: ['Everything in Unlimited', '1-on-1 monthly coaching', 'Comp programming'] },
];

const NAV_LINKS = ['Classes', 'Coaches', 'Membership'];

export default function IroncoreTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#0A0C10] text-[#F4F6FA]" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="bg-[#0A0C10]/95 backdrop-blur-sm sticky top-0 z-20 border-b border-[#1D2430]">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter text-lg" style={{ fontFamily: CONDENSED }}>
            <Dumbbell className="w-5 h-5 text-[#3B82F6]" aria-hidden="true" /> Ironcore
          </span>
          <nav className="hidden @md:flex items-center gap-7 text-[13px] font-bold uppercase tracking-wide text-[#8B96A8]">
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#F4F6FA] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-0.5 after:bg-[#3B82F6] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-sm bg-[#3B82F6] text-[#FFFFFF] text-[13px] font-black uppercase tracking-wide transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_6px_20px_-6px_rgba(59,130,246,0.7)] cursor-pointer">
              Join now
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm font-bold uppercase tracking-wide text-[#8B96A8] border-t border-[#1D2430]">
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer hover:text-[#F4F6FA] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-sm bg-[#3B82F6] text-[#FFFFFF] text-sm font-black uppercase tracking-wide cursor-pointer self-start">
              Join now
            </button>
          </nav>
        )}
      </header>

      {/* Hero — dark with diagonal accent shapes */}
      <div className="relative overflow-hidden px-6 py-24 @md:py-32 text-center">
        <div className="absolute -top-10 -left-16 w-72 h-72 bg-[#3B82F6]/15 rotate-12" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-10 w-80 h-80 bg-[#3B82F6]/10 -rotate-12" aria-hidden="true" />
        <div className="absolute top-1/3 right-0 w-40 h-1.5 bg-[#3B82F6]/40 -rotate-12" aria-hidden="true" />
        <p className="relative text-[11px] font-black tracking-[0.3em] text-[#3B82F6] mb-5" style={{ fontFamily: CONDENSED }}>
          STRENGTH · CONDITIONING · RECOVERY
        </p>
        <h3 className="relative text-5xl @md:text-7xl font-black uppercase tracking-tighter leading-[0.92] mb-6" style={{ fontFamily: CONDENSED }}>
          Train harder.<br /><span className="text-[#3B82F6]">Live stronger.</span>
        </h3>
        <p className="relative text-sm @md:text-base text-[#8B96A8] max-w-sm mx-auto mb-9 leading-relaxed">
          Coach-led classes, 24/7 open gym and a recovery floor that actually gets used. No mirrors-and-selfies fitness here.
        </p>
        <div className="relative flex flex-col @md:flex-row items-center justify-center gap-3">
          <button type="button" className="group px-8 py-4 rounded-sm bg-[#3B82F6] text-[#FFFFFF] font-black uppercase tracking-wide transition-all duration-200 hover:bg-[#2563EB] hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(59,130,246,0.8)] cursor-pointer inline-flex items-center gap-2">
            Start free week <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </button>
          <button type="button" className="px-8 py-4 rounded-sm border border-[#2A3546] text-[#F4F6FA] font-black uppercase tracking-wide transition-all duration-200 hover:border-[#3B82F6] hover:text-[#3B82F6] cursor-pointer">
            Tour the gym
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-y border-[#1D2430] bg-[#0D1117] px-6 py-8">
        <div className="max-w-2xl mx-auto grid grid-cols-2 @md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label} className="group cursor-default">
              <p className="text-2xl @md:text-3xl font-black transition-colors duration-200 group-hover:text-[#3B82F6]" style={{ fontFamily: CONDENSED }}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#8B96A8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Programs */}
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <h4 className="text-3xl font-black uppercase tracking-tight mb-8" style={{ fontFamily: CONDENSED }}>Programs</h4>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
          {PROGRAMS.map(({ icon: Icon, name, desc }) => (
            <div key={name} className="group bg-[#11151C] border border-[#1D2430] p-6 transition-all duration-300 hover:border-[#3B82F6] hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(59,130,246,0.5)] cursor-default">
              <Icon className="w-6 h-6 text-[#3B82F6] mb-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              <h5 className="font-black uppercase tracking-tight mb-2" style={{ fontFamily: CONDENSED }}>{name}</h5>
              <p className="text-xs text-[#8B96A8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Class schedule */}
      <div className="px-6 pb-16 max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h4 className="text-3xl font-black uppercase tracking-tight" style={{ fontFamily: CONDENSED }}>This week</h4>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#3B82F6] cursor-pointer transition-colors duration-200 hover:text-[#60A5FA]">Full schedule →</span>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-2">
          {SCHEDULE.map(s => (
            <div key={s.day} className="group flex items-center gap-4 bg-[#11151C] border border-[#1D2430] px-4 py-3.5 transition-all duration-200 hover:border-[#3B82F6]/60 hover:bg-[#0D1523] cursor-default">
              <span className="w-10 text-xs font-black text-[#3B82F6] flex-shrink-0" style={{ fontFamily: CONDENSED }}>{s.day}</span>
              <span className="flex-1 text-sm font-bold transition-colors duration-200 group-hover:text-[#60A5FA]">{s.name}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#8B96A8] flex-shrink-0"><Timer className="w-3 h-3" aria-hidden="true" />{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coaches */}
      <div className="bg-[#0D1117] border-y border-[#1D2430] px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h4 className="text-3xl font-black uppercase tracking-tight mb-8" style={{ fontFamily: CONDENSED }}>Coaches</h4>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            {COACHES.map(c => (
              <div key={c.name} className="group bg-[#11151C] border border-[#1D2430] overflow-hidden transition-all duration-300 hover:border-[#3B82F6]/60 hover:shadow-[0_16px_36px_-16px_rgba(59,130,246,0.4)] cursor-default">
                <div className="overflow-hidden">
                  <img src={c.img} alt={c.name} loading="lazy" className="w-full aspect-square object-cover bg-[#1D2430] transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-[11px] text-[#8B96A8] mt-0.5">{c.role}</p>
                  <p className="text-[10px] font-bold text-[#3B82F6] mt-2 tracking-widest">{c.cred}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership */}
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <h4 className="text-3xl font-black uppercase tracking-tight mb-8" style={{ fontFamily: CONDENSED }}>Membership</h4>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
          {TIERS.map(t => (
            <div
              key={t.name}
              className={`group p-6 border transition-all duration-300 hover:-translate-y-1 cursor-default ${
                t.featured
                  ? 'border-[#3B82F6] bg-[#0D1523] hover:shadow-[0_16px_40px_-14px_rgba(59,130,246,0.6)]'
                  : 'border-[#1D2430] bg-[#11151C] hover:border-[#3B82F6]/50'
              }`}
            >
              {t.featured && <p className="text-[9px] font-black tracking-[0.2em] text-[#3B82F6] mb-2" style={{ fontFamily: CONDENSED }}>MOST POPULAR</p>}
              <p className="text-xs font-black tracking-widest text-[#8B96A8] mb-2" style={{ fontFamily: CONDENSED }}>{t.name}</p>
              <p className="mb-5"><span className="text-4xl font-black" style={{ fontFamily: CONDENSED }}>{t.price}</span><span className="text-xs text-[#8B96A8]">{t.per}</span></p>
              <ul className="flex flex-col gap-2 text-xs text-[#B7C0CE] mb-6">
                {t.perks.map(p => <li key={p} className="flex items-start gap-2"><span className="text-[#3B82F6] font-black">—</span>{p}</li>)}
              </ul>
              <button type="button" className={`w-full py-2.5 rounded-sm text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                t.featured ? 'bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#2563EB]' : 'border border-[#2A3546] text-[#F4F6FA] hover:border-[#3B82F6] hover:text-[#3B82F6]'
              }`}>
                Choose {t.name.toLowerCase()}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA band */}
      <div className="bg-[#3B82F6] px-6 py-14 text-center">
        <h4 className="text-3xl @md:text-4xl font-black uppercase tracking-tight text-[#FFFFFF] mb-3" style={{ fontFamily: CONDENSED }}>First week's on us.</h4>
        <p className="text-sm text-[#DBEAFE] mb-7 max-w-sm mx-auto">Unlimited classes, open gym and recovery floor. No card, no contract, no sales pitch.</p>
        <button type="button" className="px-9 py-4 rounded-sm bg-[#0A0C10] text-[#FFFFFF] font-black uppercase tracking-wide transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_12px_32px_-10px_rgba(10,12,16,0.8)] cursor-pointer">
          Claim free week
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1D2430] px-6 py-10">
        <div className="max-w-2xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter" style={{ fontFamily: CONDENSED }}>
            <Dumbbell className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" /> Ironcore
          </span>
          <div className="flex items-center gap-6 text-xs text-[#8B96A8]">
            {['Schedule', 'Pricing', 'Coaches', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#3B82F6]">{l}</span>
            ))}
          </div>
          <span className="text-[11px] text-[#5B6678]">© 2026 Ironcore Fitness</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-sm text-xs bg-[#11151C] border border-[#1D2430] text-[#8B96A8] shadow-lg z-10">
        <span className="flex-1">Cookies fuel our analytics the way chalk fuels PRs. Accept?</span>
        <button type="button" className="px-3 py-1.5 rounded-sm font-black uppercase bg-[#3B82F6] text-[#FFFFFF] flex-shrink-0 transition-colors duration-200 hover:bg-[#2563EB] cursor-pointer">Accept</button>
      </div>
    </div>
  );
}
