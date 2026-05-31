import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dk: {
          bg: "#050505",
          red: "#FF3B5C",
          "red-dim": "#CC2D48",
          glass: "rgba(255,255,255,0.04)",
          "glass-border": "rgba(255,255,255,0.08)",
          "glass-strong": "rgba(255,255,255,0.07)",
          text: "#FFFFFF",
          muted: "#888888",
          card: "rgba(20,20,20,0.7)",
        },
      },
      animation: {
        "fade-up":   "fadeUp 0.35s ease-out",
        "fade-in":   "fadeIn 0.25s ease-out",
        "slide-left":"slideLeft 0.3s ease-out",
        "glow-pulse":"glowPulse 3s ease-in-out infinite",
        "msg-in":    "msgIn 0.25s ease-out",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity:"0", transform:"translateY(12px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        fadeIn:    { "0%": { opacity:"0" }, "100%": { opacity:"1" } },
        slideLeft: { "0%": { opacity:"0", transform:"translateX(-100%)" }, "100%": { opacity:"1", transform:"translateX(0)" } },
        glowPulse: { "0%,100%": { boxShadow:"0 0 20px rgba(255,59,92,0.2)" }, "50%": { boxShadow:"0 0 40px rgba(255,59,92,0.5)" } },
        msgIn:     { "from": { opacity:"0", transform:"translateY(8px) scale(0.97)" }, "to": { opacity:"1", transform:"translateY(0) scale(1)" } },
      },
      backdropBlur: { "20": "20px" },
    },
  },
  plugins: [],
};
export default config;
