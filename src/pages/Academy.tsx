import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileMenu from '../components/modals/ProfileMenu';
import AuthModal from '../components/modals/AuthModal';
import { useAuth } from '../context/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EASE = [0.16, 1, 0.3, 1] as any;

export default function Academy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base font-sans text-white flex flex-col">
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

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px', textAlign: 'center' }}>
        <motion.div
          style={{ maxWidth: 560 }}
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
            Cohort courses, coming soon.
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

      <Footer />
    </div>
  );
}
