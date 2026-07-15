import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsPanel, { SETTINGS_SECTIONS, ADMIN_SECTIONS, type Section } from '../components/modals/SettingsPanel';

function isSection(v: string | undefined): v is Section {
  return !!v && (SETTINGS_SECTIONS as readonly string[]).includes(v);
}

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  // Matched via the "/settings/*" splat route (see App.tsx) rather than a
  // fixed ":section" param, so a deeper sub-page — e.g. "my-projects/new-project"
  // — can live under a section without its own top-level route.
  const params = useParams();
  const rest = (params['*'] ?? '').split('/').filter(Boolean);
  const sectionParam = rest[0];
  const { user, loading, isAdmin } = useAuth();

  const section: Section | null = isSection(sectionParam) ? sectionParam : null;
  // Admin-only sections are invalid for non-admins — treat them like a bad URL.
  const validSection = section && (isAdmin || !ADMIN_SECTIONS.includes(section)) ? section : null;

  useEffect(() => {
    // Preserve the exact path the visitor was trying to reach — e.g. a bare
    // "Start a project" CTA that hard-navigates to .../new-project with no
    // auth pre-check — so login sends them back to what they actually wanted,
    // not just the section root.
    if (!loading && !user) {
      navigate(`/?auth=login&next=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // An unknown/forbidden section canonicalizes to my-projects. A bare
  // "/settings" (no sectionParam at all) is left alone — SettingsPanel
  // renders it as the section picker on mobile instead of redirecting.
  useEffect(() => {
    if (!loading && user && sectionParam && !validSection) {
      navigate('/settings/my-projects', { replace: true });
    }
  }, [loading, user, sectionParam, validSection, navigate]);

  if (loading || !user) return null;
  if (sectionParam && !validSection) return null; // pending redirect above

  // navigate(-1) only works when this page was reached by an in-app push
  // (e.g. the Console button). If /settings was loaded directly — refresh,
  // bookmark, typed URL — there's no in-app history entry to pop, and
  // history.back() bounces the tab through whatever was there before the
  // SPA loaded, producing a visible flash/blink. React Router stamps a
  // monotonically increasing `idx` on history.state for entries it created;
  // idx > 0 means there's a real entry behind us to return to.
  const handleClose = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <SettingsPanel
      isOpen={true}
      fullScreen
      section={validSection ?? 'my-projects'}
      startOnMenu={!validSection}
      // replace: section switches don't stack history entries, so the ✕
      // (navigate(-1)) still exits settings instead of stepping back
      // through every section visited.
      onSectionChange={(s) => navigate(`/settings/${s}`, { replace: true })}
      onClose={handleClose}
    />
  );
}
