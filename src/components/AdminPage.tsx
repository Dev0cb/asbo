import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { STR, type Lang } from '../i18n';
import { GUIDES } from '../data/guides';
import { getLocalEvents, getSupabase, isSupabaseEnabled, track } from '../lib/stats';
import { IconLock, IconLogout, IconEye } from './icons';

interface Props {
  lang: Lang;
}

interface Row {
  type: string;
  data: any;
  session_id?: string;
  created_at?: string;
  t?: number;
}

const TYPE_COLORS: Record<string, string> = {
  page_view: 'var(--color-accent)',
  guide_view: '#38bdf8',
  quiz_complete: 'var(--good)',
  checker_use: '#c084fc',
  checklist_update: '#fbbf24',
  lab_complete: '#f472b6',
  outbound_click: 'var(--text-muted)',
};

export const AdminPage: React.FC<Props> = ({ lang }) => {
  const t = STR[lang];

  if (!isSupabaseEnabled()) {
    return <DemoDashboard lang={lang} />;
  }
  return <SupabaseDashboard lang={lang} />;
};

/* ---------------- Shared aggregation ---------------- */

function aggregate(rows: Row[], lang: Lang) {
  const now = Date.now();
  const dayMs = 86400000;

  const byDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }

  const guideCounts: Record<string, number> = {};
  const scoreBuckets: Record<string, number> = {
    '0-25%': 0,
    '26-50%': 0,
    '51-75%': 0,
    '76-100%': 0,
  };
  const typeCounts: Record<string, number> = {};
  const sessions = new Set<string>();
  let pageviews = 0;
  let quizzes = 0;
  let checkers = 0;

  for (const r of rows) {
    const ts = r.created_at ? new Date(r.created_at).getTime() : r.t ?? now;
    const day = new Date(ts).toISOString().slice(0, 10);
    if (day in byDay) byDay[day] += 1;

    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    if (r.session_id) sessions.add(r.session_id);

    if (r.type === 'page_view') pageviews++;
    if (r.type === 'quiz_complete') {
      quizzes++;
      const max = (r.data?.max as number) || 20;
      const pct = ((r.data?.score as number) || 0) / max;
      const bucket =
        pct <= 0.25 ? '0-25%' : pct <= 0.5 ? '26-50%' : pct <= 0.75 ? '51-75%' : '76-100%';
      scoreBuckets[bucket]++;
    }
    if (r.type === 'checker_use') checkers++;
    if (r.type === 'guide_view' && r.data?.slug) {
      const slug = r.data.slug as string;
      guideCounts[slug] = (guideCounts[slug] || 0) + 1;
    }
  }

  const guides = GUIDES[lang];
  const topGuides = Object.entries(guideCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, count]) => ({
      title: guides.find((g) => g.slug === slug)?.title || slug,
      count,
    }));

  const days = Object.entries(byDay).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }));
  const maxDay = Math.max(...days.map((d) => d.count), 1);

  const maxBucket = Math.max(...Object.values(scoreBuckets), 1);
  const maxGuide = Math.max(...topGuides.map((g) => g.count), 1);

  return {
    total: rows.length,
    visitors: sessions.size,
    pageviews,
    quizzes,
    checkers,
    typeCounts,
    days,
    maxDay,
    topGuides,
    maxGuide,
    scoreBuckets,
    maxBucket,
  };
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-extrabold text-[var(--text-heading)] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">{label}</p>
    </div>
  );
}

function DashboardView({
  lang,
  rows,
  demo,
}: {
  lang: Lang;
  rows: Row[];
  demo?: boolean;
}) {
  const t = STR[lang];
  const stats = useMemo(() => aggregate(rows, lang), [rows, lang]);
  const recent = rows.slice(0, 25);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-heading)]">{t.admin.title}</h1>
          {demo && (
            <p className="mt-1 text-sm font-medium text-[var(--warn)]">{t.admin.demo}</p>
          )}
        </div>
        {!demo && <LogoutButton lang={lang} />}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t.admin.visitors} value={stats.visitors} />
        <StatCard label={t.admin.events} value={stats.total} />
        <StatCard label={t.admin.pageviews} value={stats.pageviews} />
        <StatCard label={t.admin.quizzes} value={stats.quizzes} />
        <StatCard label={t.admin.checkers} value={stats.checkers} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Last 7 days */}
        <div className="card p-5">
          <h2 className="font-bold text-[var(--text-heading)]">{t.admin.last7}</h2>
          <div className="mt-4 flex h-36 items-end gap-2">
            {stats.days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">{d.count || ''}</span>
                <div
                  className="w-full rounded-t-md bg-[var(--color-accent)]/80"
                  style={{ height: `${Math.max((d.count / stats.maxDay) * 100, d.count ? 4 : 2)}%` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[10px] text-[var(--text-muted)]">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top guides */}
        <div className="card p-5">
          <h2 className="font-bold text-[var(--text-heading)]">{t.admin.topGuides}</h2>
          {stats.topGuides.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">{t.admin.empty}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.topGuides.map((g) => (
                <li key={g.title}>
                  <div className="flex justify-between text-sm">
                    <span className="line-clamp-1 text-[var(--text)]">{g.title}</span>
                    <span className="ml-2 font-mono text-[var(--text-muted)]">{g.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
                    <div
                      className="h-full bg-[#38bdf8]"
                      style={{ width: `${(g.count / stats.maxGuide) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Score distribution */}
        <div className="card p-5">
          <h2 className="font-bold text-[var(--text-heading)]">{t.admin.scoreDist}</h2>
          <ul className="mt-4 space-y-3">
            {Object.entries(stats.scoreBuckets).map(([bucket, count]) => (
              <li key={bucket}>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text)]">{bucket}</span>
                  <span className="font-mono text-[var(--text-muted)]">{count}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
                  <div
                    className="h-full bg-[var(--good)]"
                    style={{ width: `${(count / stats.maxBucket) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Event type breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-[var(--text-heading)]">{t.admin.events}</h2>
          <ul className="mt-4 space-y-2.5">
            {Object.entries(stats.typeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <li key={type} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: TYPE_COLORS[type] || 'var(--text-muted)' }}
                  />
                  <span className="flex-1 text-[var(--text)]">{type}</span>
                  <span className="font-mono text-[var(--text-muted)]">{count}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Recent events */}
      <div className="card mt-4 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="font-bold text-[var(--text-heading)]">{t.admin.recent}</h2>
        </div>
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-muted)]">{t.admin.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-5 py-3">{t.admin.type}</th>
                  <th className="px-5 py-3">{t.admin.data}</th>
                  <th className="px-5 py-3">{t.admin.date}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--border)]/50 last:border-0">
                    <td className="px-5 py-2.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          color: TYPE_COLORS[r.type] || 'var(--text)',
                          background: 'var(--bg-elevated)',
                        }}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="max-w-[280px] truncate px-5 py-2.5 font-mono text-xs text-[var(--text-muted)]">
                      {r.data ? JSON.stringify(r.data) : '—'}
                    </td>
                    <td className="px-5 py-2.5 text-xs text-[var(--text-muted)]">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString()
                        : r.t
                          ? new Date(r.t).toLocaleString()
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Demo (no backend) ---------------- */

const DemoDashboard: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const [rows] = useState<Row[]>(() => getLocalEvents());
  useEffect(() => {
    track('page_view', { page: 'admin-demo' });
  }, []);
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="card flex flex-col gap-4 border-[var(--warn)]/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-heading)]">{t.admin.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">{t.admin.noBackend}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--warn)]">
            <IconEye className="h-4 w-4" />
            {t.admin.demo}
          </div>
        </div>
      </div>
      <DashboardView lang={lang} rows={rows} demo />
    </div>
  );
};

/* ---------------- Supabase auth + data ---------------- */

const LogoutButton: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  return (
    <button
      onClick={async () => {
        const sb = await getSupabase();
        await sb?.auth.signOut();
        window.location.hash = '#/admin';
        window.location.reload();
      }}
      className="btn-ghost text-sm"
    >
      <IconLogout className="h-4 w-4" /> {t.admin.logout}
    </button>
  );
};

const SupabaseDashboard: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = STR[lang];
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
      sb.auth.onAuthStateChange((_e, s) => setSession(s));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    setDataLoading(true);
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      const { data } = await sb
        .from('events')
        .select('type,data,session_id,created_at')
        .order('created_at', { ascending: false })
        .limit(5000);
      setRows((data as Row[]) || []);
      setDataLoading(false);
    })();
  }, [session]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const sb = await getSupabase();
    const { error: err } = await sb!.auth.signInWithPassword({ email, password });
    if (err) setError(t.admin.error);
    setBusy(false);
  };

  if (loading) {
    return <div className="py-24 text-center text-[var(--text-muted)]">{t.common.loading}</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
        <form onSubmit={login} className="card w-full p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <IconLock className="h-7 w-7 text-[var(--color-accent)]" />
            <h1 className="text-xl font-extrabold text-[var(--text-heading)]">{t.admin.loginTitle}</h1>
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
              autoComplete="email"
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
          {error && <p className="mt-3 text-sm text-[var(--bad)]">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
            {busy ? t.common.loading : t.admin.login}
          </button>
        </form>
      </div>
    );
  }

  if (dataLoading) {
    return <div className="py-24 text-center text-[var(--text-muted)]">{t.common.loading}</div>;
  }

  return <DashboardView lang={lang} rows={rows} />;
};
