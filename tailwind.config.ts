import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/hooks/**/*.{ts,tsx,js,jsx}",
    "./src/data/**/*.{ts,js}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8b5cf6",
          blue: "#38bdf8",
          green: "#34d399",
        },
      },
      boxShadow: {
        glass: "0 20px 45px rgba(15,23,42,0.15)",
      },
    },
  },
  plugins: [forms, typography, animate],
};

export default config;

