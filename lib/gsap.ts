import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

/**
 * One place to register GSAP plugins and the site's two signature curves.
 *
 * The production site animates almost everything with two cubic-beziers:
 *   - `0.16, 1, 0.3, 1`  — a long, soft ease-out used for reveals
 *   - `0.76, 0, 0.24, 1` — a symmetric ease-in-out used for panels sliding
 * Registering them as named eases lets every component reference them by
 * string and keeps the motion language consistent.
 */
gsap.registerPlugin(ScrollTrigger, CustomEase);

// On phones the address bar collapsing fires a resize; refreshing every
// pinned section for that makes them jump mid-scroll. Real orientation and
// width changes still refresh.
ScrollTrigger.config({ ignoreMobileResize: true });

if (!CustomEase.get("siteOut")) {
  CustomEase.create("siteOut", "0.16, 1, 0.3, 1");
  CustomEase.create("siteInOut", "0.76, 0, 0.24, 1");
}

export const EASE_OUT = "siteOut";
export const EASE_INOUT = "siteInOut";

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** easeInOutQuad — the curve the original uses for the scroll-driven image expands. */
export const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** easeOutQuad */
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/** easeOutCubic — the lifestyle cards slide up on this. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export { gsap, ScrollTrigger };
