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
  const root = document.documentElement;
  // Measured first of all — while the scrollbar is still there, before either
  // Lenis's own `lenis-stopped` or our `scroll-locked` hides it: the width the
  // lock is about to reclaim. `globals.css` hands it back so nothing — page or
  // fixed layer — moves sideways. Zero with overlay scrollbars.
  if (locks === 1) {
    const gutter = window.innerWidth - root.clientWidth;
    root.style.setProperty("--scrollbar-gutter", `${gutter}px`);
  }
  instance?.stop();
  root.classList.add("scroll-locked");
};

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  instance?.start();
  const root = document.documentElement;
  root.classList.remove("scroll-locked");
  root.style.removeProperty("--scrollbar-gutter");
};

/**
 * Smoothly scroll to an in-page target. Falls back to native scrolling when
 * Lenis isn't running (reduced motion). Exempt from the site's scroll-speed
 * cap so a menu link never takes ten seconds to reach the footer.
 */
/**
 * The header is fixed, so landing a section flush at the top of the viewport
 * tucks its first line underneath. Sections used to hide this behind generous
 * top padding; now that the padding is set for rhythm instead, the clearance
 * is measured from the header itself and taken off the target.
 */
const headerOffset = () => {
  const nav = document.querySelector<HTMLElement>("nav");
  const height = nav?.getBoundingClientRect().height ?? 0;
  return height + 12;
};

export const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (instance) {
    navigating = true;
    // A number, not the element with an `offset`: Lenis's own offset option
    // left the instance in its scrolling state without ever moving the page.
    const top =
      target.getBoundingClientRect().top + instance.animatedScroll - headerOffset();
    instance.scrollTo(Math.max(0, top), {
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      onComplete: () => {
        navigating = false;
      },
    });
  } else {
    const top =
      target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top, behavior: "smooth" });
  }
};
