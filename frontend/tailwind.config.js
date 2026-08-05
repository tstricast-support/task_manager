/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: {
              xs: "380px",
         },
      colors: {
        ink: {
          50: "#f2f6f5",
          100: "#dfe9e6",
          200: "#b9cdc7",
          300: "#8caea4",
          400: "#5c8a7d",
          500: "#3c6d60",
          600: "#28544a",
          700: "#20443c",
          800: "#1b3630",
          900: "#16302b",
          950: "#0c1a17",
        },
        ember: {
          50: "#fdf6ea",
          100: "#fbe9c8",
          200: "#f5cf8c",
          300: "#eeb154",
          400: "#dd9a2f",
          500: "#c9820a",
          600: "#a86608",
          700: "#844f0a",
          800: "#6c400f",
          900: "#5b3610",
        },
        secondary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
      },
        paper: "#faf8f4",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },

    },
  },
  plugins: [],
};
