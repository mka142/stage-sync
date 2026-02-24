/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Cormorant Garamond'", "serif"], // Making this the default for body text
      },
      animation: {
        "in": "fadeIn 0.25s ease-out",
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-in-from-bottom": "slideInFromBottom 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        cream: "var(--cream)",
      },
    },
  },
  plugins: [],
};