import React from 'react';

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconShield = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const IconBook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" />
    <path d="M4 19a2 2 0 012-2h13" />
  </svg>
);
export const IconTool = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14.7 6.3a4 4 0 010 5.6l-6 6a4 4 0 01-5.6-5.6l4-4" />
    <path d="M16 4l4 4" />
  </svg>
);
export const IconScale = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M8 21h8" />
    <path d="M5 7l-3 6a3.5 3.5 0 007 0L6 7" />
    <path d="M19 7l-3 6a3.5 3.5 0 007 0l-3-6" />
    <path d="M4 7h16" />
  </svg>
);
export const IconUser = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
  </svg>
);
export const IconLock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);
export const IconSun = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const IconMoon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
  </svg>
);
export const IconMenu = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const IconExternal = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6M20 4L11 13" />
    <path d="M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6" />
  </svg>
);
export const IconCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);
export const IconAlert = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3L2 20h20L12 3z" />
    <path d="M12 10v4M12 17.5v.5" />
  </svg>
);
export const IconClock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
export const IconArrow = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconShare = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />
  </svg>
);
export const IconPhone = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);
export const IconWifi = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M2 9a15 15 0 0120 0" />
    <path d="M5 12.5a10 10 0 0114 0" />
    <path d="M8.5 16a5 5 0 017 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);
export const IconKey = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="14" r="4" />
    <path d="M11 11l9-9M17 5l2 2M14 8l2 2" />
  </svg>
);
export const IconMoney = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);
export const IconChat = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 01-8 8H4l2-3a8 8 0 1115-5z" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
  </svg>
);
export const IconChild = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
    <path d="M9 11h6" />
  </svg>
);
export const IconNews = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 5h14v14H6a2 2 0 01-2-2V5z" />
    <path d="M18 9h2v10a2 2 0 01-2 2" />
    <path d="M7 9h7M7 13h7M7 17h4" />
  </svg>
);
export const IconPhish = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);
export const IconDownload = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);
export const IconEye = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconLogout = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const GUIDE_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  phish: IconPhish,
  money: IconMoney,
  key: IconKey,
  share: IconChat,
  phone: IconPhone,
  wifi: IconWifi,
  child: IconChild,
  news: IconNews,
  alert: IconAlert,
};

/** Senegal flag (filled, not stroke-based). Decorative: hidden from AT. */
export const FlagSN = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 30 20" aria-hidden="true" {...p}>
    <rect width="10" height="20" fill="#00853f" />
    <rect x="10" width="10" height="20" fill="#fdef42" />
    <rect x="20" width="10" height="20" fill="#e31b23" />
    <path d="M15 6.2l1.06 3.26h3.43l-2.77 2.02 1.06 3.26L15 12.72l-2.78 2.02 1.06-3.26-2.77-2.02h3.43z" fill="#00853f" />
  </svg>
);

/** ASBO logo mark: a keyhole that is also a person — "protect yourself". */
export const AsboMark = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" {...p}>
    <rect width="64" height="64" rx="14" fill="var(--brand)" />
    <circle cx="32" cy="24.5" r="8.5" fill="#f4efe4" />
    <path d="M27.6 30.5h8.8l5 19.5H22.6z" fill="#f4efe4" stroke="#f4efe4" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
