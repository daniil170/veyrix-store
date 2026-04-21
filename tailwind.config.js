/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'veyrix-bg': '#FFFFFF',
        'veyrix-text': '#000000',
        'veyrix-gray': '#4A4A4A',
      },
      letterSpacing: {
        'very-wide': '0.4em',
      }
    },
  },
  plugins: [],
}