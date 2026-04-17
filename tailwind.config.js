/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./assets/css/global.css",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        miro: {
          black: "#1c1c1e",
          white: "#ffffff",
          bg: "#ffffff",
          "near-black": "#1c1c1e",
        },
        primary: {
          blue: "#5b76fe",
          "blue-dark": "#2a41b6",
          "blue-light": "#7c92fe",
        },
        accent: {
          coral: "#ffc6c6",
          "coral-dark": "#600000",
          teal: "#c3faf5",
          "teal-dark": "#187574",
          yellow: "#ffe6cd",
          "yellow-dark": "#746019",
          moss: "#a8e6cf",
          "moss-dark": "#187574",
          rose: "#ffd8f4",
        },
        dark: {
          bg: "#09090b",
          surface: "#18181b",
          border: "#27272a",
          text: "#fafafa",
          "text-muted": "#a1a1aa",
        },
        semantic: {
          success: "#00b473",
          error: "#e3c5c5",
        },
        neutral: {
          slate: "#555a6a",
          placeholder: "#a5a8b5",
          border: "#c7cad5",
          "border-light": "#e9eaef",
          ring: "rgb(224,226,232)",
        },
      },
      fontFamily: {
        display: ["Roobert PRO", "system-ui", "sans-serif"],
        body: ["Noto Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "20px",
        "2xl": "24px",
        full: "50px",
      },
      boxShadow: {
        ring: "rgb(224,226,232) 0px 0px 0px 1px",
      },
    },
  },
  plugins: [],
};