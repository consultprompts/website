import { createContext, useContext } from 'react';
import type { AuthMode } from '../components/modals/AuthModal';

export interface LayoutContextValue {
  /** Opens the shared auth modal (owned by Layout) in the given mode. */
  openAuthModal: (mode?: AuthMode) => void;
  isProfileOpen: boolean;
  toggleProfileMenu: () => void;
  /** Overrides what the navbar's "Start a project" button does; pass null to restore the default (navigate to /start-project). */
  setStartProjectHandler: (fn: (() => void) | null) => void;
  /** Runs after a successful login/signup via the shared auth modal; pass null to clear. */
  setAuthSuccessHandler: (fn: (() => void) | null) => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within <Layout>');
  return ctx;
}
