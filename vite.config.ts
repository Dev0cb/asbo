import path from 'path';
import { createHash } from 'crypto';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const SUPABASE_HOST = 'https://cwbriicexplvyosdvqmb.supabase.co';

/**
 * Production-only Content-Security-Policy. GitHub Pages cannot send HTTP
 * headers, so the policy ships as a <meta> tag. Inline scripts (the
 * theme bootstrap in index.html) are allowed by SHA-256 hash, not by
 * 'unsafe-inline'. Not applied in dev: Vite's HMR injects inline scripts.
 */
function cspPlugin(): Plugin {
  return {
    name: 'asbo-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
          .map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(' ')}`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data:",
          `connect-src 'self' ${SUPABASE_HOST} ${SUPABASE_HOST.replace('https', 'wss')}`,
          "manifest-src 'self'",
          "worker-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
          'upgrade-insecure-requests',
        ].join('; ');
        return html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
        );
      },
    },
  };
}

// base './' so the build works both at a subdomain root and under a sub-path.
export default defineConfig({
  base: './',
  server: {
    port: 3100,
    host: '0.0.0.0',
  },
  plugins: [react(), cspPlugin()],
  // The on-device LLM runs in a module worker (src/lib/llm/worker.ts).
  worker: { format: 'es' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
