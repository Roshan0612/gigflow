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
          900: '#212A31',
          800: '#2E3944',
          600: '#124E66',
          400: '#748D92',
          200: '#D3D9D4',
        },
        // Map common Tailwind tokens to the project's palette so existing classes adapt automatically
        indigo: {
          600: '#124E66',
          700: '#0f4052',
          500: '#2E3944'
        },
        slate: {
          50: '#D3D9D4',
          100: '#D3D9D4',
          200: '#D3D9D4',
          300: '#748D92',
          400: '#748D92',
          700: '#2E3944',
          800: '#2E3944',
          900: '#212A31'
        }
      },
    },
  },
  plugins: [],
}
