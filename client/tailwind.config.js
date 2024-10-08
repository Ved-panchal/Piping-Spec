/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        screens: {
          sm: "100%",
          md: "100%",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
        padding: {
          DEFAULT: "1rem",
        },
      },
      colors: {
        primary: {
          DEFAULT: "#2d5356",
          100: "#cf9423",
          200: "#7b7c7d",
        },
        secondary: "#f6eee5",
        badge: "#cf9423",
      },
    },
  },
  plugins: [],
}