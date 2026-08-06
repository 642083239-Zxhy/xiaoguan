/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#00d4ff',
        accent: '#f000ff',
        dragon: {
          dark: '#08090f',
          card: '#0f111c',
          surface: '#151827',
          border: '#292d43',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0,212,255,.28), 0 0 32px rgba(0,212,255,.12)',
        'neon-purple': '0 0 10px rgba(168,85,247,.28), 0 0 32px rgba(168,85,247,.12)',
      },
    },
  },
  plugins: [],
}
