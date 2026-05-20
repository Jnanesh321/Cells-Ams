/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          bg: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
          card: '#FFFFFF',
          input: '#F1F5F9',
          border: '#E2E8F0',
        },
        // Dark theme colors
        dark: {
          bg: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155',
          card: '#1E293B',
          input: '#334155',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
};

