import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks';

import Navbar from '../components/layout/Navbar';
import MobileMenu from '../components/layout/MobileMenu';
import Footer from '../components/layout/Footer';
import BackgroundDecor from '../components/layout/BackgroundDecor';

import AuthModal, { type AuthMode } from '../components/modals/AuthModal';
import MockupModal from '../components/modals/MockupModal';
import AdminPanel from '../components/modals/AdminPanel';
import ProfileMenu from '../components/modals/ProfileMenu';

import SeoSchema from '../components/home/SeoSchema';
import Hero from '../components/home/Hero';
import ProcessSection from '../components/home/ProcessSection';
import PricingSection from '../components/home/PricingSection';
import ReviewsSection from '../components/home/ReviewsSection';
import FaqSection from '../components/home/FaqSection';
import ContactSection from '../components/home/ContactSection';
import FinalCTA from '../components/home/FinalCTA';

export default function Home() {
  const { user } = useAuth();

  // Modal / menu visibility
  const [isMockupOpen, setIsMockupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedPackage, setSelectedPackage] = useState('visibility');
  const [pendingAction, setPendingAction] = useState<'OPEN_MOCKUP' | null>(null);

  useBodyScrollLock(isMobileMenuOpen || isMockupOpen || isAuthOpen || isAdminOpen);

  const handleStartProject = (packageId?: string) => {
    setSelectedPackage(packageId ?? 'visibility');
    if (!user) {
      setPendingAction('OPEN_MOCKUP');
      setAuthMode('signup');
      setIsAuthOpen(true);
    } else {
      setIsMockupOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingAction === 'OPEN_MOCKUP') {
      setIsMockupOpen(true);
      setPendingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden selection:bg-brand-primary selection:text-bg-base font-sans">
      <SeoSchema />
      <BackgroundDecor />

      <MockupModal
        isOpen={isMockupOpen}
        onClose={() => setIsMockupOpen(false)}
        selectedPackage={selectedPackage}
        onPackageChange={setSelectedPackage}
      />

      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      <ProfileMenu
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <Navbar
        onStartProject={() => handleStartProject()}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onToggleProfile={() => setIsProfileOpen((v) => !v)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isProfileOpen={isProfileOpen}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onStartProject={() => handleStartProject()}
        onOpenAuth={() => {
          setAuthMode('signup');
          setIsAuthOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <Hero />
      <ProcessSection />
      <PricingSection onSelectPackage={handleStartProject} />
      <ReviewsSection />
      <FaqSection />
      <ContactSection />
      <FinalCTA onStartProject={() => handleStartProject()} />
      <Footer />
    </div>
  );
}
