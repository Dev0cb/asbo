export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const AUTHOR = {
  name: 'Malick BA',
  role: 'Ingénieur logiciel · Systèmes distribués',
  portfolio: 'https://malickba.me',
  linkedin: 'https://www.linkedin.com/in/malick-ba-519002333',
  github: 'https://github.com/Dev0cb',
};

export const PLATFORM_URL = 'https://asbo.malickba.me';

export const BRAND = {
  name: 'ASBO',
  full: 'Aar Sa Bopp Online',
  platform: 'ASBO Platform',
};
