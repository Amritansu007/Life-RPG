/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: 'var(--color-abyss, #160f23)',
        void: 'var(--color-void, #1a1025)',
        'void-light': '#231733',
        violet: {
          deep: '#2d1f4e',
          DEFAULT: 'var(--color-violet, #4c3a6e)',
          muted: '#6b5a8e',
        },
        gold: {
          dim: 'var(--color-gold-dim, #b8962e)',
          DEFAULT: 'var(--color-gold, #d4af37)',
          bright: '#f0d060',
        },
        parchment: 'var(--color-parchment, #e8dcc8)',
        bone: '#c9bfae',
        crimson: '#c0392b',
        'crimson-dark': '#922b21',
        emerald: '#27ae60',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
      boxShadow: {
        'inner-glow': 'inset 0 1px 12px 0 rgba(76, 58, 110, 0.25)',
        'gold-glow': '0 0 12px 2px rgba(212, 175, 55, 0.3)',
        'gold-sm': '0 0 6px 1px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
