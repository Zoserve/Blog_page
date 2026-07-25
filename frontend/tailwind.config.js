/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // ZoServe blue theme
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#0F172A', // Navy/Dark secondary
          hover: '#1E293B',
          dark: '#020617',
          light: '#334155',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.02)',
        'premium-lg': '0 10px 50px -12px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 40px rgba(15, 23, 42, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.03)',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      }
    },
  },
  plugins: [],
}
