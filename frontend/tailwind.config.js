/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rail: {
          navy:    '#1a3a6b',
          blue:    '#2563eb',
          saffron: '#f97316',
          gold:    '#f59e0b',
          green:   '#16a34a',
          light:   '#e8f0fe',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
