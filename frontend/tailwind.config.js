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
        brand: {
          50: '#f0f4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#8faeff',
          400: '#5a80ff',
          500: '#3658ff',
          600: '#1e38f5',
          700: '#1528e1',
          800: '#1822b6',
          900: '#1a228f',
          950: '#131657',
        },
        surface: {
          DEFAULT: '#fafbfc',
          dark: '#0a0a0f',
        },
        gold: {
          400: '#e8c547',
          500: '#d4a843',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(54, 88, 255, 0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
