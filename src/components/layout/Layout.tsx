import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useBodyScrollLock, useSettingsNavigate } from '../../hooks';
import { LayoutContext, type LayoutContextValue } from '../../context/LayoutContext';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal, { type AuthMode } from '../modals/AuthModal';


export default function Layout() {
  const navigate = useSettingsNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const startProjectHandler = useRef<(() => void) | null>(null);
  const authSuccessHandler = useRef<(() => void) | null>(null);

  useBodyScrollLock(isAuthOpen);

  const openAuthModal = useCallback((mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  // Strip ?auth=login&next=... from the URL on close so a refresh doesn't
  // reopen the modal — those params only make sense while it's open.
  const closeAuthModal = useCallback(() => {
    setIsAuthOpen(false);
    if (searchParams.has('auth') || searchParams.has('next')) {
      const next = new URLSearchParams(searchParams);
      next.delete('auth');
      next.delete('next');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleStartProject = useCallback(() => {
    if (startProjectHandler.current) {
      startProjectHandler.current();
    } else {
      navigate('/settings/my-projects/new-project');
    }
  }, [navigate]);

  const contextValue = useMemo<LayoutContextValue>(() => ({
    openAuthModal,
    setStartProjectHandler: (fn) => { startProjectHandler.current = fn; },
    setAuthSuccessHandler: (fn) => { authSuccessHandler.current = fn; },
  }), [openAuthModal]);

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col">
        <AuthModal
          isOpen={isAuthOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={closeAuthModal}
          onSuccess={() => authSuccessHandler.current?.()}
        />
        
        <Navbar onStartProject={handleStartProject} onOpenAuth={() => openAuthModal('login')}/>
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
}
