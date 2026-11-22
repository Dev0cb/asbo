// Tailwind v4 runs as a PostCSS plugin. Without this file `@import "tailwindcss"`
// is inlined raw and NO utility classes are generated (site looks unstyled).
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
