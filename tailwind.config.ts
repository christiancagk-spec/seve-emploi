import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#E6F4EC",
          100: "#C3E4CF",
          200: "#9DD3B1",
          300: "#6CBF8E",
          400: "#3EAA6D",
          500: "#1E7A45",
          600: "#186639",
          700: "#12512D",
          800: "#0D3D22",
          900: "#0D3321",
          950: "#071A10",
        },
      },
      fontFamily: {
        sans:    ['var(--font-jakarta)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
      boxShadow: {
        card:       "0 1px 4px rgba(13,51,33,.07), 0 4px 16px rgba(13,51,33,.06)",
        "card-hover": "0 4px 12px rgba(13,51,33,.10), 0 8px 28px rgba(13,51,33,.09)",
      },
    },
  },
  plugins: [],
};

export default config;
