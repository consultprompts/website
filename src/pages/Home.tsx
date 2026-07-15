import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStartProjectHandler, useSettingsNavigate } from '../hooks';
import { getMyLeads } from '../lib/api';
import { useLayout } from '../context/LayoutContext';

import BackgroundDecor from '../components/layout/BackgroundDecor';

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
  const navigate = useSettingsNavigate();
  const { openAuthModal, setAuthSuccessHandler } = useLayout();

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
      // One project in flight at a time: with one already active, land on its
      // tracker in My Projects instead of the new-project brief.
      if (await checkActiveLead()) {
        navigate('/settings/my-projects');
      } else {
        navigate('/settings/my-projects/new-project', { state: { package: pkg } });
      }
    }
  };

  const handleAuthSuccess = async () => {
    const next = searchParams.get('next');
    // Only in-app paths: reject absolute ("https://…") and protocol-relative
    // ("//evil.com") values so a crafted login link can't bounce the user to
    // another site after they authenticate.
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      navigate(next);
      return;
    }
    if (pendingAction === 'NAVIGATE_START_PROJECT') {
      setPendingAction(null);
      if (await checkActiveLead()) {
        navigate('/settings/my-projects');
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
