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
        base: "#12151A",
        surface: "#1A1F27",
        "surface-raised": "#222834",
        border: {
          subtle: "#2E3542",
        },
        text: {
          primary: "#F1EFE9",
          secondary: "#9AA3B2",
          muted: "#5B6472",
        },
        signal: {
          growth: "#1F9D6F",
          "growth-soft": "#1F9D6F1A",
          gold: "#E8A33D",
          "gold-soft": "#E8A33D1A",
          danger: "#E1543A",
          "danger-soft": "#E1543A1A",
          pending: "#5B8FE0",
        },
        neon: "#00E87A",
        "neon-dim": "#00E87A1A",
        cyan: "#00f0ff",
        "cyan-dim": "rgba(0,240,255,0.08)",
        purple: "#a855f7",
        "purple-dim": "rgba(168,85,247,0.08)",
        success: "#22c55e",
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        card: "10px",
        modal: "16px",
      },
      boxShadow: {
        neon: "0 0 24px rgba(0,232,122,0.25), 0 0 48px rgba(0,232,122,0.10)",
        "neon-sm": "0 0 12px rgba(0,232,122,0.30)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
