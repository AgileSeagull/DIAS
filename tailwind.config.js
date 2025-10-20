/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earthquake: '#EF4444',
        flood: '#3B82F6',
        fire: '#F97316',
        cyclone: '#8B5CF6',
      },
    },
  },
  plugins: [],
}

