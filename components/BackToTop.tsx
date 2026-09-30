"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/lib/lenis";
import { getScroller, viewportHeight } from "@/lib/scroller";

/**
 * Back to the top of the page — the gallery's round frosted arrow, turned to
 * point up, fixed bottom-left (the seals hold the bottom-right corner) and
 * kept small so it sits in the margin rather than over the copy it floats
 * past. It shows once the reader is a screen down and glides home through
 * Lenis.
 *
 * The gallery's plate is a white wash made for photographs; this one floats
 * over cream sections as well as dark ones, so the wash is tinted ink to
 * read on both. Hover fills it solid with cream, as there.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;
    const onScroll = () => setShown(scroller.scrollTop > viewportHeight() * 0.9);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      getScroller()?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      data-fixed-layer
      className={`group fixed bottom-[14px] left-[14px] z-500 flex h-8 w-8 items-center justify-center
                  rounded-full border border-white/50 bg-ink/35 text-white
                  shadow-[0_2px_14px_rgba(0,0,0,0.2)] backdrop-blur-md
                  transition-[background-color,border-color,color,opacity,translate] duration-400
                  hover:border-cream hover:bg-cream hover:text-ink
                  md:bottom-[clamp(16px,3vh,40px)] md:left-[clamp(16px,2.4vw,40px)] md:h-9 md:w-9
                  ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                   group-hover:-translate-y-0.5 md:h-5 md:w-5"
      >
        <path
          d="M6 15C6 15 10.4189 9.00001 12 9C13.5812 8.99999 18 15 18 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
