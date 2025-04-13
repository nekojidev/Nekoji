/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Simple theme colors to avoid complex HSL calculations that might cause errors
        primary: "#0ea5e9",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#ffffff",
        foreground: "#0f172a",
      }
    },
  },
  plugins: [],
}