import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Premium luxury color palette
        luxury: {
          cream: "#FAF8F5",
          beige: "#F5F0EB",
          tan: "#D4C5B9",
          gold: "#C9A86A",
          copper: "#B8956A",
          ink: "#1A1714",
          charcoal: "#3C3C3C",
          taupe: "#8B8680",
        },
        kibana: {
          tan: "#C9A77B",
          camel: "#B98E5A",
          cream: "#EFE8DE",
          ink: "#1A1A1A",
          stone: "#EFEAE3",
          olive: "#3C4A2C",
          brown: "#462F1E",
          tile: "#F3F3EF",
          sale: "#C0392B",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-jost)", "system-ui", "sans-serif"],
        playfair: ["var(--font-jost)", "system-ui", "sans-serif"],
        serif: ["var(--font-jost)", "system-ui", "sans-serif"],
        jost: ["var(--font-jost)", "system-ui", "sans-serif"],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        marquee: "marquee 18s linear infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        fadeUp: "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        kenburns: "kenburns 7s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
