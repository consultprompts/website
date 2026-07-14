import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MousePointer2, Rocket, CheckCircle } from 'lucide-react';
import { useStartProjectHandler } from '../hooks';
import CustomButton from '../components/ui/CustomButton';

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
  useStartProjectHandler(() => navigate('/#pricing'));

  return (
    <div className="text-white">
      {/* ── Header ── */}
      <header style={{ padding: '148px 24px 56px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <span
          className="font-bold uppercase block"
          style={{ color: 'var(--color-brand-primary)', fontSize: 12, letterSpacing: '0.14em', marginBottom: 16 }}
        >
          Our DNA
        </span>
        <h1
          className="font-display font-bold italic"
          style={{ fontSize: 'clamp(32px, 5vw, 60px)', margin: '0 0 20px' }}
        >
          Simple. Brutal. Fast Web Design.
        </h1>
        <p
          className="text-ink-muted font-light"
          style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}
        >
          We've automated the fluff out of local business web design. Here's exactly how we get
          your new site live in record time — no discovery calls, no scope creep, no waiting.
        </p>
      </header>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 96px' }}>
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className="step-row"
            style={{
              padding: '40px 0',
              borderBottom: i < STEPS.length - 1 ? '1px solid color-mix(in srgb, var(--color-ink-base) 6%, transparent)' : 'none',
            }}
          >
            {/* Left rail — icon badge + connector */}
            <div className="step-rail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-brand-primary) 15%, transparent), rgba(112,0,255,0.08))',
                  border: '1px solid color-mix(in srgb, var(--color-brand-primary) 30%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="step-connector"
                  style={{ width: 1, flex: 1, minHeight: 40, background: 'color-mix(in srgb, var(--color-ink-base) 8%, transparent)', transformOrigin: 'top' }}
                />
              )}
            </div>

            {/* Right content */}
            <div>
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
                <span
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Step {step.id}
                </span>
                <span
                  style={{ fontSize: 11, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
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
                <div
                  style={{ background: 'color-mix(in srgb, var(--color-ink-base) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--color-ink-base) 7%, transparent)', borderRadius: 12, padding: 20 }}
                >
                  <p
                    style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-muted)', margin: '0 0 14px' }}
                  >
                    What You Do
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {step.yourRole.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: 'var(--color-ink-muted)', flexShrink: 0 }}>·</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'color-mix(in srgb, var(--color-brand-primary) 5%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-brand-primary) 18%, transparent)',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <p
                    style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-primary)', margin: '0 0 14px' }}
                  >
                    What We Do
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {step.ourRole.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                        <span style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* You Get callout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  background: 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)',
                  border: '1px dashed color-mix(in srgb, var(--color-ink-base) 15%, transparent)',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>📦</span>
                <span style={{ fontSize: 13 }}>
                  <strong
                    style={{ color: 'var(--color-ink-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.08em', marginRight: 8 }}
                  >
                    You Get
                  </strong>
                  {step.deliverable}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Closing CTA ── */}
      <section
        style={{ padding: '80px 24px', background: 'color-mix(in srgb, var(--color-ink-base) 2%, transparent)', textAlign: 'center' }}
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
        <CustomButton onClick={() => navigate('/settings/my-projects/new-project')} arrow>
          Start a project
        </CustomButton>
      </section>
    </div>
  );
}
