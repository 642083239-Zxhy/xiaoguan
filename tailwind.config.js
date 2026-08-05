/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 雷龙赛博朋克主题色
        primary: {
          DEFAULT: '#00D4FF',
          glow: '#00D4FF80',
        },
        secondary: {
          DEFAULT: '#C084FC',
          glow: '#C084FC80',
        },
        accent: {
          DEFAULT: '#FF00FF',
          glow: '#FF00FF80',
        },
        cyan: {
          neon: '#00F5FF',
          electric: '#00D4FF',
        },
        magenta: {
          neon: '#FF00E5',
          soft: '#C084FC',
        },
        dragon: {
          dark: '#0A0A0F',
          deeper: '#050508',
          card: '#0F1018',
          surface: '#12131C',
          border: '#1E2030',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 8px #00D4FF40, 0 0 24px #00D4FF20',
        'neon-magenta': '0 0 8px #C084FC40, 0 0 24px #C084FC20',
        'neon-accent': '0 0 8px #FF00FF40, 0 0 24px #FF00FF20',
        'neon-glow': '0 0 12px #00D4FF60, 0 0 40px #C084FC30',
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px #00D4FF40' },
          '50%': { boxShadow: '0 0 20px #00D4FF80, 0 0 40px #C084FC40' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
