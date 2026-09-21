"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";

/**
 * The production site's custom cursor: an ink mark that tracks the pointer
 * exactly, and a soft ring that trails it. Both flip to white over dark
 * surfaces, and the pair changes shape to say what the pointer can do here:
 *
 *   default   — dot + ring
 *   hover     — both swell, over something clickable that stays on the page
 *   link      — the ring frosts over and firms up, the same treatment the
 *               gallery gets: this one actually goes somewhere
 *   text      — the dot becomes an I-beam and the ring drops away, over any
 *               run of body copy you can select
 *   drag      — the ring opens up with two chevrons inside, over the gallery,
 *               so the sweep is advertised before you try it
 *   native    — both vanish over form fields, which keep the real caret
 *
 * Fine-pointer desktops only — touch screens and reduced-motion users keep
 * the native cursor.
 */

/** Clickable, but it stays on the page: buttons, toggles, expanders. */
const CLICKABLE = "button, [role='button'], label, summary";

/** Runs of selectable copy. */
const TEXT =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd, td, th, [data-cursor='text']";

type Mode = "default" | "hover" | "link" | "text" | "drag" | "native";

/**
 * Does this link actually take you somewhere? A bare `href="#"`, or none at
 * all, is not a destination — the wordmark is a link in name only.
 */
function isDestination(a: HTMLAnchorElement) {
  const href = a.getAttribute("href");
  return !!href && href !== "#";
}

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 769px)",
    );
    const d = dot.current;
    const r = ring.current;
    if (!mq.matches || reducedMotion() || !d || !r) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let shown = false;
    let mode: Mode = "default";

    const modeFor = (t: Element | null): Mode => {
      if (!t) return "default";
      if (t.closest("input, textarea, select")) return "native";
      const anchor = t.closest<HTMLAnchorElement>("a");
      if (anchor) return isDestination(anchor) ? "link" : "hover";
      if (t.closest(CLICKABLE)) return "hover";
      if (t.closest("[data-cursor='drag']")) return "drag";
      if (t.closest(TEXT)) return "text";
      return "default";
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        d.style.opacity = "1";
        r.style.opacity = "1";
      }
      const t = e.target instanceof Element ? e.target : null;
      const next = modeFor(t);
      if (next !== mode) {
        mode = next;
        html.dataset.cursorMode = next;
      }
      const dark =
        html.classList.contains("menu-open") || !!t?.closest("[data-dark]");
      html.dataset.cursorDark = dark ? "true" : "false";
    };

    const onLeave = () => {
      shown = false;
      d.style.opacity = "0";
      r.style.opacity = "0";
    };

    const loop = () => {
      // How closely the ring follows. It snaps in text mode — an I-beam
      // dragging a ring behind it reads as lag, not as a trail — and tightens
      // over the gallery, where the dot has stepped aside and the ring itself
      // is what you are aiming.
      const k = mode === "text" ? 1 : mode === "drag" ? 0.34 : 0.18;
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => (html.dataset.cursorDown = "true");
    const onUp = () => (html.dataset.cursorDown = "false");
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    html.dataset.cursorMode = "default";
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      delete html.dataset.cursorDown;
      document.documentElement.removeEventListener("mouseleave", onLeave);
      html.classList.remove("has-cursor");
      delete html.dataset.cursorMode;
      delete html.dataset.cursorDark;
    };
  }, []);

  return (
    <>
      {/* The outer box is a fixed 88px so `translate(-50%,-50%)` always
          centres it on the pointer; the mark inside is what changes size,
          growing from its own centre rather than from a corner. */}
      <div ref={dot} aria-hidden className="site-cursor-dot">
        <i className="site-cursor-mark" />
      </div>
      <div ref={ring} aria-hidden className="site-cursor-ring">
        <i className="site-cursor-circle">
          <svg
            className="site-cursor-chevron"
            data-dir="l"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.5 4 6.5 10l6 6" />
          </svg>
          <svg
            className="site-cursor-chevron"
            data-dir="r"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.5 4l6 6-6 6" />
          </svg>
        </i>
      </div>
    </>
  );
}
