/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A6FF',
        'primary-dark': '#0085CC',
        // primary-light, text-main and text-muted are theme-aware (see index.css).
        'primary-light': 'rgb(var(--c-primary-light) / <alpha-value>)',
        accent: '#FF6B6B',
        'text-main': 'rgb(var(--c-text-main) / <alpha-value>)',
        'text-muted': 'rgb(var(--c-text-muted) / <alpha-value>)',
      },
      // Remap the surface utilities (bg-white / bg-gray-50 / bg-gray-100) to
      // theme-aware variables so existing markup adapts in dark mode. text-white
      // is intentionally NOT remapped, so button labels stay white.
      backgroundColor: {
        white: 'rgb(var(--c-bg-base) / <alpha-value>)',
        'gray-50': 'rgb(var(--c-bg-subtle) / <alpha-value>)',
        'gray-100': 'rgb(var(--c-bg-muted) / <alpha-value>)',
      },
      borderColor: {
        'gray-100': 'rgb(var(--c-border-soft) / <alpha-value>)',
        'gray-200': 'rgb(var(--c-border-base) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
