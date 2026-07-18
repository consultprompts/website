import React, { useEffect, useRef, useState } from 'react';

// Scroll-reveal wrapper for showcase template sections: content fades and
// rises in the first time it scrolls into view. IntersectionObserver measures
// visibility against the viewport but respects ancestor clipping, so it works
// inside the mock browser's overflow pane (and the fullscreen preview).
//
// Don't wrap sticky elements (template navbars, cookie banners): the
// transform would turn this wrapper into their containing block and break
// stickiness. Once revealed, transform resolves to 'none' so descendants
// behave as if unwrapped.
//
// Respects prefers-reduced-motion by showing content immediately.
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Extra ms before the transition starts — for staggering siblings. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
