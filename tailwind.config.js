/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f1418",
        foreground: "#f0f2f5",
        card: "#141a1f",
        primary: {
          DEFAULT: "#20b2a6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1f2830",
          foreground: "#20b2a6",
        },
        muted: {
          DEFAULT: "#252e37",
          foreground: "#7a8491",
        },
        border: "#242b32",
        highlight: "#f5a623",
        surface: "#1a2329",
      },
      borderRadius: {
        lg: "0.75rem",
      }
    },
  },
  plugins: [],
}