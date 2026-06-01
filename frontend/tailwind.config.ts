import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCF8',
          100: '#F8F5EE',
          200: '#F0EBE0',
          300: '#E3DAC9',
        },
        navy: {
          900: '#0D1B2A',
          800: '#1B2D42',
          700: '#243B55',
          600: '#2E5077',
          500: '#3A6FA8',
        },
        ocean: {
          500: '#1A7FA8',
          400: '#2E9DC7',
          300: '#56B8D8',
          100: '#E0F4FB',
        },
        ember: {
          500: '#D4622A',
          400: '#E07A48',
          100: '#FAE8DF',
        },
        emerald: {
          600: '#1A7A5E',
          500: '#22A07A',
          100: '#D6F5EC',
        },
        gold: {
          400: '#C9A84C',
          100: '#F5EDD3',
        },
      },
      boxShadow: {
        soft: '0 12px 40px rgba(13, 27, 42, 0.12), 0 4px 12px rgba(13, 27, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
