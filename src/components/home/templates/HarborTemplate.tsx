import React, { useState } from 'react';
import { Menu, X, BedDouble, Bath, Ruler, ArrowRight, ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

// Luxury minimalist real-estate studio. Cream/charcoal palette, wide
// editorial grids, square edges, restrained type.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const SERIF = 'Georgia, "Times New Roman", serif';

const CREAM = '#F5F1E8';
const CREAM_SOFT = '#FAF8F3';
const CHARCOAL = '#26241F';
const INK_MUTED = '#8A8478';
const LINE = '#E3DDCE';

const LISTINGS = [
  { addr: '14 Marina Point', place: 'Crescent Bay', price: '$2,450,000', beds: 5, baths: 4, sqft: '4,820', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=900', wide: true },
  { addr: '8 Lighthouse Lane', place: 'Old Harbor', price: '$1,780,000', beds: 4, baths: 3, sqft: '3,610', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', wide: false },
  { addr: '22 Harbor Crest', place: 'The Marina', price: '$3,150,000', beds: 6, baths: 5, sqft: '6,240', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', wide: false },
];

const STATS = [
  { value: '$400M+', label: 'Closed volume' },
  { value: '212', label: 'Active listings' },
  { value: '12', label: 'Years on the water' },
];

const NAV_LINKS = ['Portfolio', 'Neighborhoods', 'Journal'];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: INK_MUTED }}>{children}</p>;
}

export default function HarborTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full" style={{ background: CREAM, color: CHARCOAL, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar — hairline, no fill, everything lowercase-quiet */}
      <header className="sticky top-0 z-20 backdrop-blur-sm border-b" style={{ background: `${CREAM}F2`, borderColor: LINE }}>
        <div className="flex items-center justify-between px-8 py-5">
          <span className="text-lg tracking-[0.2em] uppercase" style={{ fontFamily: SERIF }}>Harbor</span>
          <nav className="hidden @md:flex items-center gap-10 text-[12px] tracking-[0.15em] uppercase" style={{ color: INK_MUTED }}>
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#26241F] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#26241F] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex items-center gap-2 px-6 py-2.5 text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer border hover:bg-[#26241F] hover:text-[#F5F1E8]" style={{ borderColor: CHARCOAL, color: CHARCOAL }}>
              Enquire
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
          <nav className="@md:hidden px-8 pb-6 flex flex-col gap-4 text-sm border-t" style={{ color: INK_MUTED, borderColor: LINE }}>
            {NAV_LINKS.map(l => <span key={l} className="pt-4 cursor-pointer tracking-[0.15em] uppercase text-[12px] hover:text-[#26241F] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-6 py-2.5 border text-[12px] font-bold tracking-[0.15em] uppercase cursor-pointer self-start" style={{ borderColor: CHARCOAL, color: CHARCOAL }}>
              Enquire
            </button>
          </nav>
        )}
      </header>

      {/* Hero — asymmetric editorial split: oversized serif left, image right */}
      <Reveal>
      <div className="px-8 pt-16 pb-20 @md:pt-24 @md:pb-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 @md:grid-cols-[1.1fr_1fr] gap-10 @md:gap-14 items-end">
          <div>
            <Label>Private waterfront estates</Label>
            <h3 className="text-5xl @md:text-6xl leading-[1.02] mt-6 mb-8" style={{ fontFamily: SERIF }}>
              Quiet homes<br />on loud water.
            </h3>
            <p className="text-sm leading-relaxed max-w-sm mb-10" style={{ color: INK_MUTED }}>
              A small portfolio of exceptional coastal properties, represented slowly and sold well.
              Two hundred listings; we show you the twelve that matter.
            </p>
            <button type="button" className="group inline-flex items-center gap-3 px-8 py-4 text-[12px] font-bold tracking-[0.2em] uppercase text-[#F5F1E8] transition-all duration-300 cursor-pointer hover:gap-5" style={{ background: CHARCOAL }}>
              View portfolio <ArrowRight className="w-4 h-4 transition-transform duration-300" aria-hidden="true" />
            </button>
          </div>
          <div className="relative overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=900"
              alt=""
              loading="lazy"
              className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ background: LINE }}
            />
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-5 py-4 text-[11px] tracking-[0.15em] uppercase text-[#F5F1E8]" style={{ background: 'rgba(38,36,31,0.85)' }}>
              <span>Featured · Marina Point</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Stats — hairline-ruled row, no boxes */}
      <Reveal>
      <div className="border-y px-8" style={{ borderColor: LINE }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x" style={{ borderColor: LINE }}>
          {STATS.map(s => (
            <div key={s.label} className="py-8 text-center cursor-default" style={{ borderColor: LINE }}>
              <p className="text-2xl @md:text-3xl" style={{ fontFamily: SERIF }}>{s.value}</p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-2" style={{ color: INK_MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      </Reveal>

      {/* Portfolio — wide asymmetric grid: first listing spans full width */}
      <Reveal>
      <div className="px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Label>Current portfolio</Label>
              <h4 className="text-3xl mt-3" style={{ fontFamily: SERIF }}>Selected listings</h4>
            </div>
            <span className="hidden @md:inline text-[11px] tracking-[0.2em] uppercase border-b pb-1 cursor-pointer transition-colors duration-200 hover:text-[#26241F]" style={{ color: INK_MUTED, borderColor: CHARCOAL }}>
              All 212 listings
            </span>
          </div>
          <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-8 gap-y-12">
            {LISTINGS.map(l => (
              <div key={l.addr} className={`group cursor-pointer ${l.wide ? '@md:col-span-2' : ''}`}>
                <div className="overflow-hidden mb-5">
                  <img
                    src={l.img}
                    alt={l.addr}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${l.wide ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}
                    style={{ background: LINE }}
                  />
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b pb-4" style={{ borderColor: LINE }}>
                  <div>
                    <p className="text-xl transition-colors duration-200" style={{ fontFamily: SERIF }}>{l.addr}</p>
                    <p className="text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: INK_MUTED }}>{l.place}</p>
                  </div>
                  <p className="text-lg flex-shrink-0" style={{ fontFamily: SERIF }}>{l.price}</p>
                </div>
                <div className="flex items-center gap-6 pt-3 text-[11px] tracking-widest uppercase" style={{ color: INK_MUTED }}>
                  <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" aria-hidden="true" /> {l.beds}</span>
                  <span className="flex items-center gap-1.5"><Bath className="w-3.5 h-3.5" aria-hidden="true" /> {l.baths}</span>
                  <span className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" aria-hidden="true" /> {l.sqft} ft²</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </Reveal>

      {/* Philosophy — charcoal band, single serif statement */}
      <Reveal>
      <div className="px-8 py-24 text-center" style={{ background: CHARCOAL, color: CREAM }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8" style={{ color: '#A79F8D' }}>Our approach</p>
          <p className="text-2xl @md:text-4xl leading-snug" style={{ fontFamily: SERIF }}>
            “We list fewer homes than anyone on the bay. That is the entire strategy.”
          </p>
          <p className="text-[11px] tracking-[0.25em] uppercase mt-8" style={{ color: '#A79F8D' }}>Claire Whitmore · Principal broker</p>
        </div>
      </div>
      </Reveal>

      {/* Private list — minimal underline form */}
      <Reveal>
      <div className="px-8 py-20" style={{ background: CREAM_SOFT }}>
        <div className="max-w-xl mx-auto text-center">
          <Label>The private list</Label>
          <h4 className="text-3xl mt-3 mb-3" style={{ fontFamily: SERIF }}>Off-market, first.</h4>
          <p className="text-sm mb-10" style={{ color: INK_MUTED }}>Unlisted properties and quiet price moves, twice a month.</p>
          <div className="flex items-end gap-4 text-left">
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 pb-3 bg-transparent border-b text-sm outline-none transition-colors duration-200 placeholder:text-[#B5AE9E] focus:border-[#26241F]"
              style={{ borderColor: '#C9C2B0', color: CHARCOAL }}
            />
            <button type="button" className="px-7 py-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[#F5F1E8] transition-opacity duration-200 hover:opacity-85 cursor-pointer flex-shrink-0" style={{ background: CHARCOAL }}>
              Join
            </button>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Footer */}
      <footer className="border-t px-8 py-10" style={{ borderColor: LINE }}>
        <div className="max-w-4xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-sm tracking-[0.2em] uppercase" style={{ fontFamily: SERIF }}>Harbor</span>
          <div className="flex items-center gap-7 text-[11px] tracking-[0.15em] uppercase" style={{ color: INK_MUTED }}>
            {['Portfolio', 'Sell with us', 'Journal', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#26241F]">{l}</span>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: '#B5AE9E' }}>© 2026 Harbor</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 text-xs shadow-lg z-10" style={{ background: CHARCOAL, color: '#CFC9BA' }}>
        <span className="flex-1">We use cookies to show you homes worth moving for.</span>
        <button type="button" className="px-4 py-1.5 font-bold tracking-[0.15em] uppercase text-[10px] flex-shrink-0 transition-opacity duration-200 hover:opacity-85 cursor-pointer" style={{ background: CREAM, color: CHARCOAL }}>Accept</button>
      </div>
    </div>
  );
}
