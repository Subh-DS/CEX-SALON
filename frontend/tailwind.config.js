/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep plum / aubergine — primary brand color
        primary: { DEFAULT: "#3b2038", light: "#b86f78", dark: "#2a1627" },
        plum: { DEFAULT: "#3b2038", deep: "#2a1627" },
        // Muted rose — secondary
        secondary: "#b86f78",
        rose: "#b86f78",
        // Soft coral — micro-accents, selections wash
        marigold: { DEFAULT: "#d96b4a", deep: "#b6492f", soft: "#f9e7de" },
        coral: "#d96b4a",
        ivory: "#faf7f2",
        surfacewarm: "#f6f0e9",
        bone: "#f3ece0",
        ink: "#211d20",
        mutedbrown: "#756c70",
        warmborder: "#e7dfda",
        leafgreen: "#477a63",
        amberbrown: "#b6492f",
        maroon: "#3b2038",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        accent: ['"DM Sans"', "system-ui", "sans-serif"],
        devanagari: ['"Tiro Devanagari Sans"', '"Playfair Display"', "serif"],
      },
      borderRadius: { sm2: "6px", md2: "12px", lg2: "20px" },
      boxShadow: {
        sm2: "0 1px 2px rgba(33,29,32,0.06)",
        md2: "0 4px 16px rgba(33,29,32,0.08)",
        lg2: "0 12px 40px rgba(33,29,32,0.14)",
      },
    },
  },
  plugins: [],
};
