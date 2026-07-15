import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettingsNavigate } from '../hooks';
import SettingsPanel, { SETTINGS_SECTIONS, type Section } from '../components/modals/SettingsPanel';

function isSection(v: string | undefined): v is Section {
  return !!v && (SETTINGS_SECTIONS as readonly string[]).includes(v);
}

// Must match the settings:duration-300 clip-path transition on SettingsPanel's
// outer wrapper — closing waits for that animation to finish before the route
// actually changes, so the panel is still mounted (and visible) throughout.
const CLOSE_TRANSITION_MS = 300;

export default function Settings() {
  const navigate = useNavigate();
  // Section switches/redirects within the panel must forward the existing
  // background location (see hooks/useSettingsNavigate) instead of dropping
  // it — plain `navigate` above is kept only for the numeric navigate(-1)
  // close case, which useSettingsNavigate's string-only signature can't do.
  const settingsNavigate = useSettingsNavigate();
  const location = useLocation();
  // Matched via the "/settings/*" splat route (see App.tsx) rather than a
  // fixed ":section" param, so a deeper sub-page — e.g. "my-projects/new-project"
  // — can live under a section without its own top-level route.
  const params = useParams();
  const rest = (params['*'] ?? '').split('/').filter(Boolean);
  const sectionParam = rest[0];
  const { user, loading } = useAuth();

  // Admin sections live under /admin-settings now — anything unknown here
  // (including old /settings/agency links) is just a bad URL.
  const validSection: Section | null = isSection(sectionParam) ? sectionParam : null;

  // Drives the desktop clip-path open/close transition (matches the
  // hamburger menu's wipe reveal). Starts false so the panel mounts already
  // clipped shut, then flips true a frame later so the transition actually
  // animates instead of popping straight to open.
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

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
      settingsNavigate('/settings/my-projects', { replace: true });
    }
  }, [loading, user, sectionParam, validSection, settingsNavigate]);

  if (loading || !user) return null;
  if (sectionParam && !validSection) return null; // pending redirect above

  // navigate(-1) only works when this page was reached by an in-app push
  // (e.g. the Console button). If /settings was loaded directly — refresh,
  // bookmark, typed URL — there's no in-app history entry to pop, and
  // history.back() bounces the tab through whatever was there before the
  // SPA loaded, producing a visible flash/blink. React Router stamps a
  // monotonically increasing `idx` on history.state for entries it created;
  // idx > 0 means there's a real entry behind us to return to.
  const finishClose = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleClose = () => {
    // Only desktop (≥1250px, the "settings" breakpoint) gets the clip-path
    // transition — see SettingsPanel. Below that, close instantly: delaying
    // the route change there would leave a blank gap (panel already clipped
    // away, but still occupying the route) with nothing animating to show for it.
    if (window.matchMedia('(min-width: 1250px)').matches) {
      setClosing(true);
      window.setTimeout(finishClose, CLOSE_TRANSITION_MS);
    } else {
      finishClose();
    }
  };

  return (
    <SettingsPanel
      isOpen={entered && !closing}
      fullScreen
      section={validSection ?? 'my-projects'}
      startOnMenu={!validSection}
      // replace: section switches don't stack history entries, so the ✕
      // (navigate(-1)) still exits settings instead of stepping back
      // through every section visited.
      onSectionChange={(s) => settingsNavigate(`/settings/${s}`, { replace: true })}
      onClose={handleClose}
    />
  );
}
