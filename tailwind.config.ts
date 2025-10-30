import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        'dark-gold': '#B8860B',
        bronze: '#CD7F32',
        stone: '#2C2416',
        'dark-stone': '#1A1410',
        'temple-gray': '#3E3832',
        'blood-red': '#8B0000',
        jade: '#00A86B',
      },
      fontFamily: {
        ancient: ['Cinzel', 'serif'],
        body: ['Philosopher', 'sans-serif'],
      },
      keyframes: {
        'eld-shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '10%,30%,50%,70%,90%': { transform: 'translateX(-5px)' },
          '20%,40%,60%,80%': { transform: 'translateX(5px)' },
        },
        'eld-lightning': {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
          '25%': { opacity: '0.2' },
          '35%': { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'eld-shake': 'eld-shake 0.6s linear 3',
        'eld-lightning': 'eld-lightning 0.35s linear 1',
      }
    },
  },
  plugins: [],
}
export default config
