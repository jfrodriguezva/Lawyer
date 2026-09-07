import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#12100d",
          ink2: "#1c1810",
          gold: "#c9a24a",
          goldDeep: "#8c6b1f",
          cream: "#f3ead4",
          creamSoft: "#b7a582",
          line: "#3a3226",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        script: ["var(--font-script)"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
