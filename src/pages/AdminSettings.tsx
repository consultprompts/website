import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettingsNavigate } from '../hooks';
import AdminSettingsPanel, { ADMIN_SETTINGS_SECTIONS, type AdminSection } from '../components/modals/AdminSettingsPanel';

function isAdminSection(v: string | undefined): v is AdminSection {
  return !!v && (ADMIN_SETTINGS_SECTIONS as readonly string[]).includes(v);
}

// Must match the settings:duration-300 clip-path transition on the panel's
// outer wrapper — closing waits for that animation to finish before the route
// actually changes, so the panel is still mounted (and visible) throughout.
const CLOSE_TRANSITION_MS = 300;

export default function AdminSettings() {
  const navigate = useNavigate();
  // Section switches/redirects within the panel must forward the existing
  // background location (see hooks/useSettingsNavigate) instead of dropping
  // it — plain `navigate` above is kept only for the numeric navigate(-1)
  // close case, which useSettingsNavigate's string-only signature can't do.
  const settingsNavigate = useSettingsNavigate();
  const location = useLocation();
  const params = useParams();
  const rest = (params['*'] ?? '').split('/').filter(Boolean);
  const sectionParam = rest[0];
  const { user, loading, isAdmin } = useAuth();

  const validSection: AdminSection | null = isAdminSection(sectionParam) ? sectionParam : null;

  // Drives the desktop clip-path open/close transition. Starts false so the
  // panel mounts already clipped shut, then flips true a frame later so the
  // transition actually animates instead of popping straight to open.
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(`/?auth=login&next=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    // Admin-only console — regular users get their own settings instead.
    if (!isAdmin) {
      settingsNavigate('/settings/my-projects', { replace: true });
    }
  }, [user, loading, isAdmin, navigate, settingsNavigate, location.pathname]);

  // Bare "/admin-settings" (or an unknown section) canonicalizes to agency.
  useEffect(() => {
    if (!loading && user && isAdmin && !validSection) {
      settingsNavigate('/admin-settings/agency', { replace: true });
    }
  }, [loading, user, isAdmin, validSection, settingsNavigate]);

  if (loading || !user || !isAdmin || !validSection) return null;

  // navigate(-1) only works when this page was reached by an in-app push.
  // If it was loaded directly — refresh, bookmark, typed URL — there's no
  // in-app history entry to pop; React Router stamps a monotonically
  // increasing `idx` on history.state for entries it created, so idx > 0
  // means there's a real entry behind us to return to.
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
    // transition — below that, close instantly (see Settings.tsx for why).
    if (window.matchMedia('(min-width: 1250px)').matches) {
      setClosing(true);
      window.setTimeout(finishClose, CLOSE_TRANSITION_MS);
    } else {
      finishClose();
    }
  };

  return (
    <AdminSettingsPanel
      isOpen={entered && !closing}
      fullScreen
      section={validSection}
      // replace: section switches don't stack history entries, so the ✕
      // (navigate(-1)) still exits the console instead of stepping back
      // through every section visited.
      onSectionChange={(s) => settingsNavigate(`/admin-settings/${s}`, { replace: true })}
      onClose={handleClose}
    />
  );
}
