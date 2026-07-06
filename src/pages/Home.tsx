import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks';
import { getMyLeads } from '../lib/api';

import Navbar from '../components/layout/Navbar';
import MobileMenu from '../components/layout/MobileMenu';
import Footer from '../components/layout/Footer';
import BackgroundDecor from '../components/layout/BackgroundDecor';

import AuthModal, { type AuthMode } from '../components/modals/AuthModal';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlreadyActiveOpen, setIsAlreadyActiveOpen] = useState(false);

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedPackage, setSelectedPackage] = useState('visibility');
  const [pendingAction, setPendingAction] = useState<'NAVIGATE_START_PROJECT' | null>(null);

  useBodyScrollLock(isMobileMenuOpen || isAuthOpen || isAlreadyActiveOpen);

  // Open login modal automatically when redirected from a protected page
  useEffect(() => {
    if (searchParams.get('auth') === 'login') {
      setAuthMode('login');
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  const checkActiveLead = async (): Promise<boolean> => {
    try {
      const leads = await getMyLeads();
      return leads.some(l => l.status !== 'completed');
    } catch {
      return false;
    }
  };

  const handleStartProject = async (packageId?: string) => {
    const pkg = packageId ?? 'visibility';
    setSelectedPackage(pkg);
    if (!user) {
      setPendingAction('NAVIGATE_START_PROJECT');
      setAuthMode('signup');
      setIsAuthOpen(true);
    } else {
      if (await checkActiveLead()) {
        setIsAlreadyActiveOpen(true);
      } else {
        navigate('/start-project', { state: { package: pkg } });
      }
    }
  };

  const handleAuthSuccess = async () => {
    const next = searchParams.get('next');
    if (next) {
      navigate(next);
      return;
    }
    if (pendingAction === 'NAVIGATE_START_PROJECT') {
      setPendingAction(null);
      if (await checkActiveLead()) {
        setIsAlreadyActiveOpen(true);
      } else {
        navigate('/start-project', { state: { package: selectedPackage } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-base overflow-x-hidden selection:bg-brand-primary selection:text-bg-base font-sans">
      <SeoSchema />
      <BackgroundDecor />

      <AnimatePresence>
        {isAlreadyActiveOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAlreadyActiveOpen(false)}
              className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md liquid-glass rounded-xl p-8 md:p-10 text-center z-10"
            >
              <button
                onClick={() => setIsAlreadyActiveOpen(false)}
                className="absolute top-5 right-5 text-ink-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-brand-primary" />
              </div>

              <h3 className="font-display text-2xl font-bold italic mb-3">You're Already in Line</h3>
              <p className="text-ink-muted text-sm font-light leading-relaxed mb-8">
                You already have an active project with us. We're working on it — reach out on
                WhatsApp if you have updates or questions.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/13026622736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-green-500 text-bg-base font-black uppercase tracking-widest hover:bg-green-400 transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <Link
                  to="/my-projects"
                  onClick={() => setIsAlreadyActiveOpen(false)}
                  className="w-full py-3 border border-white/10 text-ink-muted font-bold uppercase tracking-widest text-xs rounded-xl hover:border-white/30 hover:text-white transition-colors"
                >
                  Track My Project
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ProfileMenu
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <Navbar
        onStartProject={() => handleStartProject()}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
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
