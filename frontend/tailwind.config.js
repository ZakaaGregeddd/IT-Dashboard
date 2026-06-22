/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          900: '#0f2e60', // Sidebar background & primary charts
          800: '#153b75', // Sidebar active
          700: '#1d4ed8',
          50: '#eff6ff',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b', // Realization charts
        },
        success: '#10b981',
        info: '#3b82f6',
        danger: '#ef4444'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
