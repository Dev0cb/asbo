// A drawn smartphone that renders a scenario the way the real app would:
// SMS, WhatsApp, e-mail (Gmail-like), Messenger or a Facebook post.
// The phone UI keeps the apps' own light colours in both site themes.
// After the user answers, the parts of the screen each clue refers to are
// outlined and numbered (see `Spot`).
import React from 'react';
import type { Lang } from '../../../i18n';
import type { ClueTarget, Illustration, PhishingScenario } from '../../../data/phishing';

const PHONE_STR = {
  fr: {
    today: 'Aujourd\'hui',
    unknown: 'Ce numéro ne figure pas dans vos contacts.',
    block: 'Bloquer',
    add: 'Ajouter',
    encrypted: '🔒 Les messages et appels sont chiffrés de bout en bout.',
    online: 'en ligne',
    message: 'Message',
    textMessage: 'Message texte',
    toMe: 'à moi',
    inbox: 'Boîte de réception',
    reply: 'Répondre',
    forward: 'Transférer',
    activeAgo: 'Actif il y a 5 min',
    like: 'J\'aime',
    comment: 'Commenter',
    share: 'Partager',
    marketplace: 'Marketplace',
  },
  en: {
    today: 'Today',
    unknown: 'This number is not in your contacts.',
    block: 'Block',
    add: 'Add',
    encrypted: '🔒 Messages and calls are end-to-end encrypted.',
    online: 'online',
    message: 'Message',
    textMessage: 'Text message',
    toMe: 'to me',
    inbox: 'Inbox',
    reply: 'Reply',
    forward: 'Forward',
    activeAgo: 'Active 5 min ago',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    marketplace: 'Marketplace',
  },
};

type Marks = Partial<Record<ClueTarget, number[]>>;

interface ScreenProps {
  s: PhishingScenario;
  lang: Lang;
  marks: Marks;
  reveal: boolean;
  tone: 'scam' | 'safe';
}

/* ------------------------------ clue spot ------------------------------ */

const Spot: React.FC<{
  target: ClueTarget;
  marks: Marks;
  reveal: boolean;
  tone: 'scam' | 'safe';
  className?: string;
  children: React.ReactNode;
}> = ({ target, marks, reveal, tone, className = '', children }) => {
  const nums = marks[target];
  const on = reveal && nums && nums.length > 0;
  const color = tone === 'scam' ? '#d92d20' : '#067647';
  return (
    <div
      className={`relative rounded-lg transition-shadow ${className}`}
      style={on ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
    >
      {children}
      {on && (
        <span
          className="absolute -right-2 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
          style={{ background: color }}
          aria-hidden="true"
        >
          {nums!.join('·')}
        </span>
      )}
    </div>
  );
};

/** Plain text with URLs/domains styled as links (never clickable). */
const Linkified: React.FC<{ text: string; color?: string }> = ({ text, color = '#1a73e8' }) => {
  const parts = text.split(/(\bhttps?:\/\/\S+|\b[\w-]+(?:\.[\w-]+)+\/\S*)/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="break-all underline" style={{ color }}>
            {p}
          </span>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
};

const ILLUSTRATION: Record<Illustration, { bg: string; emoji: string }> = {
  gift: { bg: 'linear-gradient(135deg,#ff7a00,#ffb000)', emoji: '🎁' },
  job: { bg: 'linear-gradient(135deg,#1d4ed8,#38bdf8)', emoji: '💼' },
  phone: { bg: 'linear-gradient(135deg,#334155,#94a3b8)', emoji: '📱' },
  video: { bg: 'linear-gradient(135deg,#111827,#4b5563)', emoji: '▶️' },
  crypto: { bg: 'linear-gradient(135deg,#047857,#facc15)', emoji: '📈' },
  parcel: { bg: 'linear-gradient(135deg,#92400e,#fbbf24)', emoji: '📦' },
};

const Picture: React.FC<{ kind?: Illustration; className?: string }> = ({ kind, className = 'h-32' }) =>
  kind ? (
    <div
      className={`flex items-center justify-center text-5xl ${className}`}
      style={{ background: ILLUSTRATION[kind].bg }}
      aria-hidden="true"
    >
      {ILLUSTRATION[kind].emoji}
    </div>
  ) : null;

const Avatar: React.FC<{ label?: string; color: string; size?: number }> = ({ label, color, size = 36 }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    style={{ background: color, width: size, height: size, fontSize: size * 0.42 }}
    aria-hidden="true"
  >
    {label ?? '👤'}
  </span>
);

const initial = (name: string) => (/^[+\d]/.test(name) ? undefined : name.replace(/[^\p{L}]/gu, '').charAt(0).toUpperCase());

/* ------------------------------ SMS ------------------------------ */

const SmsScreen: React.FC<ScreenProps> = ({ s, lang, marks, reveal, tone }) => {
  const t = PHONE_STR[lang];
  return (
    <div className="flex h-full flex-col bg-white text-[#111]">
      <div className="flex flex-col items-center gap-1 border-b border-[#e5e5ea] bg-[#f9f9f9] px-4 pb-2 pt-1">
        <Avatar label={initial(s.sender)} color="#8e8e93" size={40} />
        <Spot target="sender" marks={marks} reveal={reveal} tone={tone} className="px-1.5">
          <p className="text-[13px] font-medium">{s.sender} ›</p>
        </Spot>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-3 text-center text-[11px] text-[#8e8e93]">
          {t.today} {s.time}
        </p>
        <Spot target="body" marks={marks} reveal={reveal} tone={tone} className="max-w-[85%]">
          <div className="rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 py-2 text-[14px] leading-snug">
            {s.body}
            {s.link && (
              <Spot target="link" marks={marks} reveal={reveal} tone={tone} className="mt-1 inline-block">
                <Linkified text={s.link} color="#0a64d8" />
              </Spot>
            )}
          </div>
        </Spot>
      </div>
      <div className="flex items-center gap-2 border-t border-[#e5e5ea] px-3 py-2">
        <span className="flex-1 rounded-full border border-[#d1d1d6] px-3 py-1.5 text-[13px] text-[#8e8e93]">{t.textMessage}</span>
      </div>
    </div>
  );
};

/* ------------------------------ WhatsApp ------------------------------ */

const WhatsAppScreen: React.FC<ScreenProps> = ({ s, lang, marks, reveal, tone }) => {
  const t = PHONE_STR[lang];
  return (
    <div className="flex h-full flex-col text-[#111b21]" style={{ background: '#efeae2' }}>
      <div className="flex items-center gap-2.5 bg-[#008069] px-3 py-2 text-white">
        <span aria-hidden="true">←</span>
        <Avatar label={s.unknown ? undefined : s.avatar ?? initial(s.sender)} color="#6b7c85" size={34} />
        <Spot target="sender" marks={marks} reveal={reveal} tone={tone} className="min-w-0 flex-1 px-1">
          <p className="truncate text-[14px] font-medium">{s.sender}</p>
          <p className="text-[11px] opacity-80">{t.online}</p>
        </Spot>
        <span className="text-[15px]" aria-hidden="true">📹 📞</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        <p className="mx-auto w-fit rounded-md bg-[#ffeecd] px-2.5 py-1 text-center text-[10.5px] leading-snug text-[#54656f]">{t.encrypted}</p>
        {s.unknown && (
          <Spot target="banner" marks={marks} reveal={reveal} tone={tone}>
            <div className="rounded-lg bg-white px-3 py-2.5 text-center shadow-sm">
              <p className="text-[12px] text-[#54656f]">{t.unknown}</p>
              <div className="mt-2 flex justify-center gap-8 text-[13px] font-semibold">
                <span className="text-[#ea0038]">{t.block}</span>
                <span className="text-[#008069]">{t.add}</span>
              </div>
            </div>
          </Spot>
        )}
        <Spot target="body" marks={marks} reveal={reveal} tone={tone} className="max-w-[88%]">
          <div className="overflow-hidden rounded-lg rounded-tl-none bg-white shadow-sm">
            <Picture kind={s.illustration} className="h-28" />
            <div className="whitespace-pre-line px-2.5 pb-1 pt-1.5 text-[13.5px] leading-snug">
              {s.body}
              {s.link && (
                <Spot target="link" marks={marks} reveal={reveal} tone={tone} className="mt-1">
                  <Linkified text={s.link} color="#027eb5" />
                </Spot>
              )}
              <span className="float-right ml-2 mt-1 text-[10.5px] text-[#667781]">{s.time}</span>
            </div>
          </div>
        </Spot>
      </div>
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-[#8696a0]">{t.message}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-white" aria-hidden="true">🎤</span>
      </div>
    </div>
  );
};

/* ------------------------------ E-mail ------------------------------ */

const EmailScreen: React.FC<ScreenProps> = ({ s, lang, marks, reveal, tone }) => {
  const t = PHONE_STR[lang];
  const ext = s.attachment?.split('.').pop()?.toUpperCase();
  return (
    <div className="flex h-full flex-col bg-white text-[#1f1f1f]">
      <div className="flex items-center justify-between px-4 py-2.5 text-[#444746]" aria-hidden="true">
        <span>←</span>
        <span className="tracking-[0.3em]">▢ 🗑 ✉ ⋮</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <Spot target="subject" marks={marks} reveal={reveal} tone={tone} className="px-1">
          <h3 className="text-[19px] leading-snug">
            {s.subject}{' '}
            <span className="ml-1 rounded bg-[#e8eaed] px-1.5 py-0.5 align-middle text-[10px] text-[#444746]">{t.inbox}</span>
          </h3>
        </Spot>
        <Spot target="sender" marks={marks} reveal={reveal} tone={tone} className="mt-3 p-1">
          <div className="flex items-start gap-2.5">
            <Avatar label={initial(s.sender)} color="#7b5cc4" />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-2 text-[14px]">
                <span className="truncate font-semibold">{s.sender}</span>
                <span className="shrink-0 text-[11px] text-[#5e5e5e]">{s.time}</span>
              </p>
              <p className="truncate text-[11.5px] text-[#5e5e5e]">&lt;{s.senderDetail}&gt;</p>
              <p className="text-[11.5px] text-[#5e5e5e]">{t.toMe} ▾</p>
            </div>
          </div>
        </Spot>
        <Spot target="body" marks={marks} reveal={reveal} tone={tone} className="mt-3 p-1">
          <p className="whitespace-pre-line text-[13.5px] leading-relaxed">{s.body}</p>
        </Spot>
        {s.cta && (
          <Spot target="cta" marks={marks} reveal={reveal} tone={tone} className="mt-3 inline-block">
            <span className="inline-block rounded-md bg-[#1a73e8] px-4 py-2 text-[13px] font-medium text-white">{s.cta}</span>
          </Spot>
        )}
        {s.attachment && (
          <Spot target="attachment" marks={marks} reveal={reveal} tone={tone} className="mt-4">
            <div className="flex items-center gap-3 rounded-lg border border-[#dadce0] p-2.5">
              <span className="flex h-10 w-9 items-center justify-center rounded bg-[#3ddc84] text-[9px] font-bold text-[#073042]">{ext}</span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium">{s.attachment}</p>
                <p className="text-[11px] text-[#5e5e5e]">2,4 Mo</p>
              </div>
            </div>
          </Spot>
        )}
      </div>
      <div className="flex gap-2 border-t border-[#e0e0e0] px-4 py-2.5 text-[12.5px] text-[#444746]">
        <span className="rounded-full border border-[#747775] px-3 py-1">↩ {t.reply}</span>
        <span className="rounded-full border border-[#747775] px-3 py-1">↪ {t.forward}</span>
      </div>
    </div>
  );
};

/* ------------------------------ Messenger ------------------------------ */

const MessengerScreen: React.FC<ScreenProps> = ({ s, lang, marks, reveal, tone }) => {
  const t = PHONE_STR[lang];
  return (
    <div className="flex h-full flex-col bg-white text-[#050505]">
      <div className="flex items-center gap-2.5 border-b border-[#e4e6eb] px-3 py-2">
        <span className="text-[#0866ff]" aria-hidden="true">←</span>
        <Avatar label={s.avatar ?? initial(s.sender)} color="#c2410c" size={34} />
        <Spot target="sender" marks={marks} reveal={reveal} tone={tone} className="min-w-0 flex-1 px-1">
          <p className="truncate text-[14px] font-semibold">{s.sender}</p>
          <p className="text-[11px] text-[#65676b]">{s.senderDetail ?? t.activeAgo}</p>
        </Spot>
        <span className="text-[#0866ff]" aria-hidden="true">📞 📹</span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {s.price && (
          <Spot target="price" marks={marks} reveal={reveal} tone={tone}>
            <div className="flex items-center gap-2.5 rounded-xl bg-[#f0f2f5] p-2">
              <Picture kind={s.illustration} className="h-12 w-12 shrink-0 rounded-md text-2xl" />
              <div className="min-w-0">
                <p className="text-[10.5px] uppercase tracking-wide text-[#65676b]">{t.marketplace}</p>
                <p className="truncate text-[13px] font-semibold">{s.price}</p>
              </div>
            </div>
          </Spot>
        )}
        <div className="flex items-end gap-1.5">
          <Avatar label={s.avatar ?? initial(s.sender)} color="#c2410c" size={24} />
          <Spot target="body" marks={marks} reveal={reveal} tone={tone} className="max-w-[80%]">
            <div className="rounded-[18px] rounded-bl-[4px] bg-[#f0f0f0] px-3 py-2 text-[14px] leading-snug">{s.body}</div>
          </Spot>
        </div>
        {s.link && (
          <div className="ml-[30px] max-w-[80%]">
            <Spot target="link" marks={marks} reveal={reveal} tone={tone}>
              <div className="overflow-hidden rounded-[18px] bg-[#f0f0f0]">
                {!s.price && <Picture kind={s.illustration} className="h-28" />}
                <p className="px-3 py-2 text-[12px] text-[#65676b]">
                  <Linkified text={s.link} color="#65676b" />
                </p>
              </div>
            </Spot>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 text-[#0866ff]">
        <span aria-hidden="true">⊕ 📷 🖼</span>
        <span className="flex-1 rounded-full bg-[#f0f2f5] px-3 py-1.5 text-[13px] text-[#65676b]">Aa</span>
        <span aria-hidden="true">👍</span>
      </div>
    </div>
  );
};

/* ------------------------------ Facebook post ------------------------------ */

const FacebookScreen: React.FC<ScreenProps> = ({ s, lang, marks, reveal, tone }) => {
  const t = PHONE_STR[lang];
  return (
    <div className="flex h-full flex-col bg-[#f0f2f5] text-[#050505]">
      <div className="flex items-center justify-between bg-white px-3 py-2">
        <span className="text-[22px] font-bold tracking-tight text-[#0866ff]">facebook</span>
        <span className="text-[15px] text-[#050505]" aria-hidden="true">＋ 🔍 💬</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <article className="mt-2 bg-white pb-1">
          <div className="flex items-center gap-2.5 px-3 pt-3">
            <Avatar label="O" color="#ff7900" />
            <Spot target="sender" marks={marks} reveal={reveal} tone={tone} className="min-w-0 flex-1 px-1">
              <p className="truncate text-[14px] font-semibold">{s.sender}</p>
              <p className="text-[11.5px] text-[#65676b]">{s.senderDetail}</p>
            </Spot>
            <span className="text-[#65676b]" aria-hidden="true">⋯ ✕</span>
          </div>
          <Spot target="body" marks={marks} reveal={reveal} tone={tone} className="mx-2 mt-2 px-1">
            <p className="whitespace-pre-line text-[13.5px] leading-snug">{s.body}</p>
          </Spot>
          <Picture kind={s.illustration} className="mt-2 h-36" />
          {s.link && (
            <Spot target="link" marks={marks} reveal={reveal} tone={tone} className="mx-0 rounded-none">
              <div className="flex items-center justify-between gap-2 bg-[#f0f2f5] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] uppercase text-[#65676b]">{s.link}</p>
                  <p className="truncate text-[13px] font-semibold">{s.sender}</p>
                </div>
                {s.cta && <span className="shrink-0 rounded-md bg-[#e4e6eb] px-3 py-1.5 text-[12.5px] font-semibold">{s.cta}</span>}
              </div>
            </Spot>
          )}
          <p className="px-3 pt-2 text-[12px] text-[#65676b]">👍❤️😮 {s.stats}</p>
          <div className="mx-3 mt-2 flex justify-around border-t border-[#ced0d4] pt-1.5 text-[12.5px] font-semibold text-[#65676b]">
            <span>👍 {t.like}</span>
            <span>💬 {t.comment}</span>
            <span>↗ {t.share}</span>
          </div>
        </article>
      </div>
    </div>
  );
};

/* ------------------------------ frame ------------------------------ */

const STATUS_BAR: Record<PhishingScenario['channel'], { bg: string; fg: string }> = {
  sms: { bg: '#f9f9f9', fg: '#111' },
  whatsapp: { bg: '#008069', fg: '#fff' },
  email: { bg: '#ffffff', fg: '#111' },
  messenger: { bg: '#ffffff', fg: '#111' },
  facebook: { bg: '#ffffff', fg: '#111' },
};

const SCREENS: Record<PhishingScenario['channel'], React.FC<ScreenProps>> = {
  sms: SmsScreen,
  whatsapp: WhatsAppScreen,
  email: EmailScreen,
  messenger: MessengerScreen,
  facebook: FacebookScreen,
};

export const Phone: React.FC<{
  scenario: PhishingScenario;
  lang: Lang;
  reveal: boolean;
  label: string;
}> = ({ scenario, lang, reveal, label }) => {
  const Screen = SCREENS[scenario.channel];
  // Clue n°i points at its target; several clues may share one spot.
  const marks: Marks = {};
  scenario.clues.forEach((c, i) => {
    if (c.target) (marks[c.target] ??= []).push(i + 1);
  });
  const statusTime = /^\d{2}:\d{2}$/.test(scenario.time) ? scenario.time : '10:24';
  const bar = STATUS_BAR[scenario.channel];

  return (
    <figure
      className="mx-auto w-full max-w-[330px] rounded-[46px] bg-[#16161a] p-[11px] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/40"
      aria-label={label}
    >
      <div className="relative flex h-[640px] flex-col overflow-hidden rounded-[36px] bg-white">
        {/* status bar */}
        <div
          className="relative flex h-9 shrink-0 items-center justify-between px-6 text-[12px] font-semibold"
          style={{ background: bar.bg, color: bar.fg }}
        >
          <span>{statusTime}</span>
          <span className="absolute left-1/2 top-2 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#16161a]" aria-hidden="true" />
          <span className="flex items-center gap-1" aria-hidden="true">
            <svg width="17" height="11" viewBox="0 0 17 11"><g fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></g></svg>
            <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="3" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="14" height="7" rx="1.5" fill="currentColor" /><rect x="21.5" y="3.5" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" /></svg>
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <Screen s={scenario} lang={lang} marks={marks} reveal={reveal} tone={scenario.isScam ? 'scam' : 'safe'} />
        </div>
        <div className="flex h-5 shrink-0 items-center justify-center bg-inherit" aria-hidden="true">
          <span className="h-1 w-28 rounded-full bg-[#111]" />
        </div>
      </div>
    </figure>
  );
};
