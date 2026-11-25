/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#E53935', // Secondary Red
          600: '#D32F2F',
          700: '#C62828', // Primary Red
          800: '#B71C1C',
          900: '#8E0000',
        },
        surface: {
          bg: '#F8F8F8',
          card: '#FFFFFF',
          border: '#EEEEEE',
        },
        ink: {
          dark: '#222222',
          grey: '#777777',
          light: '#A0A0A0',
        },
        accent: {
          success: '#2E7D32',
          warning: '#F57C00',
          info: '#1976D2',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 30px -4px rgba(198, 40, 40, 0.12)',
        'elevated': '0 20px 40px -6px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
