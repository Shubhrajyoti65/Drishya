/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        crimson: '#C1121F',
        redAccent: '#E63946',
        royalBlue: '#0D5EF4',
        blueAccent: '#2563EB',
        highlightBlue: '#3B82F6',
        darkBg: '#0D0D0D',
        darkSurface: '#171717',
        darkCard: '#1E1E1E',
        communityDarkBg: '#0B0F17',
        communityDarkSurface: '#161B22',
        communityDarkCard: '#1F2937',
        neu: {
          bg: 'var(--neu-bg)',
          surface: 'var(--neu-surface)',
          hover: 'var(--neu-surface-hover)',
          active: 'var(--neu-surface-active)',
          text: 'var(--neu-text-primary)',
          'text-secondary': 'var(--neu-text-secondary)',
          'text-muted': 'var(--neu-text-muted)',
          border: 'var(--neu-border-faint)',
        }
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        'premium-hover': '0 30px 60px -20px rgba(0, 0, 0, 0.12)',
        'glow-red': '0 0 30px -5px rgba(193, 18, 31, 0.3)',
        'glow-blue': '0 0 30px -5px rgba(13, 94, 244, 0.3)',
        'glow-ai': '0 0 40px -5px rgba(37, 99, 235, 0.25), 0 0 40px -5px rgba(193, 18, 31, 0.25)',
        'neu-raised-xs': 'var(--neu-raised-xs)',
        'neu-raised-sm': 'var(--neu-raised-sm)',
        'neu-raised': 'var(--neu-raised-md)',
        'neu-raised-lg': 'var(--neu-raised-lg)',
        'neu-inset-xs': 'var(--neu-inset-xs)',
        'neu-inset-sm': 'var(--neu-inset-sm)',
        'neu-inset': 'var(--neu-inset-md)',
        'neu-glow-crimson': 'var(--neu-glow-crimson)',
        'neu-glow-blue': 'var(--neu-glow-blue)',
        'neu-glow-amber': 'var(--neu-glow-amber)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '18px',
        '4xl': '24px',
      }
    },
  },
  plugins: [],
};
