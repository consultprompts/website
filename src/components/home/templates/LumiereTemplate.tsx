import React, { useState } from 'react';
import { Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

// High-fashion editorial hair studio. Blush/black, oversized mixed type,
// asymmetric lookbook gallery.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const SERIF = 'Georgia, "Times New Roman", serif';

const BLUSH = '#F6E4DE';
const BLUSH_DEEP = '#EFD2C9';
const BLACK = '#141011';
const INK_SOFT = '#6E5A56';
const LINE = '#E2C7BD';

const GALLERY = [
  { img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600', caption: 'No. 01 — Undone bob', tall: true },
  { img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=600', caption: 'No. 02 — Glass finish', tall: false },
  { img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600', caption: 'No. 03 — Copper season', tall: false },
  { img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600', caption: 'No. 04 — Éditorial', tall: true },
];

const SERVICES = [
  { idx: '01', name: 'Cut & finish', price: 'from $95' },
  { idx: '02', name: 'Colour & gloss', price: 'from $140' },
  { idx: '03', name: 'Editorial styling', price: 'by consult' },
];

const NAV_LINKS = ['Lookbook', 'Services', 'Studio'];

export default function LumiereTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full" style={{ background: BLUSH, color: BLACK, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur-sm border-b" style={{ background: `${BLUSH}F0`, borderColor: LINE }}>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-xl font-black uppercase tracking-[0.25em]">Lumière</span>
          <nav className="hidden @md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#141011] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#141011] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer hover:opacity-85" style={{ background: BLACK, color: BLUSH }}>
              Book
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 border-t" style={{ borderColor: LINE }}>
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer text-[12px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity" style={{ color: INK_SOFT }}>{l}</span>)}
            <button type="button" className="mt-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer self-start" style={{ background: BLACK, color: BLUSH }}>
              Book
            </button>
          </nav>
        )}
      </header>

      {/* Hero — oversized editorial type over blush, mixed sans/serif */}
      <Reveal>
      <div className="px-6 pt-16 pb-12 @md:pt-24 @md:pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6" style={{ color: INK_SOFT }}>Hair studio · Issue № 12</p>
          <h3 className="text-6xl @md:text-8xl font-black uppercase leading-[0.9] tracking-tight">
            Hair is
            <br />
            <span className="italic font-normal normal-case" style={{ fontFamily: SERIF }}>the outfit.</span>
          </h3>
          <div className="grid grid-cols-1 @md:grid-cols-[1fr_auto] gap-8 items-end mt-10">
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: INK_SOFT }}>
              An editorial hair studio in the old garment district. Cut, colour and finish —
              photographed, not just styled.
            </p>
            <button type="button" className="group inline-flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer hover:gap-5" style={{ background: BLACK, color: BLUSH }}>
              Book a chair <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Asymmetric lookbook gallery — staggered heights and offsets */}
      <Reveal>
      <div className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-2 @md:grid-cols-4 gap-4 items-start">
          {GALLERY.map((g, i) => (
            <figure key={g.caption} className={`group cursor-pointer ${i % 2 === 1 ? 'mt-10 @md:mt-16' : ''}`}>
              <div className="overflow-hidden" style={{ background: BLUSH_DEEP }}>
                <img
                  src={g.img}
                  alt={g.caption}
                  loading="lazy"
                  className={`w-full object-cover grayscale-[35%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.04] ${g.tall ? 'aspect-[3/4]' : 'aspect-square'}`}
                />
              </div>
              <figcaption className="flex items-center justify-between mt-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
                <span>{g.caption}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      </Reveal>

      {/* Services — black band, big index numbers, editorial rows */}
      <Reveal>
      <div className="px-6 py-20" style={{ background: BLACK, color: BLUSH }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-10" style={{ color: '#A88F89' }}>Services</p>
          <div className="flex flex-col">
            {SERVICES.map(s => (
              <div key={s.idx} className="group flex items-baseline gap-6 py-6 border-b cursor-pointer transition-colors duration-200" style={{ borderColor: '#2E2426' }}>
                <span className="text-[11px] font-black tracking-[0.2em]" style={{ color: '#A88F89' }}>{s.idx}</span>
                <span className="flex-1 text-2xl @md:text-3xl italic transition-transform duration-300 group-hover:translate-x-2" style={{ fontFamily: SERIF }}>{s.name}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] flex-shrink-0" style={{ color: '#A88F89' }}>{s.price}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.25em] inline-flex items-center gap-2 cursor-pointer transition-opacity duration-200 hover:opacity-70" style={{ color: BLUSH }}>
            Full price list <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </p>
        </div>
      </div>
      </Reveal>

      {/* Manifesto quote */}
      <Reveal>
      <div className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-2xl @md:text-3xl italic leading-snug mb-6" style={{ fontFamily: SERIF }}>
            “We don't do before-and-after. We do cover shoot, every chair, every day.”
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>Amélie Laurent — Creative director</p>
        </div>
      </div>
      </Reveal>

      {/* Booking strip */}
      <Reveal>
      <div className="px-6 py-16" style={{ background: BLUSH_DEEP }}>
        <div className="max-w-2xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-3xl font-black uppercase tracking-tight">This week's chairs</h4>
            <p className="text-sm mt-2" style={{ color: INK_SOFT }}>Tuesday through Saturday · Two stylists · One studio</p>
          </div>
          <button type="button" className="px-9 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-200 hover:opacity-85 cursor-pointer flex-shrink-0" style={{ background: BLACK, color: BLUSH }}>
            See availability
          </button>
        </div>
      </div>
      </Reveal>

      {/* Footer */}
      <footer className="border-t px-6 py-10" style={{ borderColor: LINE }}>
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-black uppercase tracking-[0.25em]">Lumière</span>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
            {['Lookbook', 'Services', 'Studio', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#141011]">{l}</span>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: '#B69B93' }}>© 2026 Lumière Studio</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 text-xs shadow-lg z-10" style={{ background: BLACK, color: '#CDB7B1' }}>
        <span className="flex-1">We use cookies. Very chic ones.</span>
        <button type="button" className="px-4 py-1.5 font-black uppercase tracking-[0.15em] text-[10px] flex-shrink-0 transition-opacity duration-200 hover:opacity-85 cursor-pointer" style={{ background: BLUSH, color: BLACK }}>Accept</button>
      </div>
    </div>
  );
}
