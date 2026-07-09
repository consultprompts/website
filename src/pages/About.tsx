import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VALUES, SITE_STATS } from '../data/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="text-white">
      {/* ── Header ── */}
      <header style={{ position: 'relative', padding: '148px 24px 64px', overflow: 'hidden' }}>
        {/* Cyan glow blob */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 600,
            height: 460,
            background: 'rgba(0,240,255,0.06)',
            borderRadius: 999,
            filter: 'blur(140px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span
            className="font-bold uppercase block"
            style={{ color: '#00F0FF', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
          >
            Who We Are
          </span>
          <h1
            className="font-display font-bold italic"
            style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px' }}
          >
            We think agencies got too slow.
          </h1>
          <p
            className="text-ink-muted font-light"
            style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}
          >
            Consult Prompts started with one belief: a local business shouldn't wait six weeks and pay
            six grand for a website that actually works. So we rebuilt the process from scratch around
            speed, and we haven't slowed down since.
          </p>
        </div>
      </header>

      {/* ── Mission / Story ── */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 80px' }}
      >
        <div>
          <span
            style={{ color: '#00F0FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', display: 'block', marginBottom: 14 }}
          >
            The Mission
          </span>
          <h2
            className="font-display font-bold italic"
            style={{ fontSize: 36, margin: '0 0 16px' }}
          >
            Real websites for real neighborhoods.
          </h2>
          <p className="text-ink-muted font-light" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Every diner, barbershop, and hardware store deserves a site that loads fast, looks sharp,
            and turns visitors into customers — without the overhead of a traditional agency retainer.
            That's the only thing we build.
          </p>
        </div>

        {/* Team photo placeholder */}
        <div
          style={{
            aspectRatio: '4 / 3',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(112,0,255,0.08))',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A1A1A1',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
          }}
        >
          Team photo
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <span
              style={{ color: '#00F0FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 14 }}
            >
              What We Stand For
            </span>
            <h2
              className="font-display font-bold italic"
              style={{ fontSize: 'clamp(26px, 4vw, 40px)', margin: 0 }}
            >
              Our Values.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 28,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 16 }}>{v.icon}</div>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>
                  {v.title}
                </h3>
                <p className="text-ink-muted font-light" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section
        style={{
          padding: '64px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: 64,
            flexWrap: 'wrap',
            textAlign: 'center',
          }}
        >
          {SITE_STATS.map(stat => (
            <div key={stat.label}>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: '#00F0FF' }}>
                {stat.value}
              </div>
              <div
                style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1A1', marginTop: 6 }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{ padding: '96px 24px', textAlign: 'center' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(26px, 4vw, 42px)', margin: '0 0 20px' }}
        >
          Want to work with us?
        </h2>
        <p className="text-ink-muted font-light" style={{ fontSize: 15, margin: '0 0 32px' }}>
          Tell us about your business — the first draft is in your inbox within 24 hours.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="font-black transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            background: '#00F0FF',
            color: '#050505',
            padding: '16px 34px',
            borderRadius: 12,
            border: 'none',
            fontSize: 15,
            display: 'inline-block',
          }}
        >
          See pricing →
        </button>
      </section>
    </div>
  );
}
