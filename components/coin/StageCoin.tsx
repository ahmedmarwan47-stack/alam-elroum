"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { reducedMotion } from "@/lib/gsap";
import { restingPose, type CoinPose } from "./CoinScene";

const CoinScene = dynamic(() => import("./CoinScene"), { ssr: false });

/** The disc at this scale is ~46% of a phone's width. <CoinStory> sizes its middle row to it. */
const SCALE = 0.68;

/**
 * The coin on the chapter stage, turning on a steady loop with a gentle bob.
 * With reduced motion it rests still, face on.
 *
 * Canvas box: 600px on desktop (44vw on narrower ones, so the disc clears
 * the copy), 90vw (≤ 420px) on phones.
 */
export default function StageCoin() {
  const wrap = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), scale: SCALE });
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    if (reducedMotion()) Object.assign(pose.current, { spin: 0, bob: 0 });
  }, []);

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
