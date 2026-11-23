import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Older versions mirrored every analytics event into the visitor's own
// localStorage (for a demo dashboard that no longer exists): clean it up.
try {
  localStorage.removeItem('securite-local-events');
} catch {
  /* storage unavailable */
}

// Register the service worker for offline support (production builds only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
    // Warm the lazily-loaded Tools chunk once idle so the SW caches it and
    // the tools keep working offline even if never opened online.
    const warm = () => import('./components/ToolsPage').catch(() => {});
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 5000 });
    else setTimeout(warm, 3000);
  });
}
