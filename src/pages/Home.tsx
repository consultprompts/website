import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStartProjectHandler } from '../hooks';
import { getMyLeads } from '../lib/api';
import { useLayout } from '../context/LayoutContext';

import BackgroundDecor from '../components/layout/BackgroundDecor';
import Notification from '../components/ui/Notification';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openAuthModal, setAuthSuccessHandler } = useLayout();

  const [isAlreadyActiveOpen, setIsAlreadyActiveOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('visibility');
  const [pendingAction, setPendingAction] = useState<'NAVIGATE_START_PROJECT' | null>(null);

  // Open login modal automatically when redirected from a protected page. If
  // the user is already logged in (e.g. they navigated back into this exact
  // URL after logging in — see SettingsPanel's onClose), this is a stale
  // link: skip the modal and strip the params instead of re-prompting login.
  useEffect(() => {
    if (searchParams.get('auth') !== 'login') return;
    if (user) {
      setSearchParams({}, { replace: true });
    } else {
      openAuthModal('login');
    }
  }, [searchParams, openAuthModal, user, setSearchParams]);

  const checkActiveLead = async (): Promise<boolean> => {
    try {
      const leads = await getMyLeads();
      return leads.some(l => l.status !== 'launched' && l.status !== 'completed' && l.status !== 'suspended');
    } catch {
      return false;
    }
  };

  const handleStartProject = async (packageId?: string) => {
    const pkg = packageId ?? 'visibility';
    setSelectedPackage(pkg);
    if (!user) {
      setPendingAction('NAVIGATE_START_PROJECT');
      openAuthModal('signup');
    } else {
      if (await checkActiveLead()) {
        setIsAlreadyActiveOpen(true);
      } else {
        navigate('/settings/my-projects/new-project', { state: { package: pkg } });
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
        navigate('/settings/my-projects/new-project', { state: { package: selectedPackage } });
      }
    }
  };

  useStartProjectHandler(() => handleStartProject());

  // Runs after a successful login/signup in the shared auth modal.
  useEffect(() => {
    setAuthSuccessHandler(handleAuthSuccess);
    return () => setAuthSuccessHandler(null);
  });

  return (
    <div className="overflow-x-hidden">
      <SeoSchema />
      <BackgroundDecor />

      <Notification
        isOpen={isAlreadyActiveOpen}
        onClose={() => setIsAlreadyActiveOpen(false)}
        icon={<CheckCircle className="w-8 h-8 text-brand-primary" />}
        title="You're Already in Line"
        description="You already have an active project with us. We're working on it — reach out on WhatsApp if you have updates or questions."
      >
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
          to="/settings/my-projects"
          onClick={() => setIsAlreadyActiveOpen(false)}
          className="w-full py-4 border border-brand-primary text-brand-primary font-black uppercase tracking-widest hover:bg-brand-primary hover:text-bg-base transition-colors flex items-center justify-center gap-2 rounded-xl cursor-pointer"
        >
          Track My Project
        </Link>
      </Notification>

      <Hero />
      <ProcessSection />
      <ReviewsSection />
      <PricingSection onSelectPackage={handleStartProject} />
      <FaqSection />
      {/* <ContactSection /> */}
      <FinalCTA onStartProject={() => handleStartProject()} />
    </div>
  );
}
