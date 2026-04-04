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
        // ─── Material Design 3 palette from Stitch ───
        primary: '#244267',
        'primary-container': '#3d5a80',
        'on-primary': '#ffffff',
        'on-primary-container': '#b4d1fe',

        secondary: '#765a00',
        'secondary-container': '#ffce4b',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#735800',

        tertiary: '#1d436a',
        'tertiary-container': '#375b83',

        surface: '#fbf9f5',
        'surface-bright': '#fbf9f5',
        'surface-dim': '#dbdad6',
        'surface-container': '#efeeea',
        'surface-container-low': '#f5f3ef',
        'surface-container-high': '#eae8e4',
        'surface-container-highest': '#e4e2de',
        'surface-container-lowest': '#ffffff',
        'surface-variant': '#e4e2de',
        'surface-tint': '#436086',

        'on-surface': '#1b1c1a',
        'on-surface-variant': '#43474e',
        'on-background': '#1b1c1a',

        outline: '#73777f',
        'outline-variant': '#c3c6cf',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        'inverse-surface': '#30312e',
        'inverse-on-surface': '#f2f0ed',
        'inverse-primary': '#abc8f4',

        // ─── Semantic aliases (keeping backward compat) ───
        crema: '#fbf9f5',
        'crema-dark': '#efeeea',
        negro: '#1b1c1a',
        denim: '#3d5a80',
        'denim-dark': '#244267',
        'denim-light': '#5b7ea8',
        amarillo: '#f5c542',
        'amarillo-hover': '#e0b23a',
        'amarillo-light': '#fdf0c8',
        borde: '#c3c6cf',
        'borde-dark': '#73777f',
        card: '#ffffff',
        muted: '#43474e',
        'muted-light': '#73777f',
        danger: '#ba1a1a',
        success: '#27ae60',

        // Backward compat aliases
        naranja: '#3d5a80',
        'naranja-hover': '#244267',
      },
      fontFamily: {
        headline: ['Bricolage Grotesque', 'Epilogue', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'Epilogue', 'sans-serif'],
        body: ['DM Sans', 'Plus Jakarta Sans', 'sans-serif'],
        label: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        xl: '16px',
      },
      boxShadow: {
        // Signature soft shadow — blue-tinted, from DESIGN.md
        card: '0 2px 20px rgba(36, 66, 103, 0.06)',
        'card-hover': '0 6px 32px rgba(36, 66, 103, 0.10)',
        signature: '0 2px 20px rgba(36, 66, 103, 0.06)',
        glow: '0 0 24px rgba(245, 197, 66, 0.15)',
        'glow-denim': '0 0 24px rgba(36, 66, 103, 0.12)',
        button: '0 2px 8px rgba(36, 66, 103, 0.15)',
        'button-hover': '0 4px 16px rgba(36, 66, 103, 0.20)',
      },
    },
  },
  plugins: [],
};
export default config;
