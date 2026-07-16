import React, { useState } from 'react';
import { Globe, Menu, X, Star, Sparkles, CalendarCheck, BadgeCheck } from 'lucide-react';

// Boutique hair/skin/brow salon — editorial, upscale. Fixed palette,
// independent of the host site's theme tokens (see templates/index.ts note).
const SERIF = 'Georgia, "Times New Roman", serif';

const SERVICES = [
  { name: 'Hair', desc: 'Precision cuts, dimensional color and styling by senior stylists.', price: 'from $65' },
  { name: 'Skin', desc: 'Clinical facials and glow treatments that outlast the weekend.', price: 'from $85' },
  { name: 'Brows', desc: 'Shaping, lamination and tint — considered frames for your face.', price: 'from $35' },
];

const SIGNATURES = [
  { name: 'The Lumière Ritual', time: '2h 30m', price: '$210', desc: 'Hair, skin and brows in one appointment. Our most-booked experience.' },
  { name: 'Bridal Preview', time: '1h 45m', price: '$165', desc: 'Full trial styling with photographs, notes and a day-of runsheet.' },
  { name: 'Gloss & Go', time: '45m', price: '$75', desc: 'Express gloss, blowout and brow tidy for the week you need to win.' },
];

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', label: 'Color' },
  { src: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400', label: 'Skin' },
  { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=400', label: 'Brows' },
  { src: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&q=80&w=400', label: 'Styling' },
];

const TESTIMONIALS = [
  { quote: 'The only salon where I never have to explain twice.', name: 'Amara J.', role: 'Client since 2021' },
  { quote: 'Booked online at midnight, walked out gorgeous by noon.', name: 'Elise T.', role: 'Client since 2023' },
  { quote: 'My brows have never looked this intentional.', name: 'Priya S.', role: 'Client since 2022' },
];

const NAV_LINKS = ['Services', 'Signatures', 'Gallery', 'Stylists'];

export default function LumiereTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#FAF7F2] text-[#2A2036]" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="bg-[#221830]/97 backdrop-blur-sm text-[#F5EEFB] sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-xl tracking-wide" style={{ fontFamily: SERIF }}>Lumière <span className="italic text-[#C7A9E8]">Studio</span></span>
          <nav className="hidden @md:flex items-center gap-7 text-[13px] text-[#B4A3C8]">
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#F5EEFB] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#C7A9E8] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Globe className="hidden @md:block w-4 h-4 text-[#B4A3C8] transition-colors duration-200 hover:text-[#F5EEFB] cursor-pointer" aria-hidden="true" />
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-full bg-[#8B5CF6] text-[#FFFFFF] text-[13px] font-bold transition-all duration-200 hover:bg-[#7C3AED] hover:shadow-[0_6px_20px_-6px_rgba(139,92,246,0.6)] cursor-pointer">
              Book now
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm text-[#B4A3C8] border-t border-[#3B2B4D]">
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer hover:text-[#F5EEFB] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-full bg-[#8B5CF6] text-[#FFFFFF] text-sm font-bold cursor-pointer self-start">
              Book now
            </button>
          </nav>
        )}
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-24 @md:py-32 text-center" style={{ background: 'linear-gradient(150deg, #1B1226 0%, #4C1D95 52%, #115E59 100%)' }}>
        <div className="absolute top-10 left-1/4 w-56 h-56 rounded-full bg-[#8B5CF6]/25 blur-[80px]" aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-[#2DD4BF]/20 blur-[80px]" aria-hidden="true" />
        <p className="relative text-[11px] font-bold tracking-[0.3em] text-[#5EEAD4] mb-5">HAIR · SKIN · BROWS</p>
        <h3 className="relative text-4xl @md:text-6xl text-[#FFFFFF] leading-[1.05] mb-6" style={{ fontFamily: SERIF }}>
          Your best look,<br /><em>beautifully booked.</em>
        </h3>
        <p className="relative text-sm @md:text-base text-[#D5C7EA] max-w-md mx-auto mb-9 leading-relaxed">
          Boutique salon care with online booking, honest pricing and zero waiting-room limbo. In and out, glowing.
        </p>
        <div className="relative flex flex-col @md:flex-row items-center justify-center gap-3">
          <button type="button" className="px-8 py-3.5 rounded-full bg-[#8B5CF6] text-[#FFFFFF] font-bold transition-all duration-200 hover:bg-[#7C3AED] hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(139,92,246,0.7)] cursor-pointer">
            Book an appointment
          </button>
          <button type="button" className="px-8 py-3.5 rounded-full border border-[#D5C7EA]/50 text-[#FFFFFF] font-bold transition-all duration-200 hover:bg-[#FFFFFF] hover:text-[#2A2036] cursor-pointer">
            Browse services
          </button>
        </div>
        <div className="relative flex items-center justify-center gap-6 mt-10 text-[11px] text-[#B4A3C8]">
          <span className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-[#5EEAD4]" aria-hidden="true" /> 4.9 on Google</span>
          <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-[#5EEAD4]" aria-hidden="true" /> Same-week openings</span>
          <span className="hidden @md:flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#5EEAD4]" aria-hidden="true" /> Senior stylists only</span>
        </div>
      </div>

      {/* Services */}
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#8B5CF6] mb-3">WHAT WE DO</p>
        <h4 className="text-3xl text-center mb-10" style={{ fontFamily: SERIF }}>Our services</h4>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
          {SERVICES.map(s => (
            <div
              key={s.name}
              className="group rounded-2xl bg-[#FFFFFF] border border-[#EAE2F2] p-7 transition-all duration-300 hover:border-[#8B5CF6]/40 hover:shadow-[0_16px_36px_-14px_rgba(76,29,149,0.3)] hover:-translate-y-1 cursor-default"
            >
              <div className="flex items-baseline justify-between mb-3">
                <h5 className="text-xl transition-colors duration-200 group-hover:text-[#7C3AED]" style={{ fontFamily: SERIF }}>{s.name}</h5>
                <span className="text-xs font-bold text-[#8B5CF6]">{s.price}</span>
              </div>
              <p className="text-sm text-[#6E6280] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signature treatments */}
      <div className="bg-[#F1EAF8] px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#8B5CF6] mb-3">MOST LOVED</p>
          <h4 className="text-3xl text-center mb-10" style={{ fontFamily: SERIF }}>Signature experiences</h4>
          <div className="flex flex-col gap-3">
            {SIGNATURES.map(s => (
              <div
                key={s.name}
                className="group flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-6 bg-[#FFFFFF] rounded-2xl px-6 py-5 transition-all duration-300 hover:shadow-[0_14px_32px_-14px_rgba(76,29,149,0.35)] hover:-translate-y-0.5 cursor-default"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold transition-colors duration-200 group-hover:text-[#7C3AED]" style={{ fontFamily: SERIF }}>{s.name}</h5>
                  <p className="text-xs text-[#6E6280] mt-1 leading-relaxed">{s.desc}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                  <span className="text-[#9A8DAD] text-xs">{s.time}</span>
                  <span className="font-bold text-[#7C3AED]">{s.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#8B5CF6] mb-3">RECENT WORK</p>
        <h4 className="text-3xl text-center mb-10" style={{ fontFamily: SERIF }}>The gallery</h4>
        <div className="grid grid-cols-2 @md:grid-cols-4 gap-3">
          {GALLERY.map(g => (
            <div key={g.label} className="group relative overflow-hidden rounded-xl cursor-pointer">
              <img src={g.src} alt={g.label} loading="lazy" className="aspect-square object-cover w-full bg-[#EAE2F2] transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(27,18,38,0.8) 100%)' }}>
                <span className="text-xs font-bold text-[#FFFFFF] tracking-widest">{g.label.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#221830] text-[#F5EEFB] px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 @md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="rounded-2xl border border-[#3B2B4D] p-6 transition-all duration-300 hover:border-[#8B5CF6]/60 hover:bg-[#2A2040] cursor-default">
              <div className="flex gap-0.5 mb-3" aria-hidden="true">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-[#C7A9E8] fill-[#C7A9E8]" />)}
              </div>
              <p className="text-sm italic text-[#D5C7EA] mb-3 leading-relaxed" style={{ fontFamily: SERIF }}>“{t.quote}”</p>
              <p className="text-xs font-bold">{t.name}</p>
              <p className="text-[10px] text-[#8B7A9E] mt-0.5">{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gift card CTA */}
      <div className="px-6 py-16 text-center">
        <h4 className="text-2xl @md:text-3xl mb-3" style={{ fontFamily: SERIF }}>Give the glow.</h4>
        <p className="text-sm text-[#6E6280] max-w-sm mx-auto mb-7">Digital gift cards from $50, delivered instantly with a booking link included.</p>
        <button type="button" className="px-8 py-3.5 rounded-full bg-[#2A2036] text-[#FFFFFF] font-bold transition-all duration-200 hover:bg-[#8B5CF6] hover:scale-[1.03] cursor-pointer">
          Send a gift card
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#EAE2F2] bg-[#FFFFFF] px-6 py-10">
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-lg" style={{ fontFamily: SERIF }}>Lumière <span className="italic text-[#8B5CF6]">Studio</span></span>
          <div className="flex items-center gap-6 text-xs text-[#6E6280]">
            {['Book', 'Gift Cards', 'Careers', 'Instagram'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#7C3AED]">{l}</span>
            ))}
          </div>
          <span className="text-[11px] text-[#9A8DAD]">© 2026 Lumière Studio</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-xl text-xs bg-[#221830] text-[#B4A3C8] shadow-lg z-10">
        <span className="flex-1">We use cookies to keep your bookings smooth and your visits personal.</span>
        <button type="button" className="px-3 py-1.5 rounded-full font-bold bg-[#8B5CF6] text-[#FFFFFF] flex-shrink-0 transition-colors duration-200 hover:bg-[#7C3AED] cursor-pointer">Accept</button>
      </div>
    </div>
  );
}
