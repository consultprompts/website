import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

export default function Academy() {
  const navigate = useNavigate();

  return (
    <div className="text-white">
      <section style={{ padding: '148px 24px', textAlign: 'center' }}>
        <motion.div
          style={{ maxWidth: 560, margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span
            style={{ color: '#B98CFF', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: 16 }}
          >
            Academy
          </span>
          <h1
            className="font-display font-bold italic"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', margin: '0 0 20px' }}
          >
            Academy courses, coming soon.
          </h1>
          <p
            className="text-ink-muted font-light"
            style={{ fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}
          >
            This page is still in the oven — bring the curriculum and we'll build the full course
            catalog next.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              color: '#FFFFFF',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #7000FF',
              paddingBottom: 2,
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            ← Back home
          </button>
        </motion.div>
      </section>
    </div>
  );
}
