/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: 'var(--bg-900)',
          800: 'var(--bg-800)',
          700: 'var(--bg-700)',
          600: 'var(--bg-600)',
          500: 'var(--bg-500)',
        },
        gray: {
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
        },
        white: 'var(--color-white)',
        accent: {
          neon: '#00d4ff',
          pink: '#ff4d8d',
          purple: '#8b5cf6',
          green: '#00ffa3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(90deg, #ff4d8d, #8b5cf6, #00d4ff, #00ffa3)',
      }
    },
  },
  plugins: [],
}
