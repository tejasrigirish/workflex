/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#151D2D',
          hover: '#1B263B',
          border: '#1F293D',
          borderLight: '#2A364F',
          muted: '#8E9BAE',
          text: '#F1F5F9',
        },
        pastel: {
          mint: '#6EE7B7',     // soft emerald/mint
          mintDark: '#059669',
          lavender: '#C4B5FD', // soft lavender
          lavenderDark: '#7C3AED',
          blue: '#93C5FD',     // dusty blue
          blueDark: '#2563EB',
          peach: '#FCD34D',    // muted peach/amber
          peachDark: '#D97706',
          pink: '#F9A8D4',     // soft blush pink
          pinkDark: '#DB2777',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        card: '0 8px 30px rgba(0, 0, 0, 0.35)',
        highlight: '0 0 25px -5px rgba(147, 197, 253, 0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
