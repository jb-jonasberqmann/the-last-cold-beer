import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Game color palette
        "beer-amber": "#D4882A",
        "beer-gold": "#F5C842",
        "cold-blue": "#4A9EBF",
        "frost-white": "#E8F4F8",
        "cabin-brown": "#6B4226",
        "mystery-dark": "#1A1A2E",
        "mystery-purple": "#4A1A6B",
        "spooky-green": "#2D5A27",
        "warning-red": "#C0392B",
      },
      fontFamily: {
        game: ["Georgia", "serif"],
        mono: ["Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flicker": "flicker 2s infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
