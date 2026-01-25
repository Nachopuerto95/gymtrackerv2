/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0E12',
          secondary: '#12161C',
          tertiary: '#1A1F27',
        },
        primary: {
          main: '#00D9FF',
          light: '#4DE5FF',
          dark: '#00A8CC',
        },
        success: {
          main: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        error: {
          main: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0AEC0',
          tertiary: '#718096',
          inverse: '#0A0E12',
        },
        border: {
          light: 'rgba(255, 255, 255, 0.05)',
          main: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.2)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-strong': '0 0 40px rgba(0, 217, 255, 0.5)',
        'success': '0 4px 12px rgba(16, 185, 129, 0.4)',
        'success-strong': '0 6px 20px rgba(16, 185, 129, 0.5)',
      },
    },
  },
  plugins: [],
}
