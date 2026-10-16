import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        emeraldInk: {
          DEFAULT: '#064E3B',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064E3B',
          950: '#022c22',
          deep: '#021f18',
          dark: '#03261d',
          surface: '#043327',
          card: '#064e3b',
          cardHover: '#075b45',
          border: '#0a6c52',
        },
        champagne: {
          DEFAULT: '#f8e7c9',
          50: '#fdfbf7',
          100: '#fcf6ed',
          200: '#faedd7',
          300: '#f8e7c9',
          400: '#eed19c',
          500: '#e3b970',
          600: '#cf9e4b',
          700: '#ad7b33',
          800: '#8c602c',
          900: '#724e27',
          soft: '#faeed9',
          muted: '#c7b89f',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064E3B',
          950: '#022c22',
        },
        academic: {
          dark: '#021f18',
          navy: '#03261d',
          accent: '#f8e7c9',
          gold: '#f8e7c9',
          emerald: '#064E3B',
          rose: '#e11d48'
        }
      },
    },
  },
  plugins: [],
};
export default config;
