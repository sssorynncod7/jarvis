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
        background: "#020617",
        foreground: "#e2e8f0",
        jarvis: {
          blue: "#38bdf8",
          cyan: "#06b6d4",
          glow: "#0ea5e9"
        }
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.12)", opacity: "0" },
          "100%": { transform: "scale(1.12)", opacity: "0" }
        },
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" }
        },
        typing: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        pulseRing: "pulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        equalizer: "equalizer 1s ease-in-out infinite",
        typing: "typing 1.4s ease-in-out infinite"
      },
      boxShadow: {
        hologram: "0 0 32px rgba(56, 189, 248, 0.45), inset 0 0 24px rgba(6, 182, 212, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
