"use client";

import { useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { jumpTo } from "@/lib/scroller";
import { reducedMotion } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/**
 * The entrance — a faithful rebuild of the production site's preloader.
 *
 * Two organic blobs sit stacked on cream. Each cycles through four frames
 * (brand seal → sea → sea → its half of the hero pair), then the pair bursts
 * outward while a circular iris opens from the centre of the screen and
 * reveals the page underneath. Timings were measured off the live site:
 *
 *   0.00s  seals                     2.60s  burst + iris (1.3s, CSS `ease`)
 *   0.45s  shells / fish             4.30s  overlay fades (0.8s)
 *   1.10s  sailboat / beach          5.20s  unmount
 *   1.65s  hero-c1 / hero-c2
 *
 * Scrolling is locked for the duration. Reduced-motion skips it entirely.
 */
const TOP = [
  "/images/seal-arabic-dark.png",
  "/images/s9-shells.jpg",
  "/images/s9-sailboat.jpg",
  "/images/hero-c1.png",
].map(asset);
const BOTTOM = [
  "/images/seal-compass-dark.png",
  "/images/s9-fish.jpg",
  "/images/beach-aerial.jpg",
  "/images/hero-c2.png",
].map(asset);

const FRAME_AT = [0, 450, 1100, 1650];
const BURST_AT = 2600;
const IRIS_MS = 1300;
const HIDE_AT = 4300;
const DONE_AT = 5200;

/** Cubic-bezier solver — the iris follows CSS `ease` (0.25, 0.1, 0.25, 1). */
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const s = sampleX(t);
      if (Math.abs(s - x) < 1e-6) return t;
      if (x > s) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}
const cssEase = cubicBezier(0.25, 0.1, 0.25, 1);

type Phase = "run" | "burst" | "hidden" | "done";

function Blob({
  frames,
  active,
  burst,
  scale,
  radius,
  bobDelay,
  className = "",
}: {
  frames: string[];
  active: number;
  burst: boolean;
  scale: number;
  radius: string;
  bobDelay: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[clamp(64px,6vw,90px)] w-[clamp(64px,6vw,90px)] overflow-hidden
                  ${burst ? "" : "pre-bob"} ${className}`}
      style={{
        borderRadius: radius,
        animationDelay: bobDelay,
        ...(burst
          ? {
              animation: "none",
              transform: `scale(${scale})`,
              opacity: 0,
              transition:
                "transform 1.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease 0.45s",
            }
          : {}),
      }}
    >
      {frames.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          className={`absolute inset-0 h-full w-full transition-opacity duration-[550ms] ease-[ease]
                      ${i === active ? "opacity-100" : "opacity-0"}
                      ${i === 0 ? "object-contain p-[10%]" : "object-cover"}`}
        />
      ))}
    </div>
  );
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState<Phase>("run");

  useEffect(() => {
    if (reducedMotion()) {
      // Defer so the first render settles before the overlay is dropped.
      const t = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("preloader:burst"));
        setPhase("done");
      }, 0);
      return () => clearTimeout(t);
    }

    // Always open at the top so the iris lands on the hero.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    jumpTo(0);
    lockScroll();

    const timers: number[] = [];
    let raf = 0;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      FRAME_AT.slice(1).forEach((ms, i) =>
        timers.push(window.setTimeout(() => setFrame(i + 1), ms)),
      );

      timers.push(
        window.setTimeout(() => {
          setPhase("burst");
          window.dispatchEvent(new CustomEvent("preloader:burst"));
          const el = root.current;
          if (!el) return;
          // Radius that clears every corner, plus the same margin the original leaves.
          const R = Math.hypot(innerWidth / 2, innerHeight / 2) + 60;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / IRIS_MS);
            const r = R * cssEase(t);
            const mask = `radial-gradient(circle, transparent ${r.toFixed(1)}px, #000 ${(r + 0.5).toFixed(1)}px)`;
            el.style.setProperty("-webkit-mask-image", mask);
            el.style.setProperty("mask-image", mask);
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, BURST_AT),
      );

      timers.push(window.setTimeout(() => setPhase("hidden"), HIDE_AT));
      timers.push(
        window.setTimeout(() => {
          unlockScroll();
          setPhase("done");
        }, DONE_AT),
      );
    };

    // Give the eight frames a moment to decode so no cross-fade lands on a blank blob.
    const imgs = Array.from(root.current?.querySelectorAll("img") ?? []);
    const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    const grace = new Promise((r) => setTimeout(r, 1500));
    Promise.race([decoded, grace]).then(run);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      unlockScroll();
    };
  }, []);

  if (phase === "done") return null;

  const burst = phase !== "run";

  return (
    <div
      ref={root}
      aria-hidden
      data-fixed-layer
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-cream
                  transition-[opacity,visibility] duration-800 ease-out
                  ${phase === "hidden" ? "pointer-events-none invisible opacity-0" : ""}`}
    >
      <div className="relative flex flex-col items-center">
        <Blob
          frames={TOP}
          active={frame}
          burst={burst}
          scale={2.1}
          radius="60% 40% 55% 45% / 45% 55% 40% 60%"
          bobDelay="0s"
          className="z-2"
        />
        <Blob
          frames={BOTTOM}
          active={frame}
          burst={burst}
          scale={2.4}
          radius="45% 55% 48% 52% / 55% 45% 55% 45%"
          bobDelay="-2.5s"
          className="mt-[clamp(18px,2vw,30px)]"
        />
      </div>
    </div>
  );
}
