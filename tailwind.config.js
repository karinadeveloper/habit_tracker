/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          noche: {
            fondo: '#0F1729',
            card: '#1A2438',
            acento: '#7C93C3',
          },
          salvia: {
            fondo: '#2C3A2F',
            card: '#3D4F41',
            acento: '#A3B18A',
          },
        },
      },
    },
    plugins: [],
  };