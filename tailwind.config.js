/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      width: {
        '30': '7.5rem',
      },
      minWidth: {
        '30': '7.5rem',
      },
      maxWidth: {
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
}

