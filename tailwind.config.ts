import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#060A14",
        foreground: "#DAECFF",
        cyan: {
          glow: "#00C6FF"
        }
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.65" },
          "100%": { transform: "scale(1.6)", opacity: "0" }
        },
        equalize: {
          "0%, 100%": { transform: "scaleY(0.2)" },
          "50%": { transform: "scaleY(1)" }
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.75" }
        }
      },
      animation: {
        pulseRing: "pulseRing 1.8s ease-out infinite",
        equalize: "equalize 1.2s ease-in-out infinite",
        flicker: "flicker 2.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
