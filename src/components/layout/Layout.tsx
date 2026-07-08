import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useBodyScrollLock } from '../../hooks';
import { LayoutContext, type LayoutContextValue } from '../../context/LayoutContext';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal, { type AuthMode } from '../modals/AuthModal';
import ProfileMenu from '../modals/ProfileMenu';

/**
 * Crossfades page content on route change without remounting the navbar/footer
 * around it. Uses `popLayout` so the incoming page starts fading in immediately
 * (the outgoing one is pulled out of flow) instead of `wait`, which fades the
 * old page fully to invisible before the new one appears — a visible blink.
 */
function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const startProjectHandler = useRef<(() => void) | null>(null);
  const authSuccessHandler = useRef<(() => void) | null>(null);

  useBodyScrollLock(isAuthOpen);

  const openAuthModal = useCallback((mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const handleStartProject = useCallback(() => {
    if (startProjectHandler.current) {
      startProjectHandler.current();
    } else {
      navigate('/start-project');
    }
  }, [navigate]);

  const contextValue = useMemo<LayoutContextValue>(() => ({
    openAuthModal,
    isProfileOpen,
    toggleProfileMenu: () => setIsProfileOpen(v => !v),
    setStartProjectHandler: (fn) => { startProjectHandler.current = fn; },
    setAuthSuccessHandler: (fn) => { authSuccessHandler.current = fn; },
  }), [openAuthModal, isProfileOpen]);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col">
        <AuthModal
          isOpen={isAuthOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => authSuccessHandler.current?.()}
        />
        <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

        <Navbar
          onStartProject={handleStartProject}
          onOpenAuth={() => openAuthModal('login')}
          onToggleProfile={() => setIsProfileOpen(v => !v)}
          onOpenMobileMenu={() => {}}
          isProfileOpen={isProfileOpen}
        />

        <main className="flex-1">
          <AnimatedOutlet />
        </main>

        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
