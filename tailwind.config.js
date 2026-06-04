/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // App 用到的中間色階（標準 Tailwind 沒有，補上避免顏色失效）
        zinc: {
          105: '#f1f1f2',
          150: '#ececee',
          250: '#dcdce0',
          350: '#b8b8bf',
          450: '#8f8f99',
          505: '#75757f',
          550: '#5f5f68',
          650: '#4b4b52',
          850: '#202024',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
