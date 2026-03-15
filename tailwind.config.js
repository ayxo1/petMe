/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FDF8EB',
        secondary: '#8283b3',
        authPrimary: '#f5c68d',
        lighterSecondary: '#cacbe6',
      }
    },
  },
  plugins: [],
}