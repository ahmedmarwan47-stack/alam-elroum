"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";

/**
 * The custom cursor, now confined to the gallery.
 *
 * It used to run across the whole page with a vocabulary of five states —
 * hover, link, text, drag, native — which meant every paragraph and every
 * button restyled the pointer, and the native cursor was hidden site-wide to
 * pay for it. The one state that was actually telling the reader something
 * they could not otherwise know is the gallery's: the carousel sweeps, and
 * nothing else on the page says so.
 *
 * So: over `[data-cursor="drag"]` (the coverflow) the ring opens up with two
 * chevrons rocking outward, and everywhere else the real cursor is simply
 * left alone. Fine-pointer desktops only.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 769px)",
    );
    const r = ring.current;
    if (!mq.matches || reducedMotion() || !r) return;

    const html = document.documentElement;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let on = false;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target instanceof Element ? e.target : null;
      const next = !!t?.closest("[data-cursor='drag']");
      if (next !== on) {
        on = next;
        html.dataset.cursorMode = next ? "drag" : "off";
        if (next) {
          // Arriving: start the ring on the pointer rather than sliding it in
          // from wherever it was left last time.
          rx = x;
          ry = y;
          r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
        }
        r.style.opacity = next ? "1" : "0";
      }
      if (on) {
        html.dataset.cursorDark = t?.closest("[data-dark]") ? "true" : "false";
      }
    };

    const onLeave = () => {
      on = false;
      html.dataset.cursorMode = "off";
      r.style.opacity = "0";
    };

    const loop = () => {
      // Tight follow: over the gallery the ring itself is what you are aiming,
      // so a long trail reads as lag.
      rx += (x - rx) * 0.34;
      ry += (y - ry) * 0.34;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => (html.dataset.cursorDown = "true");
    const onUp = () => (html.dataset.cursorDown = "false");
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove, { passive: true });
    html.addEventListener("mouseleave", onLeave);
    html.dataset.cursorMode = "off";
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      html.removeEventListener("mouseleave", onLeave);
      delete html.dataset.cursorDown;
      delete html.dataset.cursorMode;
      delete html.dataset.cursorDark;
    };
  }, []);

  return (
    <div ref={ring} aria-hidden className="site-cursor-ring">
      <i className="site-cursor-circle">
        <svg
          className="site-cursor-chevron"
          data-dir="l"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="site-cursor-chevron"
          data-dir="r"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"
            transform="translate(24 0) scale(-1 1)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </i>
    </div>
  );
}
