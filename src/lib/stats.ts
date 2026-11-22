import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from '../config';
import { getSessionId } from './session';
import type { SupabaseClient } from '@supabase/supabase-js';

export type EventType =
  | 'page_view'
  | 'guide_view'
  | 'quiz_complete'
  | 'checker_use'
  | 'checklist_update'
  | 'lab_complete'
  | 'outbound_click';

// The Supabase SDK is lazy-loaded so the main bundle stays small for
// low-end devices and slow connections.
let clientPromise: Promise<SupabaseClient | null> | null = null;

function getClient(): Promise<SupabaseClient | null> {
  if (!supabaseEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
        auth: { persistSession: true, autoRefreshToken: true },
      }),
    );
  }
  return clientPromise;
}

export function isSupabaseEnabled() {
  return supabaseEnabled;
}

export async function getSupabase() {
  return getClient();
}

// Fire-and-forget event tracking. Always safe to call — failures are swallowed
// so analytics never break the user experience.
export function track(type: EventType, data: Record<string, unknown> = {}) {
  try {
    void getClient().then((sb) => {
      if (sb) {
        void sb
          .from('events')
          .insert({
            type,
            data,
            session_id: getSessionId(),
            lang: document.documentElement.lang || 'fr',
          })
          .then(() => {});
      }
    });
    // Local mirror so the admin demo still shows something without a backend.
    const key = 'securite-local-events';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ type, data, t: Date.now() });
    if (list.length > 500) list.splice(0, list.length - 500);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* never throw */
  }
}

export function getLocalEvents(): { type: string; data: any; t: number }[] {
  try {
    return JSON.parse(localStorage.getItem('securite-local-events') || '[]');
  } catch {
    return [];
  }
}
