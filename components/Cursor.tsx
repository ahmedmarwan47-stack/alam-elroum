"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/gsap";

/**
 * The production site's custom cursor: an ink dot that tracks the pointer
 * exactly, and a soft ring that trails it. Both swell over anything
 * interactive and flip to white over dark surfaces. Fine-pointer desktops
 * only — touch screens and reduced-motion users keep the native cursor.
 */
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
      const hover = !!t?.closest("a, button, [role='button'], label, summary");
      const dark =
        html.classList.contains("menu-open") || !!t?.closest("[data-dark]");
      html.dataset.cursorHover = hover ? "true" : "false";
      html.dataset.cursorDark = dark ? "true" : "false";
    };

    const onLeave = () => {
      shown = false;
      d.style.opacity = "0";
      r.style.opacity = "0";
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => (html.dataset.cursorDown = "true");
    const onUp = () => (html.dataset.cursorDown = "false");
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      delete html.dataset.cursorDown;
      document.documentElement.removeEventListener("mouseleave", onLeave);
      html.classList.remove("has-cursor");
      delete html.dataset.cursorHover;
      delete html.dataset.cursorDark;
    };
  }, []);

  return (
    <>
      <div ref={dot} aria-hidden className="site-cursor-dot" />
      <div ref={ring} aria-hidden className="site-cursor-ring" />
    </>
  );
}
