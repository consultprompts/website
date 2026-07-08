import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PACKAGES, COMPARISON_ROWS } from '../data/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

const PRICING_FAQS = [
  {
    question: 'Why is it so cheap?',
    answer:
      "Traditional agencies are slow and bloated. We use AI-assisted design workflows and specialized engineering to strip out the waste. You get high-end results without paying for an agency's fancy office.",
  },
  {
    question: 'What if I need more than 5 pages?',
    answer:
      'Our core offer is optimized for efficiency. If you need a more complex site, we can discuss a custom quote, but 99% of local businesses shine with our 3-5 page high-performance setup.',
  },
  {
    question: 'Do you offer maintenance?',
    answer:
      'Yes. For a small monthly fee, we handle all updates, security, and hosting, so you can focus on running your business.',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="text-white">
      {/* ── Header ── */}
      <header style={{ padding: '148px 24px 56px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <motion.span
          className="font-bold uppercase block"
          style={{ color: '#00F0FF', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          Scalable Growth Tiers
        </motion.span>
        <motion.h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          Pick Your Fuel.
        </motion.h1>
        <motion.p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
        >
          Three flat, one-time prices. No retainers, no hidden fees, no surprise invoices — just a
          website that works, live in 48–72 hours.
        </motion.p>
      </header>

      {/* ── Package cards ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 64px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {PACKAGES.map((pkg, i) => {
          const featured = !!pkg.featured;
          const accent = featured ? '#00F0FF' : '#A1A1A1';
          const accentBg = featured ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.06)';
          const ctaBg = featured ? '#00F0FF' : 'transparent';
          const ctaFg = featured ? '#050505' : '#FFFFFF';
          const ctaBorder = featured ? 'none' : '1px solid rgba(255,255,255,0.15)';

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
              className="pkg-card-grid"
              style={{
                background: featured
                  ? 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(255,255,255,0.03))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${featured ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
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
                    background: '#00F0FF',
                    color: '#050505',
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
                    style={{ fontSize: 11, color: '#A1A1A1', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}
                  >
                    / {pkg.tier}
                  </span>
                </div>
                <p
                  style={{ fontSize: 11, color: '#A1A1A1', margin: '0 0 28px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {pkg.timeline}
                </p>
                <button
                  onClick={() => navigate('/start-project')}
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
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {pkg.cta}
                </button>
              </div>

              {/* Right: categorized feature list */}
              <div
                className="pkg-card-divider"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
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
                      color: '#00F0FF',
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
                        color: '#A1A1A1',
                        margin: '0 0 12px',
                      }}
                    >
                      {cat.label}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cat.items.map(f => (
                        <div key={f.label} style={{ display: 'flex', gap: 12 }}>
                          <span style={{ color: '#00F0FF', flexShrink: 0, fontSize: 13, marginTop: 1 }}>✓</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                            <div
                              style={{ fontSize: 12, color: '#A1A1A1', marginTop: 2, fontWeight: 300, lineHeight: 1.5 }}
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
            </motion.div>
          );
        })}
      </section>

      {/* ── Comparison table ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', margin: '0 0 32px', textAlign: 'center' }}
        >
          Compare Every Package.
        </h2>
        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '20px 24px',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#A1A1A1',
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
                      background: pkg.featured ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      minWidth: 140,
                    }}
                  >
                    <div className="font-display" style={{ fontWeight: 700, fontStyle: 'italic', fontSize: 15, color: '#FFFFFF' }}>
                      {pkg.name}
                    </div>
                    <div
                      className="font-display"
                      style={{ fontWeight: 900, fontSize: 22, color: pkg.featured ? '#00F0FF' : '#FFFFFF', marginTop: 4 }}
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
                      color: '#FFFFFF',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
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
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        background: PACKAGES[ci].featured ? 'rgba(0,240,255,0.03)' : 'transparent',
                      }}
                    >
                      <span
                        style={{
                          color: yes ? '#00F0FF' : 'rgba(255,255,255,0.2)',
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
      </motion.section>

      {/* ── Guarantee banner ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 96px' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(112,0,255,0.04))',
            border: '1px solid rgba(0,240,255,0.2)',
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
      </motion.section>
    </div>
  );
}
