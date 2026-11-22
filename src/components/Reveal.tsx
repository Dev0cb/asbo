import React, { useLayoutEffect, useRef } from 'react';

/**
 * Scroll reveal that can never leave content invisible:
 * - content is visible by default (no JS / slow JS → still readable);
 * - only elements that start BELOW the fold get the hidden "pending" state,
 *   and they are revealed when scrolled into view (or after a safety timeout).
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already on screen at mount: leave it visible, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add('reveal-pending');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) show();
      },
      { threshold: 0.05 },
    );
    // Safety net for flaky IO implementations (old Android WebViews).
    const timer = window.setTimeout(() => show(), 4000);
    function show() {
      el?.classList.remove('reveal-pending');
      io.disconnect();
      window.clearTimeout(timer);
    }
    io.observe(el);
    return show;
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};
