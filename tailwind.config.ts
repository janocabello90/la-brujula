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
        crema: '#faf7f2',
        negro: '#111111',
        naranja: '#e8920a',
        'naranja-hover': '#c97b08',
        borde: '#e5e0d8',
        card: '#ffffff',
        muted: '#6b6560',
        'muted-light': '#9e9893',
        danger: '#c0392b',
        success: '#27ae60',
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.08)',
        glow: '0 0 24px rgba(232, 146, 10, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
