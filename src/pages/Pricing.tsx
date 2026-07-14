import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACKAGES, COMPARISON_ROWS } from '../data/content';
import CustomButton from '../components/ui/CustomButton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="text-white">
      {/* ── Header ── */}
      <header style={{ padding: '148px 24px 56px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span
          className="font-bold uppercase block"
          style={{ color: 'var(--color-brand-primary)', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
        >
          Scalable Growth Tiers
        </span>
        <h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px' }}
        >
          Pick Your Fuel.
        </h1>
        <p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}
        >
          Three flat, one-time prices. No retainers, no hidden fees, no surprise invoices — just a
          website that works, live in 48–72 hours.
        </p>
      </header>

      {/* ── Package cards ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 64px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {PACKAGES.map((pkg, i) => {
          const featured = !!pkg.featured;
          const accent = featured ? 'var(--color-brand-primary)' : 'var(--color-ink-muted)';
          const accentBg = featured ? 'color-mix(in srgb, var(--color-brand-primary) 12%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 6%, transparent)';
          const ctaBg = featured ? 'var(--color-brand-primary)' : 'transparent';
          const ctaFg = featured ? 'var(--color-bg-base)' : 'var(--color-ink-base)';
          const ctaBorder = featured ? 'none' : '1px solid color-mix(in srgb, var(--color-ink-base) 15%, transparent)';

          return (
            <div
              key={pkg.id}
              className="pkg-card-grid"
              style={{
                background: featured
                  ? 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 10%, transparent), color-mix(in srgb, var(--color-ink-base) 3%, transparent))'
                  : 'color-mix(in srgb, var(--color-ink-base) 3%, transparent)',
                border: `1px solid ${featured ? 'color-mix(in srgb, var(--color-brand-primary) 35%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 8%, transparent)'}`,
                borderRadius: 18,
                padding: 40,
                position: 'relative',
              }}
            >
              {/* Best Value ribbon */}
              {featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--color-brand-primary)',
                    color: 'var(--color-bg-base)',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '6px 16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    borderRadius: '0 18px 0 12px',
                  }}
                >
                  Best Value
                </div>
              )}

              {/* Left: identity, price, CTA */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: accent,
                    background: accentBg,
                    alignSelf: 'flex-start',
                    padding: '5px 12px',
                    borderRadius: 999,
                    marginBottom: 16,
                  }}
                >
                  {pkg.bestFor}
                </span>
                <h3
                  className="font-display"
                  style={{ fontSize: 26, fontWeight: 700, fontStyle: 'italic', margin: '0 0 8px' }}
                >
                  {pkg.name}
                </h3>
                <p
                  className="text-ink-muted font-light"
                  style={{ fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}
                >
                  {pkg.tagline}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span className="font-display" style={{ fontSize: 44, fontWeight: 900 }}>
                    {pkg.price}
                  </span>
                  <span
                    style={{ fontSize: 11, color: 'var(--color-ink-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}
                  >
                    / {pkg.tier}
                  </span>
                </div>
                <p
                  style={{ fontSize: 11, color: 'var(--color-ink-muted)', margin: '0 0 28px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {pkg.timeline}
                </p>
                <CustomButton
                  onClick={() => navigate('/settings/my-projects/new-project')}
                  variant="ghost"
                  size="none"
                  style={{
                    marginTop: 'auto',
                    textAlign: 'center',
                    padding: 15,
                    background: ctaBg,
                    color: ctaFg,
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: ctaBorder,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {pkg.cta}
                </CustomButton>
              </div>

              {/* Right: categorized feature list */}
              <div
                className="pkg-card-divider"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  borderLeft: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)',
                  paddingLeft: 40,
                }}
              >
                {pkg.featuresIntro && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--color-brand-primary)',
                      fontStyle: 'italic',
                    }}
                  >
                    {pkg.featuresIntro}
                  </div>
                )}
                {pkg.categories.map(cat => (
                  <div key={cat.label}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: 'var(--color-ink-muted)',
                        margin: '0 0 12px',
                      }}
                    >
                      {cat.label}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cat.items.map(f => (
                        <div key={f.label} style={{ display: 'flex', gap: 12 }}>
                          <span style={{ color: 'var(--color-brand-primary)', flexShrink: 0, fontSize: 13, marginTop: 1 }}>✓</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                            <div
                              style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 2, fontWeight: 300, lineHeight: 1.5 }}
                            >
                              {f.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Comparison table ── */}
      <section
        style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', margin: '0 0 32px', textAlign: 'center' }}
        >
          Compare Every Package.
        </h2>
        <div style={{ overflowX: 'auto', border: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)', borderRadius: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '20px 24px',
                    background: 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)',
                    borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-ink-muted)',
                    fontWeight: 700,
                  }}
                >
                  Feature
                </th>
                {PACKAGES.map(pkg => (
                  <th
                    key={pkg.id}
                    style={{
                      textAlign: 'center',
                      padding: '20px 20px',
                      background: pkg.featured ? 'color-mix(in srgb, var(--color-brand-primary) 8%, transparent)' : 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)',
                      borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 8%, transparent)',
                      borderLeft: '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)',
                      minWidth: 140,
                    }}
                  >
                    <div className="font-display" style={{ fontWeight: 700, fontStyle: 'italic', fontSize: 15, color: 'var(--color-ink-base)' }}>
                      {pkg.name}
                    </div>
                    <div
                      className="font-display"
                      style={{ fontWeight: 900, fontSize: 22, color: pkg.featured ? 'var(--color-brand-primary)' : 'var(--color-ink-base)', marginTop: 4 }}
                    >
                      {pkg.price}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(row => (
                <tr key={row.label}>
                  <td
                    style={{
                      padding: '14px 24px',
                      fontSize: 13,
                      color: 'var(--color-ink-base)',
                      borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 5%, transparent)',
                    }}
                  >
                    {row.label}
                  </td>
                  {row.included.map((yes, ci) => (
                    <td
                      key={ci}
                      style={{
                        textAlign: 'center',
                        padding: '14px 20px',
                        borderBottom: '1px solid color-mix(in srgb, var(--color-ink-base) 5%, transparent)',
                        borderLeft: '1px solid color-mix(in srgb, var(--color-ink-base) 5%, transparent)',
                        background: PACKAGES[ci].featured ? 'color-mix(in srgb, var(--color-brand-primary) 3%, transparent)' : 'transparent',
                      }}
                    >
                      <span
                        style={{
                          color: yes ? 'var(--color-brand-primary)' : 'color-mix(in srgb, var(--color-ink-base) 20%, transparent)',
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {yes ? '✓' : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Guarantee banner ── */}
      <section
        style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 96px' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 8%, transparent), rgba(112,0,255,0.04))',
            border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)',
            borderRadius: 16,
            padding: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 32 }}>🛡️</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
              Live in 72 hours, or it's free.
            </h3>
            <p className="text-ink-muted font-light" style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              You don't pay the final balance until you've approved the design — every package includes
              revisions before anything goes live.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
