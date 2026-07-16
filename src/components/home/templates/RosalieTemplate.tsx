import React, { useState } from 'react';
import { Menu, X, MapPin, Clock, Phone, Star } from 'lucide-react';

// Modern French bistro. Warm cream/terracotta palette, fine-dining tone.
// Fixed palette — deliberately independent of the host site's theme tokens
// (see templates/index.ts note).
const SERIF = 'Georgia, "Times New Roman", serif';

const DISHES = [
  { name: 'Duck confit', desc: 'Crisped leg, puy lentils, cherry gastrique', price: '$34' },
  { name: 'Steak frites', desc: 'Hanger steak, café de Paris butter, twice-cooked frites', price: '$29' },
  { name: 'Ratatouille tart', desc: 'Slow summer vegetables, chèvre, thyme honey', price: '$22' },
  { name: 'Bouillabaisse', desc: 'Gulf shrimp, mussels, saffron rouille, grilled levain', price: '$36' },
  { name: 'Crème brûlée', desc: 'Vanilla bean, burnt sugar, fleur de sel', price: '$12' },
];

const PRESS = ['MICHELIN GUIDE 2025', 'EATER PHILLY — BEST BISTRO', 'JAMES BEARD SEMIFINALIST', 'PHILADELPHIA MAG TOP 50'];

const NAV_LINKS = ['Menu', 'Reservations', 'Private Events'];

export default function RosalieTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#FBF4EA] text-[#3B2A1E]" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="bg-[#FBF4EA]/95 backdrop-blur-sm sticky top-0 z-20 border-b border-[#EBDCC8]">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-2xl italic tracking-tight" style={{ fontFamily: SERIF }}>Rosalie</span>
          <nav className="hidden @md:flex items-center gap-7 text-[13px] tracking-wide text-[#8A6F55]">
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#3B2A1E] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#B91C1C] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-full bg-[#B91C1C] text-[#FFF7ED] text-[13px] font-bold tracking-wide transition-all duration-200 hover:bg-[#991B1B] hover:shadow-[0_6px_20px_-6px_rgba(185,28,28,0.5)] cursor-pointer">
              Reserve a table
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm text-[#8A6F55] border-t border-[#EBDCC8]">
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer hover:text-[#3B2A1E] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-full bg-[#B91C1C] text-[#FFF7ED] text-sm font-bold cursor-pointer self-start">
              Reserve a table
            </button>
          </nav>
        )}
      </header>

      {/* Hero — full-bleed food photography with dark overlay */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(28,15,8,0.55) 0%, rgba(28,15,8,0.75) 100%)' }} />
        <div className="relative px-6 py-24 @md:py-32 text-center">
          <p className="italic text-[#F0C27B] text-xl mb-4" style={{ fontFamily: SERIF }}>Modern French Bistro</p>
          <h3 className="text-5xl @md:text-6xl text-[#FFF7ED] leading-[1.05] mb-6" style={{ fontFamily: SERIF }}>
            A table is<br />always waiting.
          </h3>
          <p className="text-sm @md:text-base text-[#E7D3BC] max-w-md mx-auto mb-9 leading-relaxed">
            Seasonal plates, old-world wine and candlelight on Chestnut Street — fifteen years of Sunday-supper hospitality, seven nights a week.
          </p>
          <div className="flex flex-col @md:flex-row items-center justify-center gap-3">
            <button type="button" className="px-8 py-3.5 rounded-full bg-[#B91C1C] text-[#FFF7ED] font-bold transition-all duration-200 hover:bg-[#991B1B] hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(185,28,28,0.6)] cursor-pointer">
              Book your evening
            </button>
            <button type="button" className="px-8 py-3.5 rounded-full border border-[#E7D3BC]/60 text-[#FFF7ED] font-bold transition-all duration-200 hover:bg-[#FFF7ED] hover:text-[#3B2A1E] cursor-pointer">
              View the menu
            </button>
          </div>
        </div>
      </div>

      {/* Press strip */}
      <div className="border-b border-[#EBDCC8] bg-[#FFFDF8] px-6 py-5">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {PRESS.map(p => (
            <span key={p} className="text-[10px] font-bold tracking-[0.2em] text-[#B4977A] transition-colors duration-200 hover:text-[#8A6F55] cursor-default">{p}</span>
          ))}
        </div>
      </div>

      {/* Menu preview */}
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#B91C1C] mb-3">DINNER · FIVE COURSES OR À LA CARTE</p>
        <h4 className="text-3xl text-center mb-10 italic" style={{ fontFamily: SERIF }}>From the menu</h4>
        <div className="flex flex-col gap-3">
          {DISHES.map(d => (
            <div
              key={d.name}
              className="group flex items-baseline gap-3 bg-[#FFFDF8] border border-[#EBDCC8] rounded-xl px-6 py-4.5 transition-all duration-300 hover:border-[#B91C1C]/40 hover:shadow-[0_12px_28px_-12px_rgba(59,42,30,0.25)] hover:-translate-y-0.5 cursor-default"
            >
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-[15px] transition-colors duration-200 group-hover:text-[#B91C1C]" style={{ fontFamily: SERIF }}>{d.name}</h5>
                <p className="text-xs text-[#8A6F55] mt-1">{d.desc}</p>
              </div>
              <span className="font-bold text-[#B91C1C] flex-shrink-0" style={{ fontFamily: SERIF }}>{d.price}</span>
            </div>
          ))}
        </div>
        <p className="text-center mt-8">
          <span className="text-sm italic text-[#8A6F55] border-b border-[#B4977A] pb-0.5 cursor-pointer transition-colors duration-200 hover:text-[#B91C1C] hover:border-[#B91C1C]" style={{ fontFamily: SERIF }}>
            See the full menu →
          </span>
        </p>
      </div>

      {/* Our story */}
      <div className="bg-[#F3E7D3] px-6 py-16">
        <div className="max-w-2xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-10 items-center">
          <div className="overflow-hidden rounded-2xl group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=600"
              alt="Rosalie's kitchen"
              loading="lazy"
              className="aspect-[4/3] object-cover w-full bg-[#EBDCC8] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#B91C1C] mb-3">SINCE 2010</p>
            <h4 className="text-3xl italic mb-4" style={{ fontFamily: SERIF }}>Our story</h4>
            <p className="text-sm leading-relaxed text-[#6B543E] mb-5">
              Rosalie began as a Sunday supper between friends. Fifteen years on, we still cook the same way —
              slowly, seasonally, and for the people at the table rather than the camera.
            </p>
            <span className="text-sm italic text-[#8A6F55] border-b border-[#B4977A] pb-0.5 cursor-pointer transition-colors duration-200 hover:text-[#B91C1C] hover:border-[#B91C1C]" style={{ fontFamily: SERIF }}>
              Meet the kitchen →
            </span>
          </div>
        </div>
      </div>

      {/* Chef quote band */}
      <div className="bg-[#3B2A1E] text-[#FFF7ED] px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center gap-1 mb-5" aria-hidden="true">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-[#F0C27B] fill-[#F0C27B]" />)}
          </div>
          <p className="text-xl @md:text-2xl italic leading-relaxed mb-5" style={{ fontFamily: SERIF }}>
            “Great food doesn't shout. It sets the table, pours the wine, and lets the evening happen.”
          </p>
          <p className="text-xs font-bold tracking-[0.2em] text-[#B4977A]">CHEF MARGAUX DELACROIX · EXECUTIVE CHEF</p>
        </div>
      </div>

      {/* Hours, location, contact */}
      <div className="px-6 py-16 max-w-3xl mx-auto grid grid-cols-1 @md:grid-cols-3 gap-8 text-sm">
        {[
          { icon: Clock, title: 'Hours', body: <>Tue–Sat · 5pm–11pm<br />Sunday brunch · 10am–2pm<br />Closed Mondays</> },
          { icon: MapPin, title: 'Find us', body: <>148 Chestnut Street<br />Old City, Philadelphia<br />Valet from 5pm</> },
          { icon: Phone, title: 'Contact', body: <>(215) 555-0148<br />bonjour@rosalie-eats.com<br />Private events: ext. 2</> },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="group flex items-start gap-3 rounded-xl p-4 -m-4 transition-colors duration-200 hover:bg-[#FFFDF8]">
            <Icon className="w-4 h-4 text-[#B91C1C] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <div>
              <p className="font-bold mb-1.5" style={{ fontFamily: SERIF }}>{title}</p>
              <p className="text-[#8A6F55] leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#EBDCC8] bg-[#FFFDF8] px-6 py-10">
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-lg italic" style={{ fontFamily: SERIF }}>Rosalie</span>
          <div className="flex items-center gap-6 text-xs text-[#8A6F55]">
            {['Menu', 'Gift Cards', 'Careers', 'Press'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#B91C1C]">{l}</span>
            ))}
          </div>
          <span className="text-[11px] text-[#B4977A]">© 2026 Rosalie Bistro</span>
        </div>
      </footer>

      {/* Cookie banner — sticky so it reads as a fixed banner inside the preview frame. */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-xl text-xs bg-[#3B2A1E] text-[#E7D3BC] shadow-lg z-10">
        <span className="flex-1">We use cookies to remember your table preferences.</span>
        <button type="button" className="px-3 py-1.5 rounded-full font-bold bg-[#B91C1C] text-[#FFF7ED] flex-shrink-0 transition-colors duration-200 hover:bg-[#991B1B] cursor-pointer">Accept</button>
      </div>
    </div>
  );
}
