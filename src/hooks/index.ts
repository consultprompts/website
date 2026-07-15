import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, type Location, type NavigateOptions } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

interface BackgroundLocationState {
  backgroundLocation?: Location;
}

/**
 * Computes the location state that puts a page "behind" the /settings
 * overlay — App's background-location routing keeps that page mounted and
 * rendered instead of unmounting it when the route swaps to /settings/*,
 * so it stays visible through the open/close transition. If `location` is
 * itself already inside /settings (i.e. we're navigating within the panel —
 * switching sections, drilling into a lead, etc.), the background it already
 * carries is forwarded as-is rather than being reset to the settings route.
 */
/** True for routes that render as overlays above a background page (see App.tsx). */
function isOverlayPath(pathname: string): boolean {
  return pathname.startsWith('/settings') || pathname.startsWith('/admin-settings');
}

export function settingsNavState(location: Location): BackgroundLocationState {
  const existing = (location.state as BackgroundLocationState | null)?.backgroundLocation;
  return { backgroundLocation: isOverlayPath(location.pathname) ? existing : location };
}

/**
 * navigate() replacement for entering or moving within the /settings overlay
 * — see settingsNavState. Only attaches background state when `to` is
 * actually a /settings/* path; any other destination navigates normally, so
 * a stray backgroundLocation can never shadow an unrelated route.
 */
export function useSettingsNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((to: string, options: NavigateOptions & { state?: Record<string, unknown> } = {}) => {
    if (!isOverlayPath(to)) {
      navigate(to, options);
      return;
    }
    navigate(to, { ...options, state: { ...options.state, ...settingsNavState(location) } });
  }, [navigate, location]);
}

/**
 * Overrides what the shared navbar's "Start a project" button does while this
 * page is mounted, restoring the default (navigate to /settings/my-projects/new-project) on unmount.
 */
export function useStartProjectHandler(handler: () => void) {
  const { setStartProjectHandler } = useLayout();
  useEffect(() => {
    setStartProjectHandler(handler);
    return () => setStartProjectHandler(null);
  });
}

/** Locks body scrolling while `locked` is true (used by modals/menus). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [locked]);
}
