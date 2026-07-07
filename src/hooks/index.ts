import { useEffect } from 'react';

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
