"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger, clamp01, easeInOutQuad, reducedMotion } from "@/lib/gsap";
import { restingPose, type CoinPose } from "./CoinScene";

const CoinScene = dynamic(() => import("./CoinScene"), { ssr: false });

type Props = {
  /** The register-interest section the coin starts in. */
  section: RefObject<HTMLElement | null>;
  /** The card it hides behind. */
  card: RefObject<HTMLDivElement | null>;
  /** Selector of the pinned chapter where it holds centre stage. */
  hold: string;
  /**
   * Selector of the section it finally lands in. On desktop it settles in the
   * section's empty right column; on phones the section provides a
   * `[data-coin-landing]` band and the coin settles in its centre.
   */
  landing: string;
};

/**
 * Canvas box: 600px on desktop, 90vw (≤ 420px) on phones. The disc is ~74%
 * of the box at scale 1 (a 2.2-unit coin in a 2.98-unit frame), so on a
 * phone the held coin is about 57% of the width and the landed one about
 * 67%. <CoinStory> sizes its phone middle row to the held disc: keep the two
 * in step.
 */
const sizeFor = (w: number) => (w >= 1024 ? 600 : Math.min(Math.round(w * 0.9), 420));

/** Scale behind the card, held on stage, and once landed — the same on every width. */
const START_SCALE = 0.36;
const HOLD_SCALE = 0.85;
const LAND_SCALE = 1;

type Point = { x: number; y: number };

/**
 * The coin on the landing page, in three movements, all driven by scroll and
 * identical on every width — only the positions and the scale are calibrated:
 *
 *   1. It starts hidden behind the register card. Once the card is centred
 *      and you scroll on, it drops straight out from beneath the card, then
 *      curves to the chapter stage, growing as it goes.
 *   2. On the pinned stage it holds — centre-left beside the copy on desktop,
 *      dead centre between the stacked copy on phones — turning slowly
 *      through one revolution with a gentle tip while the beats change.
 *   3. When the stage unpins it glides on to the About section and settles at
 *      full size, showing the face it left with — on the right beside the
 *      copy on desktop, in a band below the copy on phones. Then a slow idle
 *      turn and a tilt toward the pointer (or the finger).
 *
 * Positions are page-space transforms from the lead section's origin, so the
 * coin can cross section boundaries freely.
 */
export default function LeadCoin({ section, card, hold, landing }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), spin: 0, bob: 0, scale: START_SCALE });
  /** Where scroll wants the tip; a frame loop eases toward it. */
  const aim = useRef({ tiltX: 0 });
  const settled = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [size, setSize] = useState(600);
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setEnabled(!reducedMotion());
      setDesktop(mq.matches);
      setSize(sizeFor(window.innerWidth));
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = wrap.current;
    const sec = section.current;
    const cardEl = card.current;
    const stage = document.querySelector<HTMLElement>(hold);
    const land = document.querySelector<HTMLElement>(landing);
    if (!el || !sec || !cardEl || !stage || !land) return;
    const SIZE = size;
    const spot = land.querySelector<HTMLElement>("[data-coin-landing]");

    // Geometry, re-measured on every ScrollTrigger refresh (resize, fonts,
    // images). All page-space, relative to the lead section's top-left.
    const geo = {
      s0: 0, // scroll where the trip starts (card centred)
      c0: 0, // scroll where the stage pins
      c1: 0, // scroll where the stage unpins
      s1: 0, // scroll where the coin has landed
      start: { x: 0, y: 0 } as Point, // behind the card
      holdX: 0, // stage x for the held coin
      end: { x: 0, y: 0 } as Point, // in the About section
      // Height of the pinned stage — its sticky box, not innerHeight, which on
      // phones changes as the browser chrome collapses and would pull the
      // coin off the stage's centre.
      stageH: 0,
      oTop: 0, // lead section's page top
      oLeft: 0, // lead section's page left
    };

    const measure = () => {
      const vh = window.innerHeight;
      const o = sec.getBoundingClientRect();
      const oTop = o.top + window.scrollY;
      const c = cardEl.getBoundingClientRect();
      const cardRestTop = c.top + window.scrollY - Number(gsap.getProperty(cardEl, "y") || 0);
      const st = stage.getBoundingClientRect();
      const stTop = st.top + window.scrollY;
      const stageH = stage.firstElementChild?.getBoundingClientRect().height || vh;
      const l = land.getBoundingClientRect();
      const lTop = l.top + window.scrollY;

      geo.stageH = stageH;
      geo.oTop = oTop;
      geo.oLeft = o.left + window.scrollX;
      geo.s0 = oTop;
      geo.c0 = stTop;
      geo.c1 = stTop + st.height - stageH;
      // The phone card is taller relative to the coin, so it starts lower
      // behind it and emerges at the same point of the drop as on desktop.
      geo.start = {
        x: c.left + c.width / 2 - o.left - SIZE / 2,
        y: cardRestTop + c.height * (desktop ? 0.6 : 0.76) - oTop - SIZE / 2,
      };
      // Centre-left beside the copy on desktop; dead centre on phones.
      geo.holdX = st.left + st.width * (desktop ? 0.47 : 0.5) - o.left - SIZE / 2;

      const band = spot?.getBoundingClientRect();
      if (band && band.height > 0) {
        // Phones: the landing band under the About copy. Landed once its
        // centre sits a little above the middle of the screen.
        const bandTop = band.top + window.scrollY;
        geo.end = {
          x: band.left + band.width / 2 - o.left - SIZE / 2,
          y: bandTop + band.height / 2 - oTop - SIZE / 2,
        };
        geo.s1 = bandTop + band.height / 2 - vh * 0.55;
      } else {
        // Desktop: the empty right column, vertically centred.
        geo.end = {
          x: l.left + l.width * 0.74 - o.left - SIZE / 2,
          y: lTop + l.height * 0.5 - oTop - SIZE / 2,
        };
        geo.s1 = lTop - vh * 0.2;
      }
    };

    const ease = gsap.parseEase("power2.inOut");
    const q = (a: Point, c: Point, b: Point, t: number): Point => {
      const u = 1 - t;
      return {
        x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
        y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
      };
    };

    const apply = (scroll: number) => {
      const { s0, c0, c1, s1, start, holdX, end, stageH, oTop, oLeft } = geo;
      // Page-space y of the stage's vertical centre while pinned at `scroll`.
      const holdY = (s: number) => s + stageH * 0.5 - oTop - SIZE / 2;

      let pos: Point;
      let scale: number;
      let rotY: number;
      let tiltX: number;
      let done = false;

      if (scroll < c0) {
        // 1 — out from behind the card and over to the stage.
        const t = ease(clamp01((scroll - s0) / Math.max(1, c0 - s0)));
        const target: Point = { x: holdX, y: holdY(c0) };
        const DROP = 360;
        const a = clamp01(t / 0.4);
        const b = clamp01((t - 0.4) / 0.6);
        if (b <= 0) {
          pos = { x: start.x, y: start.y + DROP * a };
        } else {
          const from = { x: start.x, y: start.y + DROP };
          pos = q(from, { x: start.x, y: from.y + 260 }, target, b);
        }
        scale = START_SCALE + (HOLD_SCALE - START_SCALE) * t;
        rotY = 0;
        tiltX = 0;
      } else if (scroll <= c1) {
        // 2 — held on stage, one slow revolution with a gentle tip.
        const p = clamp01((scroll - c0) / Math.max(1, c1 - c0));
        pos = { x: holdX, y: holdY(scroll) };
        scale = HOLD_SCALE;
        rotY = p * Math.PI * 2;
        tiltX = Math.sin(p * Math.PI) * 0.45;
      } else {
        // 3 — on to the About section.
        const t = ease(clamp01((scroll - c1) / Math.max(1, s1 - c1)));
        const from: Point = { x: holdX, y: holdY(c1) };
        pos = q(from, { x: from.x, y: from.y + 240 }, end, t);
        scale = HOLD_SCALE + (LAND_SCALE - HOLD_SCALE) * t;
        rotY = Math.PI * 2 + easeInOutQuad(t) * Math.PI * 2;
        tiltX = Math.sin(t * Math.PI) * 0.6;
        done = t > 0.995;
      }

      // Held on stage, the coin is pinned to the viewport rather than moved
      // through the page to cancel the scroll. Cancelling it needs a
      // transform update per scroll event, and on a phone those arrive a
      // frame behind the native scroll: the coin drifted with the page and
      // snapped back on every frame, a fine shake against the sticky stage
      // that never moved. Fixed, it sits still by construction. Either way
      // the page-space maths above is the source of truth; this only changes
      // which box the same point is expressed in, so the seams are exact.
      if (scroll >= c0 && scroll <= c1) {
        el.style.position = "fixed";
        gsap.set(el, { x: pos.x + oLeft, y: pos.y + oTop - scroll });
      } else {
        el.style.position = "absolute";
        gsap.set(el, { x: pos.x, y: pos.y });
      }
      pose.current.scale = scale;
      pose.current.rotY = rotY;
      aim.current.tiltX = tiltX;
      settled.current = done;
      pose.current.spin = done ? 0.14 : 0;
      pose.current.bob = done ? 0.03 : 0;
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => apply(self.scroll()),
        onRefresh: (self) => {
          measure();
          apply(self.scroll());
        },
      });
      measure();
      apply(window.scrollY);
      ScrollTrigger.refresh();
    }, sec);

    // The first measurement runs before a first-time visitor's fonts and
    // images have settled, and ScrollTrigger only refreshes again on load.
    // Re-measure whenever anything the geometry depends on changes size, once
    // fonts are in, and on load, so the coin never waits on a stale layout.
    const remeasure = () => {
      measure();
      apply(window.scrollY);
    };
    const ro = new ResizeObserver(remeasure);
    // Border boxes, so padding changes count too; the body catches any
    // height change above the landing that only moves things.
    [document.body, sec, cardEl, stage, stage.firstElementChild, land, spot].forEach(
      (n) => n && ro.observe(n, { box: "border-box" }),
    );
    document.fonts?.ready.then(remeasure);
    window.addEventListener("load", remeasure);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", remeasure);
      ctx.revert();
    };
  }, [enabled, size, desktop, section, card, hold, landing]);

  // Frame loop: eases the tip toward what scroll asked for, so a pause
  // mid-turn still settles; once landed, tilts toward the pointer — or, on
  // touch screens, a finger resting on the coin.
  useEffect(() => {
    if (!enabled || !onScreen) return;
    const el = wrap.current;
    if (!el) return;
    const target = { x: 0, y: 0 };
    let raf = 0;
    const aimAt = (clientX: number, clientY: number) => {
      if (!settled.current) return;
      const r = el.getBoundingClientRect();
      const nx = (clientX - (r.left + r.width / 2)) / window.innerWidth;
      const ny = (clientY - (r.top + r.height / 2)) / window.innerHeight;
      target.x = Math.max(-1, Math.min(1, nx * 2)) * 0.42;
      target.y = Math.max(-1, Math.min(1, ny * 2)) * 0.42;
    };
    const onMove = (e: MouseEvent) => aimAt(e.clientX, e.clientY);
    // Only a touch that begins on the coin steers it. Every scroll flick is
    // a touch too, and following those had the landed coin lurch toward each
    // one and spring back as the finger lifted — a wobble on every scroll.
    let touchingCoin = false;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || !settled.current) return;
      const r = el.getBoundingClientRect();
      touchingCoin =
        t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
      if (touchingCoin) aimAt(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && touchingCoin) aimAt(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      touchingCoin = false;
      target.x = 0;
      target.y = 0;
    };
    const loop = () => {
      const p = pose.current;
      if (settled.current) {
        p.rotX += (target.y - p.rotX) * 0.06;
        p.rotZ += (-target.x * 0.5 - p.rotZ) * 0.06;
      } else {
        target.x = 0;
        target.y = 0;
        p.rotX += (aim.current.tiltX - p.rotX) * 0.14;
        p.rotZ += (0 - p.rotZ) * 0.14;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(raf);
    };
  }, [enabled, onScreen]);

  /*
   * The canvas renders on every frame for as long as it is alive, and the
   * coin is only actually on screen for a few sections of a very long page.
   * Park the render loop the rest of the time — on a phone that loop is the
   * difference between scrolling smoothly and not.
   */
  useEffect(() => {
    if (!enabled) return;
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrap}
      className="pointer-events-none absolute top-0 left-0 z-0 will-change-transform"
      style={{ width: size, height: size }}
    >
      <CoinScene pose={pose} active={onScreen} className="h-full w-full" />
    </div>
  );
}
