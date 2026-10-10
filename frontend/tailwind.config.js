/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFD700', // primary
          50: '#FFFCE8', 100: '#FFF6BF', 200: '#FFEE8C', 300: '#FFE35C',
          400: '#FFD700', 500: '#E6C200', 600: '#B89A00', 700: '#8A7300',
        },
        ink: '#1C1A12',
        paper: '#FFFDF5',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.4)' }, '100%': { transform: 'scale(1)' } },
        dot: { '0%,80%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-4px)' } },
        rise: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        pop: 'pop 0.35s ease-out',
        dot: 'dot 1s infinite ease-in-out',
        rise: 'rise 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
