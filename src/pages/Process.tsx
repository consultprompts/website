import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MousePointer2, Rocket, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileMenu from '../components/modals/ProfileMenu';
import AuthModal from '../components/modals/AuthModal';
import { useAuth } from '../context/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

const STEPS = [
  {
    id: '01',
    timing: 'Day 0 — within 24 hours',
    title: 'Get your Mockup',
    description:
      'We design a high-fidelity visual of your site based on your brand. No guesswork, just results.',
    icon: <MousePointer2 className="w-6 h-6 text-brand-primary" />,
    yourRole: [
      'Fill out a 5-minute intake form',
      'Share any logo, colors, or reference sites you like',
    ],
    ourRole: [
      'Build a real, clickable mockup — not a wireframe',
      'Match layout and tone to your industry',
      'Deliver straight to your inbox, no meeting required',
    ],
    deliverable: 'A high-fidelity, clickable mockup of your homepage within 24 hours.',
  },
  {
    id: '02',
    timing: 'Day 1–3',
    title: 'Approve & Launch',
    description:
      'Once you love the design, we build and deploy. Your site goes live on world-class infrastructure.',
    icon: <Rocket className="w-6 h-6 text-brand-primary" />,
    yourRole: [
      'Leave revision notes directly on the mockup',
      'Give final approval to start the build',
    ],
    ourRole: [
      'Build every page, tested across mobile and desktop',
      'Connect your domain, hosting, and SSL',
      'Tune performance so pages load instantly',
    ],
    deliverable: 'Your finished site, live on your domain, within 48–72 hours of approval.',
  },
  {
    id: '03',
    timing: 'Ongoing',
    title: 'Get more Sales',
    description:
      'Stop losing customers to slow loading times or bad UX. Convert visitors into loyal clients immediately.',
    icon: <CheckCircle className="w-6 h-6 text-brand-primary" />,
    yourRole: [
      'Send new photos or offers whenever you have them',
      'Watch leads land straight in your inbox',
    ],
    ourRole: [
      'Keep load times fast so fewer visitors bounce',
      'Wire lead capture and calls-to-action into every page',
      'Offer an optional monthly plan for ongoing updates & security',
    ],
    deliverable: 'A site built to convert, plus the option of a monthly plan to keep it that way.',
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Process() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base font-sans text-white">
      <Navbar
        onStartProject={() => navigate('/#pricing')}
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
      <header style={{ padding: '148px 24px 56px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <motion.span
          className="font-bold uppercase block"
          style={{ color: '#00F0FF', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          Our DNA
        </motion.span>
        <motion.h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          Simple. Brutal. Fast Web Design.
        </motion.h1>
        <motion.p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
        >
          We've automated the fluff out of local business web design. Here's exactly how we get
          your new site live in record time — no discovery calls, no scope creep, no waiting.
        </motion.p>
      </header>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 96px' }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: i * 0.08, ease: EASE }}
            className="step-row"
            style={{
              padding: '40px 0',
              borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {/* Left rail — icon badge + connector */}
            <div className="step-rail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 + 0.15, ease: EASE }}
                animate={{ boxShadow: ['0 0 0px rgba(0,240,255,0)', '0 0 18px rgba(0,240,255,0.35)', '0 0 0px rgba(0,240,255,0)'] }}
                /* @ts-ignore — motion animate accepts string[] for keyframe sequences */
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(112,0,255,0.08))',
                  border: '1px solid rgba(0,240,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  className="step-connector"
                  initial={{ scaleY: 0, originY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: i * 0.08 + 0.3, ease: EASE }}
                  style={{ width: 1, flex: 1, minHeight: 40, background: 'rgba(255,255,255,0.08)', transformOrigin: 'top' }}
                />
              )}
            </div>

            {/* Right content */}
            <div>
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                <span
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Step {step.id}
                </span>
                <span
                  style={{ fontSize: 11, color: '#A1A1A1', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
                >
                  {step.timing}
                </span>
              </div>

              {/* Title + description */}
              <h3 className="font-display" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 12px' }}>
                {step.title}
              </h3>
              <p className="text-ink-muted font-light" style={{ fontSize: 15, lineHeight: 1.7, margin: '0 0 24px', maxWidth: 640 }}>
                {step.description}
              </p>

              {/* What You Do / What We Do */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 + 0.25, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}
                >
                  <p
                    style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A1A1A1', margin: '0 0 14px' }}
                  >
                    What You Do
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {step.yourRole.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: '#A1A1A1', flexShrink: 0 }}>·</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 + 0.35, ease: EASE }}
                  style={{
                    background: 'rgba(0,240,255,0.05)',
                    border: '1px solid rgba(0,240,255,0.18)',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <p
                    style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00F0FF', margin: '0 0 14px' }}
                  >
                    What We Do
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {step.ourRole.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: '#00F0FF', flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* You Get callout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>📦</span>
                <span style={{ fontSize: 13 }}>
                  <strong
                    style={{ color: '#A1A1A1', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.08em', marginRight: 8 }}
                  >
                    You Get
                  </strong>
                  {step.deliverable}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Closing CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}
      >
        <h2
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(26px, 4vw, 42px)', margin: '0 0 20px' }}
        >
          Ready to see your mockup?
        </h2>
        <p className="text-ink-muted font-light" style={{ fontSize: 15, margin: '0 0 32px' }}>
          Tell us about your business — the first draft is in your inbox within 24 hours.
        </p>
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
          }}
        >
          Start a project →
        </button>
      </motion.section>

      <Footer />
    </div>
  );
}
