import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useBodyScrollLock } from '../../hooks';
import { LayoutContext, type LayoutContextValue } from '../../context/LayoutContext';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal, { type AuthMode } from '../modals/AuthModal';
import ProfileMenu from '../modals/ProfileMenu';


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
      navigate('/settings/my-projects/new-project');
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
          <Outlet />
        </main>

        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
