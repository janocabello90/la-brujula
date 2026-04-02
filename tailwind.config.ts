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
        // New gorilla-inspired palette: blue denim + yellow + cream
        crema: '#faf8f4',
        'crema-dark': '#f0ece4',
        negro: '#1a1a2e',
        denim: '#3d5a80',
        'denim-dark': '#2c4460',
        'denim-light': '#5b7ea8',
        amarillo: '#f5c542',
        'amarillo-hover': '#e0b23a',
        'amarillo-light': '#fdf0c8',
        borde: '#d8dce6',
        'borde-dark': '#b8c0d0',
        card: '#ffffff',
        muted: '#5e6577',
        'muted-light': '#8d94a5',
        danger: '#c0392b',
        success: '#27ae60',
        // Keep naranja as alias for backward compat during transition
        naranja: '#3d5a80',
        'naranja-hover': '#2c4460',
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 20px rgba(61, 90, 128, 0.06)',
        'card-hover': '0 6px 32px rgba(61, 90, 128, 0.10)',
        glow: '0 0 24px rgba(245, 197, 66, 0.15)',
        'glow-denim': '0 0 24px rgba(61, 90, 128, 0.12)',
        'button': '0 2px 8px rgba(61, 90, 128, 0.15)',
        'button-hover': '0 4px 16px rgba(61, 90, 128, 0.20)',
      },
    },
  },
  plugins: [],
};
export default config;
