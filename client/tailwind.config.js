/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        blue: '#4facfe',
        cyan: '#00f2fe',
        accent: '#00f2fe',
        emerald: '#43e97b',
        amber: '#f59e0b',
        rose: '#f5576c',
        pink: '#f093fb',
        violet: '#764ba2',
        surface: { 1: '#050508', 2: '#0a0a12', 3: '#10101c', 4: '#181828' },
        border: { subtle: 'rgba(102,126,234,0.1)', medium: 'rgba(102,126,234,0.2)' }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        'glow': '0 0 20px rgba(102,126,234,0.2)',
        'glow-lg': '0 12px 40px rgba(102,126,234,0.25)',
        'glow-xl': '0 20px 60px rgba(102,126,234,0.3)',
        'neon': '0 0 5px rgba(102,126,234,0.3), 0 0 20px rgba(102,126,234,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      }
    }
  },
  plugins: []
}
