import React, { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { STR, type Lang } from '../i18n';
import { getSupabase, isSupabaseEnabled } from '../lib/stats';
import { IconLock } from './icons';
import { Dashboard } from './admin/Dashboard';
import type { EventRow } from './admin/aggregate';
import { dashStrings } from './admin/strings';

interface Props {
  lang: Lang;
}

/** PostgREST returns at most 1,000 rows per request: page through them. */
const PAGE_SIZE = 1000;
/** Safety cap. Past this volume, move aggregation to SQL views (see AGENTS.md). */
const MAX_ROWS = 200_000;

async function fetchAllEvents(): Promise<EventRow[]> {
  const sb = await getSupabase();
  if (!sb) return [];
  const rows: EventRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await sb
      .from('events')
      .select('type,data,session_id,lang,created_at')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...((data as EventRow[]) ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

export const AdminPage: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];
  if (!isSupabaseEnabled()) {
    // No fake/demo numbers: without a database there is nothing to show.
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[var(--text-heading)]">{t.admin.title}</h1>
        <p className="mt-4 text-[var(--text-muted)]">{t.admin.noBackend}</p>
      </div>
    );
  }
  return <SupabaseAdmin lang={lang} />;
};

const SupabaseAdmin: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];
  const s = dashStrings(lang);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getSupabase().then(async (sb) => {
      if (!sb || !active) return;
      const { data } = await sb.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setAuthReady(true);
      const { data: sub } = sb.auth.onAuthStateChange((_e, next) => setSession(next));
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    setLoadError(false);
    try {
      setRows(await fetchAllEvents());
      setFetchedAt(Date.now());
    } catch {
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session) void load();
  }, [session, load]);

  const logout = async () => {
    const sb = await getSupabase();
    await sb?.auth.signOut();
    setRows(null);
  };

  if (!authReady) return <p className="py-24 text-center text-[var(--text-muted)]">{t.common.loading}</p>;
  if (!session) return <LoginForm lang={lang} />;
  if (loadError && !rows) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-[var(--text)]">{s.errorData}</p>
        <button type="button" onClick={() => void load()} className="btn-primary mt-6">
          {s.refresh}
        </button>
      </div>
    );
  }
  if (!rows) return <p className="py-24 text-center text-[var(--text-muted)]">{s.loadingData}</p>;

  return (
    <Dashboard
      lang={lang}
      rows={rows}
      fetchedAt={fetchedAt}
      refreshing={refreshing}
      onRefresh={() => void load()}
      onLogout={() => void logout()}
    />
  );
};

const LoginForm: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const sb = await getSupabase();
    const result = await sb?.auth.signInWithPassword({ email, password });
    if (!result || result.error) setError(t.admin.error);
    setBusy(false);
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
      <form onSubmit={submit} className="card w-full p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <IconLock className="h-6 w-6 text-[var(--accent-text)]" />
          <h1 className="text-2xl font-semibold text-[var(--text-heading)]">{t.admin.loginTitle}</h1>
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t.admin.loginSub}</p>
        <label className="mt-6 block text-sm font-medium text-[var(--text)]">
          {t.admin.email}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1.5"
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-[var(--text)]">
          {t.admin.password}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1.5"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="mt-3 text-sm text-[var(--bad)]" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? t.common.loading : t.admin.login}
        </button>
      </form>
    </div>
  );
};
