import React from 'react';
import { useNavigate } from 'react-router-dom';
import { REVIEWS } from '../data/content';
import CustomButton from '../components/ui/CustomButton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

const STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34', label: 'Shops Shipped' },
];

export default function Work() {
  const navigate = useNavigate();

  const featured = REVIEWS.find(r => r.featured)!;
  const others = REVIEWS.filter(r => !r.featured);

  return (
    <div className="text-white">
      {/* ── Header ── */}
      <header style={{ padding: '148px 24px 48px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span
          className="font-bold uppercase block"
          style={{ color: 'var(--color-brand-primary)', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
        >
          The Receipts
        </span>
        <h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px', lineHeight: 1.05 }}
        >
          Built for the block.{' '}
          <span style={{ color: 'var(--color-brand-primary)' }}>Loved</span> by it.
        </h1>
        <p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, margin: 0 }}
        >
          Three real businesses, three real launches. Here's the problem we walked into, the fix we
          shipped, and what happened next.
        </p>
      </header>

      {/* ── Featured spotlight ── */}
      <section
        style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 64px' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 8%, transparent), rgba(112,0,255,0.03))',
            border: '1px solid color-mix(in srgb, var(--color-brand-primary) 22%, transparent)',
            borderRadius: 20,
            padding: 48,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ribbon */}
          <span
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-brand-primary)',
              background: 'color-mix(in srgb, var(--color-brand-primary) 12%, transparent)',
              padding: '6px 14px',
              borderRadius: 999,
            }}
          >
            Featured Launch
          </span>

          <span
            style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-muted)' }}
          >
            {featured.business}
          </span>
          <h2 className="font-display" style={{ fontSize: 34, fontWeight: 700, margin: '14px 0 6px' }}>
            {featured.client}
          </h2>
          <p className="text-ink-muted" style={{ fontSize: 14, margin: '0 0 32px' }}>
            {featured.role}
          </p>

          {/* Problem / Fix / Result */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'The Problem', color: 'var(--color-ink-muted)', text: featured.problem },
              { label: 'The Fix',     color: 'var(--color-brand-primary)', text: featured.fix },
              { label: 'The Result',  color: 'var(--color-ink-muted)', text: featured.result },
            ].map(card => (
              <div
                key={card.label}
                style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 20 }}
              >
                <p
                  style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: card.color, margin: '0 0 10px' }}
                >
                  {card.label}
                </p>
                <p className="font-light" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          {/* Quote + metrics */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 10%, transparent)',
              paddingTop: 28,
            }}
          >
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, fontStyle: 'italic', maxWidth: 560 }}>
              "{featured.quote}"
            </p>
            <div style={{ display: 'flex', gap: 32, flexShrink: 0 }}>
              {featured.metrics.map(m => (
                <div key={m.label}>
                  <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                    {m.value}
                  </div>
                  <div
                    style={{ fontSize: 10, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── More Launches ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p
          style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-ink-muted)', margin: '0 0 8px' }}
        >
          More Launches
        </p>
        {others.map((cs, i) => {
          const imgLeft = i % 2 !== 0;
          return (
            <div
              key={cs.client}
              className="launch-row"
              style={{
                gridTemplateColumns: imgLeft ? '1fr 1.1fr' : '1.1fr 1fr',
                background: 'color-mix(in srgb, var(--color-ink-base) 3%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)',
                borderRadius: 16,
                padding: 32,
              }}
            >
              {/* Text block */}
              <div style={{ order: imgLeft ? 2 : 1 }}>
                <span
                  style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-muted)' }}
                >
                  {cs.business}
                </span>
                <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, margin: '12px 0 6px' }}>
                  {cs.client}
                </h3>
                <p className="text-ink-muted" style={{ fontSize: 13, margin: '0 0 16px' }}>
                  {cs.role}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: 'var(--color-brand-primary)', fontWeight: 700 }}>Fix: </strong>
                    {cs.fix}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: 'var(--color-ink-muted)', fontWeight: 700 }}>Result: </strong>
                    {cs.result}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {cs.metrics.map(m => (
                    <div key={m.label}>
                      <div className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>
                        {m.value}
                      </div>
                      <div
                        style={{ fontSize: 9, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}
                      >
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site preview placeholder */}
              <div
                className="launch-preview"
                style={{
                  order: imgLeft ? 1 : 2,
                  aspectRatio: '4 / 3',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 10%, transparent), rgba(112,0,255,0.06))',
                  border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-ink-muted)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                Site preview — {cs.siteLabel}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Trust strip ── */}
      <section
        style={{
          padding: '56px 24px',
          borderTop: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)',
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
          {STATS.map(stat => (
            <div key={stat.label}>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                {stat.value}
              </div>
              <div
                style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-muted)', marginTop: 6 }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{ padding: '80px 24px', textAlign: 'center' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(26px, 4vw, 42px)', margin: '0 0 20px' }}
        >
          Want to be the next one here?
        </h2>
        <CustomButton
          onClick={() => navigate('/settings/my-projects/new-project')}
          arrow
          style={{ marginTop: 12 }}
        >
          Start your project
        </CustomButton>
      </section>
    </div>
  );
}
