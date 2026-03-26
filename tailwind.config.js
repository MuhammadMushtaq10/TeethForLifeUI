/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A6FF',
        'primary-dark': '#0085CC',
        'primary-light': '#F5FBFF',
        accent: '#FF6B6B',
        'text-main': '#1A1A2E',
        'text-muted': '#5A6A7A',
      },
    },
  },
  plugins: [],
};
