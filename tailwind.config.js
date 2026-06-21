// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita el cambio de modo oscuro usando una clase en el HTML
  theme: {
    extend: {},
  },
  plugins: [],
}