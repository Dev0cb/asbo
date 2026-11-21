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

export function useRoute(onChange: () => void): Route {
  // small helper used inside components via useSyncExternalStore-free approach
  return parseHash();
}
