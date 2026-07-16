import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gray-850': '#1a1f2e',
        'gray-950': '#0a0d14',
        // New neon palette
        neon: '#C8FF00',
        'neon-dim': '#8FAD00',
        plasma: '#FF2D78',
        volt: '#00E5FF',
        void: '#06000F',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(40px)' },
          '50%': { opacity: '1', filter: 'blur(60px)' },
        },
        'border-spin': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'border-spin': 'border-spin 4s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
