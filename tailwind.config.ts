import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E354E',
          light: '#3d4563',
          dark: '#1E2333',
        },
        accent: {
          DEFAULT: '#dfd300',
          light: '#e8dc33',
          dark: '#c9be00',
        },
        green: {
          DEFAULT: '#65B863',
          light: '#7dc67b',
          dark: '#4fa04d',
        },
        orange: {
          DEFAULT: '#F87D4D',
          light: '#f99670',
          dark: '#e6632f',
        },
        gray: {
          50: '#F7F9FA',
          100: '#EAEDE6',
          200: '#d1d5db',
          300: '#AFB0B3',
          400: '#9ca3af',
          500: '#676D82',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Karla', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['GT-Walsheim-Bold', 'Roboto Condensed', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
