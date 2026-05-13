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
        // KuryenteKo brand colors (from brandboard.png)
        brand: {
          navy:    '#1C2B3A',   // primary dark — headers, cards, CTA buttons
          navyDark:'#162330',   // deeper navy variant
          yellow:  '#F5C518',   // primary accent — KuryenteKo yellow
          yellowDk:'#D4A800',   // pressed/darker yellow
          cream:   '#F8F8F8',   // off-white page background
          // kept for backwards compat:
          orange:  '#F5C518',
          dark:    '#1C2B3A',
        },
        // Semantic status colors
        verdict: {
          green:   '#22C55E',
          yellow:  '#EAB308',
          red:     '#EF4444',
        },
        // Community stat card backgrounds (from dashboard mockup)
        stat: {
          greenBg: '#D4EDDA',
          redBg:   '#FFD6D6',
          pinkBg:  '#FADADD',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
