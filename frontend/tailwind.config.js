/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // PDF Design System Colors
        whisper: "#F8F6F0", // Page background
        "soft-cloud": "#F0EEE6", // Card backgrounds
        "morning-mist": "#B3BFB9", // Borders, accents
        pebble: "#938A83", // Sub-labels, hints
        "midnight-ash": "#1F1F1F", // Primary text, buttons
      },
      spacing: {
        // Design system spacing scale
        xs: "4px",
        s: "8px",
        m: "16px",
        l: "24px",
        xl: "32px",
        xxl: "48px",
      },
      fontSize: {
        // Typography sizes
        nav: ["16px", { lineHeight: "1.5" }],
        header: ["18px", { lineHeight: "1.5" }],
        "category-title": ["20px", { lineHeight: "1.5" }],
        "large-title": ["22px", { lineHeight: "1.5" }],
        "product-title": ["16px", { lineHeight: "1.5" }],
        body: ["14px", { lineHeight: "1.5" }],
        "body-lg": ["15px", { lineHeight: "1.5" }],
        label: ["12px", { lineHeight: "1.5" }],
        "label-lg": ["13px", { lineHeight: "1.5" }],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        subtle: "0 2px 6px rgba(0, 0, 0, 0.05)",
        light: "0 1px 3px rgba(0, 0, 0, 0.06)",
        card: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      maxWidth: {
        container: "1400px",
      },
    },
  },
  plugins: [],
};
