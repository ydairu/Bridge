/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          light: '#0F1F3D',
          card: '#0D1B35',
        },
        blue: {
          primary: '#1A6FD4',
          accent: '#4A9EF5',
        },
      },
    },
  },
  plugins: [],
}
