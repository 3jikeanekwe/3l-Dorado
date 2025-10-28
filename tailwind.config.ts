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
        gold: '#FFD700',
        'dark-gold': '#B8860B',
        bronze: '#CD7F32',
        stone: '#2C2416',
        'dark-stone': '#1A1410',
        'temple-gray': '#3E3832',
        'blood-red': '#8B0000',
      },
      fontFamily: {
        ancient: ['Cinzel', 'serif'],
        body: ['Philosopher', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
