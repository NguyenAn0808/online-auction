/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ebay: {
          DEFAULT: "#0064d2",
          dark: "#0052a3",
          accent: "#f5b400",
        },
      },
      borderRadius: {
        "eb-lg": "0.75rem",
      },
      boxShadow: {
        "eb-sm": "0 1px 2px rgba(16, 24, 40, 0.04)",
        "eb-md": "0 4px 8px rgba(16, 24, 40, 0.06)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
        ],
      },
    },
  },
  plugins: [],
};
