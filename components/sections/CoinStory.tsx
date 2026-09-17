"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, clamp01, reducedMotion } from "@/lib/gsap";
import { coinBeats } from "@/lib/coinStory";

/**
 * The coin's chapter. A 300vh track pins an ink stage for two viewports of
 * scroll; the coin (owned by <LeadCoin>, positioned in page space) holds the
 * centre while three beats of copy cross-fade around it.
 *
 * Desktop: headline left, coin centre, body right.
 * Phone: headline top-left, coin middle, body bottom-right — the reference's
 * stacked composition. The middle row is sized to the held disc (~57vw) plus
 * air for its tip, not to its canvas, so the copy sits close but never under it.
 */
export default function CoinStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const beats = Array.from(el.querySelectorAll<HTMLElement>("[data-beat]"));
    if (!beats.length) return;
    const n = coinBeats.length;
    const reduced = reducedMotion();

    // `p` runs over the pinned stretch; `arrival` goes 0 → 1 as the stage
    // comes up and pins, so the copy only appears once the coin has landed.
    // On phones `departure` takes it back out as the stage unpins, since the
    // coin's glide to About runs straight down through the stacked copy.
    const phone = window.matchMedia("(max-width: 1023px)");
    const apply = (p: number, arrival: number, departure: number) => {
      beats.forEach((b) => {
        const i = Number(b.dataset.beat);
        const centre = (i + 0.5) / n;
        // Fully on within ±0.09 of its centre, gone by ±0.18; the first beat
        // is on from the start and the last stays on to the end.
        let d = Math.abs(p - centre);
        if ((i === 0 && p < centre) || (i === n - 1 && p > centre)) d = 0;
        const v = clamp01(1 - (d - 0.09) / 0.09) * arrival * (phone.matches ? 1 - departure : 1);
        b.style.opacity = String(v);
        b.style.transform = `translate3d(0, ${((1 - v) * 24 * (p < centre ? 1 : -1)).toFixed(1)}px, 0)`;
        b.style.filter = v < 0.999 && !reduced ? `blur(${((1 - v) * 8).toFixed(2)}px)` : "";
      });
    };

    const update = () => {
      const r = el.getBoundingClientRect();
      // The sticky stage's own height, not innerHeight — on phones the latter
      // moves with the browser chrome and would shift the beats mid-scroll.
      const stageH = el.firstElementChild?.getBoundingClientRect().height || window.innerHeight;
      const pinned = clamp01(-r.top / Math.max(1, r.height - stageH));
      const arrival = clamp01((stageH * 0.45 - r.top) / (stageH * 0.45));
      // 0 while pinned, 1 once the stage has scrolled a third of its height up.
      const departure = clamp01((-(r.top) - (r.height - stageH)) / (stageH * 0.33));
      apply(pinned, arrival, departure);
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: update,
      onRefresh: update,
    });
    update();
    return () => st.kill();
  }, []);

  return (
    <section ref={root} id="coin-story" data-dark className="relative h-[300vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="relative mx-auto grid h-full w-full max-w-[1400px] px-6
                     grid-rows-[1fr_minmax(0,76vw)_1fr] items-center
                     lg:grid-cols-[minmax(0,30%)_1fr_minmax(0,32%)] lg:grid-rows-1
                     lg:px-[clamp(40px,5vw,80px)]"
        >
          {/* Headlines — top on phones, left on desktop */}
          <div className="relative self-end pb-4 lg:self-center lg:pb-0">
            {coinBeats.map((beat, i) => (
              <h2
                key={i}
                data-beat={i}
                className="absolute inset-x-0 bottom-0 font-sans text-[clamp(28px,7.5vw,40px)]
                           leading-[1.02] font-bold tracking-[-0.01em] text-cream uppercase
                           will-change-[transform,opacity,filter]
                           lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 lg:text-[clamp(32px,3.6vw,56px)]"
              >
                {beat.title.map((line, l) => (
                  <span key={l} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ))}
          </div>

          {/* The coin lives here (rendered by LeadCoin in page space) */}
          <div aria-hidden className="h-full" />

          {/* Bodies — bottom on phones, right on desktop */}
          <div className="relative self-start pt-4 lg:self-center lg:pt-0">
            {coinBeats.map((beat, i) => (
              <p
                key={i}
                data-beat={i}
                className="absolute inset-x-0 top-0 max-w-[380px] font-serif text-16 leading-[1.6]
                           text-right text-cream/80 will-change-[transform,opacity,filter]
                           lg:top-1/2 lg:-translate-y-1/2 lg:text-left lg:text-18 lg:leading-[1.7]"
              >
                {beat.body}
              </p>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
