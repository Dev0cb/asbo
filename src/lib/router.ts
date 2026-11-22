// Lightweight hash router: routes look like #/guides/phishing, #/outils, #/admin…
export interface Route {
  path: string[]; // e.g. ['guides', 'phishing']
  raw: string;
}

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = hash.split('/').filter(Boolean);
  return { path, raw: hash };
}

export function navigate(to: string) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

/**
 * In-page jump that does NOT touch the URL hash. A plain href="#section"
 * would be parsed by the hash router as a route and send users to Home.
 * Moves keyboard focus to the target for screen-reader / keyboard users.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}
