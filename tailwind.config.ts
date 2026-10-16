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
        champagne: {
          DEFAULT: '#f8e7c9',
          50: '#fefcf8',
          100: '#fdf7ee',
          200: '#faeed9',
          300: '#f8e7c9',
          400: '#f3d9ab',
          500: '#e8c280',
          600: '#d4a453',
          surface: '#fdf7ee',
          card: '#faedd7',
          cardHover: '#f5dfb8',
          border: '#e4caa0',
          dark: '#ebd0a5',
        },
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
          deep: '#012018',
        },
        academic: {
          dark: '#064E3B',
          navy: '#064E3B',
          accent: '#064E3B',
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
