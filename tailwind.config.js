/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          yellow: '#FACC15',
          dark: '#1C1917',
        },
        verdict: {
          green: '#22C55E',
          yellow: '#EAB308',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
