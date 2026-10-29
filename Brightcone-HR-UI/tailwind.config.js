/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#0b1a38',
          950: '#060b18',
        },
        obsidian: {
          800: '#0f172a',
          900: '#0c1527',
          950: '#060b18',
          void: '#020611',
        }
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.45)',
        'glow-blue': '0 0 25px -4px rgba(37, 99, 235, 0.5)',
      }
    },
  },
  plugins: [],
}
