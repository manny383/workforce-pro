/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004354",
        "primary-container": "#005c72",

        surface: "#f9f9f9",
        "surface-bright": "#f9f9f9",
        "surface-dim": "#d9dada",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f3",
        "surface-container": "#edeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e3e2",

        "on-surface": "#1a1c1c",
        "on-surface-variant": "#3f484c",

        outline: "#70787d",
        "outline-variant": "#bfc8cc",

        error: "#ba1a1a",
        "error-container": "#ffdad6",

        tertiary: "#004545",
        "tertiary-container": "#005e5e",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
};