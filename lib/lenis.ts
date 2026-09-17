import type Lenis from "lenis";

/**
 * Tiny registry so components that need to pause scrolling (the preloader,
 * the menu, the press drawer) or scroll somewhere (in-page links) can reach
 * the single Lenis instance without prop drilling.
 */
let instance: Lenis | null = null;
let locks = 0;
let navigating = false;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

/** True while an in-page link is carrying the page somewhere. */
export const isNavigating = () => navigating;

/** Reference-counted so the menu closing never unlocks a drawer that is still open. */
export const lockScroll = () => {
  locks += 1;
  instance?.stop();
  document.documentElement.classList.add("scroll-locked");
};

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  instance?.start();
  document.documentElement.classList.remove("scroll-locked");
};

/**
 * Smoothly scroll to an in-page target. Falls back to native scrolling when
 * Lenis isn't running (reduced motion). Exempt from the site's scroll-speed
 * cap so a menu link never takes ten seconds to reach the footer.
 */
export const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (instance) {
    navigating = true;
    instance.scrollTo(target, {
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => {
        navigating = false;
      },
    });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
};
