"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * The two brand seals, fixed bottom-right for the whole page. Decorative, so
 * hidden from assistive tech and transparent to pointer events.
 *
 * They invert to white wherever they sit over something dark. Rather than
 * hardcoding which sections are dark — which breaks for the lifestyle cards
 * (photo left or right depending on the card) and the pinned plates (cream
 * until they expand) — we hit-test whatever is actually under the seals and
 * look for a [data-dark] ancestor. Correct mid-animation too.
 *
 * On phones the copy runs the full width, so the same hit-test also checks
 * whether the seals would sit on top of text; if so they fade out until the
 * copy has scrolled past.
 */
const TEXT = "p, h1, h2, h3, h4, dt, dd, li, a, button, label, input, select, address";
export default function FloatingSeals() {
  const ref = useRef<HTMLDivElement>(null);
  const [onDark, setOnDark] = useState(false);
  const [overText, setOverText] = useState(false);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const phone = window.matchMedia("(max-width: 767px)");

    // Each hit-test forces a layout, and there are up to five of them; once
    // per scroll frame was a steady tax on every scroll on a phone. The
    // swap is a 400ms transition anyway, so a check every 120ms is plenty.
    const INTERVAL = 120;

    const check = () => {
      frame = 0;
      last = performance.now();
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = Math.round(r.left + r.width / 2);
      const cy = Math.round(r.top + r.height / 2);
      const hit = document.elementFromPoint(cx, cy);
      setOnDark(!!hit?.closest("[data-dark]"));

      if (!phone.matches) {
        setOverText(false);
        return;
      }
      const points: [number, number][] = [
        [r.left + 2, r.top + 2],
        [cx, cy],
        [r.left + 2, r.bottom - 2],
        [r.right - 2, r.bottom - 2],
      ];
      setOverText(
        points.some(([x, y]) => {
          const e = document.elementFromPoint(Math.round(x), Math.round(y));
          return !!e?.closest(TEXT) && !e.closest("nav");
        }),
      );
    };

    let timer = 0;
    const onScroll = () => {
      if (frame || timer) return;
      const wait = INTERVAL - (performance.now() - last);
      if (wait <= 0) frame = requestAnimationFrame(check);
      else
        timer = window.setTimeout(() => {
          timer = 0;
          frame = requestAnimationFrame(check);
        }, wait);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-fixed-layer
      className={`pointer-events-none fixed right-[14px] bottom-[14px] z-500
                  transition-opacity duration-500
                  md:right-[clamp(16px,2.4vw,40px)] md:bottom-[clamp(16px,3vh,40px)]
                  ${overText ? "opacity-0" : "opacity-85"}`}
    >
      <Image
        src="/images/seals-stacked.png"
        alt=""
        width={77}
        height={164}
        loading="lazy"
        className={`block h-auto w-[34px] transition-[filter] duration-400
                    md:w-[clamp(40px,3.4vw,54px)]
                    ${onDark ? "brightness-0 invert" : ""}`}
      />
    </div>
  );
}
