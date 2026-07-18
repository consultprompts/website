import React, { useState } from 'react';
import { Menu, X, MapPin, Clock, Phone, Wine } from 'lucide-react';
import Reveal from './Reveal';

// Moody candlelit bistro. Deep forest green with terracotta, cream serif
// type, elegant dotted-leader menu lists.
// Fixed palette — independent of the host site's theme (see templates/index.ts).
const SERIF = 'Georgia, "Times New Roman", serif';

const FOREST = '#1C2B23';
const FOREST_DEEP = '#141F19';
const TERRA = '#C4602F';
const TERRA_SOFT = '#D97748';
const CREAM = '#F2E9DC';
const SAGE = '#9DB0A3';
const LINE = '#2E4034';

const DISHES = [
  { name: 'Duck confit', desc: 'Crisped leg, puy lentils, cherry gastrique', price: '34' },
  { name: 'Steak frites', desc: 'Hanger steak, café de Paris butter, twice-cooked frites', price: '29' },
  { name: 'Ratatouille tart', desc: 'Slow summer vegetables, chèvre, thyme honey', price: '22' },
  { name: 'Bouillabaisse', desc: 'Gulf shrimp, mussels, saffron rouille, grilled levain', price: '36' },
  { name: 'Crème brûlée', desc: 'Vanilla bean, burnt sugar, fleur de sel', price: '12' },
];

const EVENINGS = [
  { day: 'Thursday', name: 'Vin nature', desc: 'Six natural pours with the sommelier' },
  { day: 'Friday', name: 'Late séance', desc: 'Kitchen open till one, candles till later' },
  { day: 'Sunday', name: 'Le brunch', desc: 'Eggs en meurette and slow coffee' },
];

const NAV_LINKS = ['Menu', 'Evenings', 'Reservations'];

export default function RosalieTemplate() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full" style={{ background: FOREST, color: CREAM, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur-sm border-b" style={{ background: `${FOREST}F0`, borderColor: LINE }}>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-2xl italic tracking-tight" style={{ fontFamily: SERIF }}>
            Rosalie<span style={{ color: TERRA_SOFT }}>.</span>
          </span>
          <nav className="hidden @md:flex items-center gap-8 text-[13px]" style={{ color: SAGE }}>
            {NAV_LINKS.map(l => (
              <span key={l} className="relative cursor-pointer transition-colors duration-200 hover:text-[#F2E9DC] after:content-[''] after:absolute after:-bottom-1 after:inset-x-0 after:h-px after:bg-[#C4602F] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                {l}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="hidden @md:inline-flex px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200 hover:shadow-[0_8px_24px_-8px_rgba(196,96,47,0.7)] hover:scale-[1.02] cursor-pointer" style={{ background: TERRA, color: CREAM }}>
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
          <nav className="@md:hidden px-6 pb-5 flex flex-col gap-3 text-sm border-t" style={{ color: SAGE, borderColor: LINE }}>
            {NAV_LINKS.map(l => <span key={l} className="pt-3 cursor-pointer hover:text-[#F2E9DC] transition-colors">{l}</span>)}
            <button type="button" className="mt-2 px-5 py-2.5 rounded-full text-sm font-bold cursor-pointer self-start" style={{ background: TERRA, color: CREAM }}>
              Reserve a table
            </button>
          </nav>
        )}
      </header>

      {/* Hero — candlelit photo sunk into the green, italic serif */}
      <Reveal>
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${FOREST}55 0%, ${FOREST} 96%)` }} />
        <div className="relative px-6 pt-24 pb-20 @md:pt-32 @md:pb-24 text-center">
          <p className="italic text-xl mb-4" style={{ fontFamily: SERIF, color: TERRA_SOFT }}>Bistro de quartier</p>
          <h3 className="text-5xl @md:text-6xl leading-[1.03] mb-6" style={{ fontFamily: SERIF }}>
            Dinner in the<br />deep green.
          </h3>
          <p className="text-sm @md:text-base max-w-md mx-auto mb-9 leading-relaxed" style={{ color: SAGE }}>
            Candlelight, old-world wine and plates that take their time.
            Fifteen years of Sunday-supper hospitality, seven nights a week.
          </p>
          <div className="flex flex-col @md:flex-row items-center justify-center gap-3">
            <button type="button" className="px-8 py-3.5 rounded-full font-bold transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(196,96,47,0.7)] cursor-pointer" style={{ background: TERRA, color: CREAM }}>
              Book your evening
            </button>
            <button type="button" className="px-8 py-3.5 rounded-full border font-bold transition-all duration-200 hover:bg-[#F2E9DC] hover:text-[#1C2B23] cursor-pointer" style={{ borderColor: `${CREAM}66`, color: CREAM }}>
              Tonight's menu
            </button>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Menu — elegant dotted-leader list */}
      <Reveal>
      <div className="px-6 py-16 max-w-xl mx-auto">
        <p className="text-center text-[11px] font-bold tracking-[0.25em] mb-3" style={{ color: TERRA_SOFT }}>DINNER · TUESDAY THROUGH SUNDAY</p>
        <h4 className="text-3xl text-center italic mb-12" style={{ fontFamily: SERIF }}>La carte</h4>
        <div className="flex flex-col gap-8">
          {DISHES.map(d => (
            <div key={d.name} className="group cursor-default">
              <div className="flex items-baseline gap-3">
                <h5 className="text-lg transition-colors duration-200 group-hover:text-[#D97748]" style={{ fontFamily: SERIF }}>{d.name}</h5>
                <span className="flex-1 border-b border-dotted translate-y-[-3px]" style={{ borderColor: '#4A5F51' }} aria-hidden="true" />
                <span className="text-lg flex-shrink-0" style={{ fontFamily: SERIF, color: TERRA_SOFT }}>{d.price}</span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: SAGE }}>{d.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-12">
          <span className="text-sm italic border-b pb-0.5 cursor-pointer transition-colors duration-200 hover:text-[#D97748]" style={{ fontFamily: SERIF, color: SAGE, borderColor: '#4A5F51' }}>
            The full carte & cellar list →
          </span>
        </p>
      </div>
      </Reveal>

      {/* Evenings — terracotta band */}
      <Reveal>
      <div className="px-6 py-16" style={{ background: TERRA }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Wine className="w-4 h-4" style={{ color: '#F7D9C4' }} aria-hidden="true" />
            <p className="text-[11px] font-bold tracking-[0.25em]" style={{ color: '#F7D9C4' }}>THIS WEEK AT ROSALIE</p>
          </div>
          <h4 className="text-3xl text-center italic mb-10" style={{ fontFamily: SERIF, color: '#FFF4E8' }}>Evenings</h4>
          <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
            {EVENINGS.map(e => (
              <div key={e.name} className="rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 cursor-default" style={{ background: 'rgba(20,31,25,0.28)' }}>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#F7D9C4' }}>{e.day}</p>
                <p className="text-xl italic mb-2" style={{ fontFamily: SERIF, color: '#FFF4E8' }}>{e.name}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#F3D8C3' }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </Reveal>

      {/* Story — split with photo */}
      <Reveal>
      <div className="px-6 py-16" style={{ background: FOREST_DEEP }}>
        <div className="max-w-2xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-10 items-center">
          <div className="overflow-hidden rounded-2xl group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=600"
              alt="Rosalie's kitchen"
              loading="lazy"
              className="aspect-[4/3] object-cover w-full transition-transform duration-500 group-hover:scale-105"
              style={{ background: LINE }}
            />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] mb-3" style={{ color: TERRA_SOFT }}>SINCE 2010</p>
            <h4 className="text-3xl italic mb-4" style={{ fontFamily: SERIF }}>Our story</h4>
            <p className="text-sm leading-relaxed mb-5" style={{ color: SAGE }}>
              Rosalie began as a Sunday supper between friends. Fifteen years on, we still cook the
              same way — slowly, seasonally, and for the people at the table rather than the camera.
            </p>
            <span className="text-sm italic border-b pb-0.5 cursor-pointer transition-colors duration-200 hover:text-[#D97748]" style={{ fontFamily: SERIF, color: SAGE, borderColor: '#4A5F51' }}>
              Meet the kitchen →
            </span>
          </div>
        </div>
      </div>
      </Reveal>

      {/* Hours, location, contact */}
      <Reveal>
      <div className="px-6 py-16 max-w-3xl mx-auto grid grid-cols-1 @md:grid-cols-3 gap-8 text-sm">
        {[
          { icon: Clock, title: 'Hours', body: <>Tue–Sat · 5pm–11pm<br />Sunday brunch · 10am–2pm<br />Closed Mondays</> },
          { icon: MapPin, title: 'Find us', body: <>148 Chestnut Street<br />Old City, Philadelphia<br />Valet from 5pm</> },
          { icon: Phone, title: 'Contact', body: <>(215) 555-0148<br />bonjour@rosalie-eats.com<br />Private events: ext. 2</> },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="group flex items-start gap-3 rounded-xl p-4 -m-4 transition-colors duration-200 hover:bg-[#141F19]">
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ color: TERRA_SOFT }} aria-hidden="true" />
            <div>
              <p className="font-bold mb-1.5 italic" style={{ fontFamily: SERIF }}>{title}</p>
              <p className="leading-relaxed" style={{ color: SAGE }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
      </Reveal>

      {/* Footer */}
      <footer className="border-t px-6 py-10" style={{ borderColor: LINE, background: FOREST_DEEP }}>
        <div className="max-w-3xl mx-auto flex flex-col @md:flex-row items-center justify-between gap-4">
          <span className="text-lg italic" style={{ fontFamily: SERIF }}>Rosalie<span style={{ color: TERRA_SOFT }}>.</span></span>
          <div className="flex items-center gap-6 text-xs" style={{ color: SAGE }}>
            {['Menu', 'Gift Cards', 'Careers', 'Press'].map(l => (
              <span key={l} className="cursor-pointer transition-colors duration-200 hover:text-[#D97748]">{l}</span>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: '#5C7263' }}>© 2026 Rosalie Bistro</span>
        </div>
      </footer>

      {/* Cookie banner — sticky so it reads as a fixed banner inside the preview frame. */}
      <div className="sticky bottom-3 mx-3 flex items-center gap-3 px-4 py-3 rounded-xl text-xs shadow-lg z-10" style={{ background: FOREST_DEEP, color: SAGE, border: `1px solid ${LINE}` }}>
        <span className="flex-1">We use cookies to remember your table preferences.</span>
        <button type="button" className="px-3 py-1.5 rounded-full font-bold flex-shrink-0 transition-opacity duration-200 hover:opacity-85 cursor-pointer" style={{ background: TERRA, color: CREAM }}>Accept</button>
      </div>
    </div>
  );
}
