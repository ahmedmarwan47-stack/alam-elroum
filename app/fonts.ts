import localFont from "next/font/local";

/**
 * Neue Haas Grotesk Text — the sans that carries nav, headlines and labels.
 * Shipped as separate W02 weight files, so each maps to a weight here.
 */
export const haas = localFont({
  src: [
    { path: "./fonts/NHaasGrotesk-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/NHaasGrotesk-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/NHaasGrotesk-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/NHaasGrotesk-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/NHaasGrotesk-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/NHaasGrotesk-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-haas",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/** Immortel — the display serif used for body copy and the italic accents. */
export const immortel = localFont({
  src: [
    { path: "./fonts/Immortel.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Immortel-400-italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-immortel",
  display: "swap",
  fallback: ["Cormorant Garamond", "Georgia", "serif"],
});
