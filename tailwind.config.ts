import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // neutral/surface scale – light theme
        void: {
          950: '#ffffff',   // page background (pure white)
          900: '#f8fafc',   // section background (near-white)
          800: '#f1f5f9',   // card / surface background (light slate)
          700: '#e2e8f0',   // dividers / card borders
          600: '#cbd5e1',   // medium borders
          500: '#94a3b8',   // muted elements / placeholders
        },
        // brand blue – replaces cyan
        cyber: {
          300: '#93c5fd',   // blue-300 (highlights)
          400: '#3b82f6',   // blue-500 (interactive hover)
          500: '#2563eb',   // blue-600 (primary brand)
          600: '#1d4ed8',   // blue-700 (pressed/darker)
          glow: 'rgb(37 99 235 / 0.15)',
        },
        // accent purple (softer)
        plasma: {
          300: '#e9d5ff',
          400: '#c084fc',
          500: '#9333ea',
          600: '#7e22ce',
          glow: 'rgb(147 51 234 / 0.12)',
        },
        volt: {
          400: '#34d399',   // emerald-400
          500: '#10b981',   // emerald-500
          glow: 'rgb(16 185 129 / 0.12)',
        },
        danger: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          glow: 'rgb(239 68 68 / 0.12)',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        // text scale – dark on light
        ink: {
          primary: '#0f172a',    // slate-900 (headings)
          secondary: '#475569',  // slate-600 (body)
          tertiary: '#94a3b8',   // slate-400 (captions)
          code: '#2563eb',       // brand blue for inline code
          // numeric aliases (used in auth + admin pages)
          100: '#0f172a',        // darkest – headings
          200: '#1e293b',        // dark – primary body
          300: '#334155',        // medium-dark – labels
          400: '#64748b',        // muted – secondary text
          500: '#94a3b8',        // light – captions
          600: '#cbd5e1',        // lightest – placeholders
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        cyber: '0 0 0 1px rgb(37 99 235 / 0.25), 0 4px 16px rgb(37 99 235 / 0.12)',
        plasma: '0 0 0 1px rgb(147 51 234 / 0.25), 0 4px 16px rgb(147 51 234 / 0.10)',
        card: '0 1px 3px rgb(0 0 0 / 0.07), 0 4px 12px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 12px rgb(0 0 0 / 0.10), 0 16px 32px rgb(0 0 0 / 0.08)',
        product: '0 0 0 1px #e2e8f0, 0 2px 8px rgb(0 0 0 / 0.06)',
      },
      backgroundImage: {
        'grid-cyber': "url('/patterns/grid-cyber.svg')",
        noise: "url('/patterns/noise.png')",
        'gradient-void': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)',
        'gradient-card': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
        'number-roll': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        'scan-line': 'scan-line 4s linear infinite',
        flicker: 'flicker 5s ease-in-out infinite',
        'number-roll': 'number-roll 0.3s ease-out forwards',
        'border-flow': 'border-flow 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
