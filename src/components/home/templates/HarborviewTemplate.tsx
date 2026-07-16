import React, { useState } from 'react';
import { Menu, X, MapPin, BedDouble, Bath, ChevronDown, Search, Star, Ruler } from 'lucide-react';

// Upscale waterfront real-estate agency. Navy/white/gold palette.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const SERIF = 'Georgia, "Times New Roman", serif';

const STATS = [
  { value: '$400M+', label: 'Closed volume' },
  { value: '212', label: 'Active listings' },
  { value: '12', label: 'Years on the water' },
  { value: '98%', label: 'Of asking, avg.' },
];

const LISTINGS = [
  { addr: '14 Marina Point', price: '$2,450,000', beds: 5, baths: 4, sqft: '4,820', badge: 'NEW', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600' },
  { addr: '8 Lighthouse Lane', price: '$1,780,000', beds: 4, baths: 3, sqft: '3,610', badge: 'OPEN SAT', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600' },
  { addr: '22 Harbor Crest', price: '$3,150,000', beds: 6, baths: 5, sqft: '6,240', badge: null, img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600' },
];

const NEIGHBORHOODS = [
  { name: 'The Marina', listings: 38, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=500' },
  { name: 'Old Harbor', listings: 24, img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=500' },
  { name: 'Crescent Bay', listings: 17, img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&q=80&w=500' },
];

const NAV_LINKS = ['Listings', 'Neighborhoods', 'Agents'];

export default function HarborviewTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#F8FAFC] text-[#152238]" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="bg-[#FFFFFF]/97 backdrop-blur-sm sticky top-0 z-20 border-b border-[#E4E9F0]">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-xl tracking-wide" style={{ fontFamily: SERIF }}>
            Harborview <span className="text-[#B8912F]">Realty</span>
          </span>
          <nav className="hidden @md:flex items-center gap-7 text-[13px] text-[#5A6B84]">
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#152238] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#B8912F] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-full border border-[#B8912F] text-[#B8912F] text-[13px] font-bold transition-all duration-200 hover:bg-[#B8912F] hover:text-[#FFFFFF] hover:shadow-[0_6px_20px_-6px_rgba(184,145,47,0.5)] cursor-pointer">
              Get in touch
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm text-[#5A6B84] border-t border-[#E4E9F0]">
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer hover:text-[#152238] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-full border border-[#B8912F] text-[#B8912F] text-sm font-bold cursor-pointer self-start">
              Get in touch
            </button>
          </nav>
        )}
      </header>

      {/* Hero — architectural photo, subtle overlay, search-style CTA */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,21,38,0.5) 0%, rgba(11,21,38,0.72) 100%)' }} />
        <div className="relative px-6 py-24 @md:py-32 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#E3C979] mb-5">LUXURY WATERFRONT PROPERTIES</p>
          <h3 className="text-4xl @md:text-6xl text-[#FFFFFF] leading-[1.05] mb-4" style={{ fontFamily: SERIF }}>
            Find your next address.
          </h3>
          <p className="text-sm text-[#C4CEDC] max-w-md mx-auto mb-9 leading-relaxed">
            Two hundred waterfront listings, one team that knows every dock, deed and sunset on the bay.
          </p>
          <div className="max-w-md mx-auto flex flex-col @md:flex-row items-stretch gap-2 bg-[#FFFFFF] rounded-2xl @md:rounded-full p-2 text-left text-sm shadow-[0_20px_50px_-20px_rgba(11,21,38,0.6)]">
            <button type="button" className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-full text-[#5A6B84] cursor-pointer transition-colors duration-200 hover:bg-[#F1F4F8]">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> Location</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </button>
            <button type="button" className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-full text-[#5A6B84] cursor-pointer transition-colors duration-200 hover:bg-[#F1F4F8] @md:border-l @md:border-[#E4E9F0] @md:rounded-none">
              <span>Property type</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#152238] text-[#FFFFFF] font-bold transition-all duration-200 hover:bg-[#B8912F] cursor-pointer flex-shrink-0">
              <Search className="w-4 h-4" aria-hidden="true" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-[#152238] text-[#F8FAFC] px-6 py-8">
        <div className="max-w-3xl mx-auto grid grid-cols-2 @md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label} className="group cursor-default">
              <p className="text-2xl @md:text-3xl transition-colors duration-200 group-hover:text-[#E3C979]" style={{ fontFamily: SERIF }}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#8B99AE] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured listings */}
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#B8912F] mb-3">CURATED THIS WEEK</p>
        <h4 className="text-3xl text-center mb-10" style={{ fontFamily: SERIF }}>Featured listings</h4>
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-5">
          {LISTINGS.map(l => (
            <div key={l.addr} className="group rounded-2xl bg-[#FFFFFF] border border-[#E4E9F0] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(21,34,56,0.35)] cursor-pointer">
              <div className="relative overflow-hidden">
                <img src={l.img} alt={l.addr} loading="lazy" className="w-full aspect-[4/3] object-cover bg-[#E4E9F0] transition-transform duration-500 group-hover:scale-[1.08]" />
                {l.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#B8912F] text-[#FFFFFF] text-[9px] font-bold tracking-widest">{l.badge}</span>
                )}
              </div>
              <div className="p-5">
                <p className="font-bold text-lg text-[#B8912F]" style={{ fontFamily: SERIF }}>{l.price}</p>
                <p className="text-sm mt-1 transition-colors duration-200 group-hover:text-[#B8912F]" style={{ fontFamily: SERIF }}>{l.addr}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#EDF1F6] text-xs text-[#5A6B84]">
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" aria-hidden="true" /> {l.beds}</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" aria-hidden="true" /> {l.baths}</span>
                  <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" aria-hidden="true" /> {l.sqft} ft²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-9">
          <span className="text-sm text-[#5A6B84] border-b border-[#B8912F] pb-0.5 cursor-pointer transition-colors duration-200 hover:text-[#B8912F]" style={{ fontFamily: SERIF }}>
            Browse all 212 listings →
          </span>
        </p>
      </div>

      {/* Neighborhoods */}
      <div className="bg-[#EDF1F6] px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#B8912F] mb-3">KNOW THE WATER</p>
          <h4 className="text-3xl text-center mb-10" style={{ fontFamily: SERIF }}>Neighborhoods</h4>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            {NEIGHBORHOODS.map(n => (
              <div key={n.name} className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer">
                <img src={n.img} alt={n.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover bg-[#C4CEDC] transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 transition-colors duration-300" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(11,21,38,0.75) 100%)' }} />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="text-lg text-[#FFFFFF]" style={{ fontFamily: SERIF }}>{n.name}</p>
                  <p className="text-[11px] text-[#C4CEDC] mt-0.5 transition-colors duration-200 group-hover:text-[#E3C979]">{n.listings} active listings →</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent spotlight */}
      <div className="bg-[#152238] text-[#F8FAFC] px-6 py-16">
        <div className="max-w-2xl mx-auto grid grid-cols-1 @md:grid-cols-[auto_1fr] gap-8 items-center">
          <div className="overflow-hidden rounded-full mx-auto @md:mx-0 group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
              alt="Agent Claire Whitmore"
              loading="lazy"
              className="w-32 h-32 object-cover bg-[#22334E] transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="text-center @md:text-left">
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#E3C979] mb-2">AGENT SPOTLIGHT</p>
            <h4 className="text-2xl mb-3" style={{ fontFamily: SERIF }}>Claire Whitmore</h4>
            <p className="text-sm text-[#AEBBCF] leading-relaxed mb-4">
              Twelve years on the waterfront and over $400M closed. Claire knows which docks flood,
              which sunsets sell, and exactly what your view is worth.
            </p>
            <div className="flex items-center justify-center @md:justify-start gap-1" aria-hidden="true">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-[#E3C979] fill-[#E3C979]" />)}
              <span className="text-[11px] text-[#8B99AE] ml-2">128 client reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-6 py-16 text-center max-w-xl mx-auto">
        <p className="text-xl @md:text-2xl italic leading-relaxed mb-5" style={{ fontFamily: SERIF }}>
          “They sold our place in nine days — over asking — and found us a dock deep enough for the boat. Nobody else even asked about the boat.”
        </p>
        <p className="text-xs font-bold tracking-[0.2em] text-[#B8912F]">THE HALVORSEN FAMILY · CRESCENT BAY</p>
      </div>

      {/* Newsletter */}
      <div className="bg-[#EDF1F6] px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h4 className="text-2xl @md:text-3xl mb-2" style={{ fontFamily: SERIF }}>New on the water, first in your inbox</h4>
          <p className="text-sm text-[#5A6B84] mb-7">Off-market listings and price moves, twice a month. No noise.</p>
          <div className="flex flex-col @md:flex-row gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 px-5 py-3 rounded-full border border-[#D4DCE6] bg-[#FFFFFF] text-sm outline-none transition-colors duration-200 focus:border-[#B8912F]"
            />
            <button type="button" className="px-7 py-3 rounded-full bg-[#B8912F] text-[#FFFFFF] text-sm font-bold transition-all duration-200 hover:bg-[#9A7826] hover:shadow-[0_8px_24px_-8px_rgba(184,145,47,0.6)] cursor-pointer flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0E1930] text-[#8B99AE] px-6 py-10">
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-lg text-[#F8FAFC]" style={{ fontFamily: SERIF }}>Harborview <span className="text-[#B8912F]">Realty</span></span>
          <div className="flex items-center gap-6 text-xs">
            {['Listings', 'Sell with us', 'Agents', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#E3C979]">{l}</span>
            ))}
          </div>
          <span className="text-[11px] text-[#5B6B85]">© 2026 Harborview Realty</span>
        </div>
      </footer>

      {/* Cookie banner */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-xl text-xs bg-[#152238] text-[#AEBBCF] shadow-lg z-10">
        <span className="flex-1">We use cookies to show you homes worth moving for.</span>
        <button type="button" className="px-3 py-1.5 rounded-full font-bold bg-[#B8912F] text-[#FFFFFF] flex-shrink-0 transition-colors duration-200 hover:bg-[#9A7826] cursor-pointer">Accept</button>
      </div>
    </div>
  );
}
