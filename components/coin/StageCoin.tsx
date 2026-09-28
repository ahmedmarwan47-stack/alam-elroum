"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger, clamp01, reducedMotion } from "@/lib/gsap";
import { restingPose, type CoinPose } from "./CoinScene";

const CoinScene = dynamic(() => import("./CoinScene"), { ssr: false });

/** The disc at this scale is ~57% of a phone's width. <CoinStory> sizes its middle row to it. */
const SCALE = 0.85;

/**
 * The coin on the chapter stage. It lives in the stage's middle cell and
 * never leaves it: it scrolls in with the stage, holds while the stage is
 * pinned, and scrolls out with it. Over the pinned stretch it turns through
 * one slow revolution with a gentle tip: the star for the first beat, the
 * name on its other face for the middle one, the star again for the last.
 *
 * Canvas box: 600px on desktop (44vw on narrower ones, so the disc clears
 * the copy), 90vw (≤ 420px) on phones. With reduced motion it rests still.
 */
export default function StageCoin({ track }: { track: RefObject<HTMLElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), spin: 0, bob: 0, scale: SCALE });
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const stageH = el.firstElementChild?.getBoundingClientRect().height || window.innerHeight;
      const p = clamp01(-r.top / Math.max(1, r.height - stageH));
      pose.current.rotY = p * Math.PI * 2;
      pose.current.rotX = Math.sin(p * Math.PI) * 0.45;
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: update,
      onRefresh: update,
    });
    update();
    return () => st.kill();
  }, [track]);

  // The canvas renders every frame while alive; park it whenever the stage
  // is off screen — on a phone that is the difference between scrolling
  // smoothly and not.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "25% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(90vw,420px)]
                 -translate-x-1/2 -translate-y-1/2 lg:w-[min(600px,44vw)]"
    >
      <CoinScene pose={pose} active={onScreen} className="h-full w-full" />
    </div>
  );
}
