/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#10B981',
          light:   '#34d399',
          dark:    '#059669',
          muted:   'rgba(16,185,129,0.12)',
          border:  'rgba(16,185,129,0.25)',
          glow:    'rgba(16,185,129,0.15)',
        },
        ink: {
          950: '#000000',
          900: '#0a0a0a',
          800: '#111111',
          700: '#171717',
          600: '#1a1a1a',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
          200: '#444444',
          100: '#525252',
        },
        frost: {
          100: '#ffffff',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
