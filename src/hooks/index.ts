import { useEffect } from 'react';
import { useLayout } from '../context/LayoutContext';

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
