import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileMenu from '../components/modals/ProfileMenu';
import AuthModal from '../components/modals/AuthModal';
import { useAuth } from '../context/AuthContext';
import { REVIEWS } from '../data/content';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

const STATS = [
  { value: '40%', label: 'Avg. Sales Lift' },
  { value: '4.9', label: 'Client Rating' },
  { value: '34', label: 'Shops Shipped' },
];

export default function Work() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const featured = REVIEWS.find(r => r.featured)!;
  const others = REVIEWS.filter(r => !r.featured);

  return (
    <div className="min-h-screen bg-bg-base font-sans text-white">
      <Navbar
        onStartProject={() => navigate('/start-project')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onToggleProfile={() => setIsProfileOpen(v => !v)}
        onOpenMobileMenu={() => {}}
        isProfileOpen={isProfileOpen}
      />
      <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AuthModal
        isOpen={isAuthOpen}
        mode="login"
        onModeChange={() => {}}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* ── Header ── */}
      <header style={{ padding: '148px 24px 48px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <motion.span
          className="font-bold uppercase block"
          style={{ color: '#00F0FF', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          The Receipts
        </motion.span>
        <motion.h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          Built for the block.{' '}
          <span style={{ color: '#00F0FF' }}>Loved</span> by it.
        </motion.h1>
        <motion.p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, margin: 0 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
        >
          Three real businesses, three real launches. Here's the problem we walked into, the fix we
          shipped, and what happened next.
        </motion.p>
      </header>

      {/* ── Featured spotlight ── */}
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: EASE }}
        style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 64px' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(112,0,255,0.03))',
            border: '1px solid rgba(0,240,255,0.22)',
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
              color: '#00F0FF',
              background: 'rgba(0,240,255,0.12)',
              padding: '6px 14px',
              borderRadius: 999,
            }}
          >
            Featured Launch
          </span>

          <span
            style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1A1' }}
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
              { label: 'The Problem', color: '#A1A1A1', text: featured.problem },
              { label: 'The Fix',     color: '#00F0FF', text: featured.fix },
              { label: 'The Result',  color: '#A1A1A1', text: featured.result },
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
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 28,
            }}
          >
            <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, fontStyle: 'italic', maxWidth: 560 }}>
              "{featured.quote}"
            </p>
            <div style={{ display: 'flex', gap: 32, flexShrink: 0 }}>
              {featured.metrics.map(m => (
                <div key={m.label}>
                  <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: '#00F0FF' }}>
                    {m.value}
                  </div>
                  <div
                    style={{ fontSize: 10, color: '#A1A1A1', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── More Launches ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <p
          style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#A1A1A1', margin: '0 0 8px' }}
        >
          More Launches
        </p>
        {others.map((cs, i) => {
          const imgLeft = i % 2 !== 0;
          return (
            <motion.div
              key={cs.client}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
              className="launch-row"
              style={{
                gridTemplateColumns: imgLeft ? '1fr 1.1fr' : '1.1fr 1fr',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 32,
              }}
            >
              {/* Text block */}
              <div style={{ order: imgLeft ? 2 : 1 }}>
                <span
                  style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1A1' }}
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
                    <strong style={{ color: '#00F0FF', fontWeight: 700 }}>Fix: </strong>
                    {cs.fix}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: '#A1A1A1', fontWeight: 700 }}>Result: </strong>
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
                        style={{ fontSize: 9, color: '#A1A1A1', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}
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
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(112,0,255,0.06))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A1A1A1',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                Site preview — {cs.siteLabel}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── Trust strip ── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          padding: '56px 24px',
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
          {STATS.map(stat => (
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
      </motion.section>

      {/* ── Closing CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ padding: '80px 24px', textAlign: 'center' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(26px, 4vw, 42px)', margin: '0 0 20px' }}
        >
          Want to be the next one here?
        </h2>
        <button
          onClick={() => navigate('/start-project')}
          className="font-black transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            background: '#00F0FF',
            color: '#050505',
            padding: '16px 34px',
            borderRadius: 12,
            border: 'none',
            fontSize: 15,
            display: 'inline-block',
            marginTop: 12,
          }}
        >
          Start your project →
        </button>
      </motion.section>

      <Footer />
    </div>
  );
}
