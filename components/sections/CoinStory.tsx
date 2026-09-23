"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, clamp01, reducedMotion } from "@/lib/gsap";
import { coinBeats } from "@/lib/coinStory";

/**
 * The coin's chapter. A 200vh track pins an ink stage for one viewport of
 * scroll; the coin (owned by <LeadCoin>, positioned in page space) holds the
 * centre while two beats of copy cross-fade around it.
 *
 * Desktop: headline left, coin centre, body right.
 * Phone: headline top, coin middle, body bottom, all set flush left on the
 * same edge. The middle row is sized to the held disc (~57vw) plus air for
 * its tip, not to its canvas, so the copy sits close but never under it.
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
    // A blur that changes on every scroll frame is re-rendered on every
    // scroll frame, and on a phone that is the difference between the coin
    // chapter scrolling smoothly and not. Phones cross-fade without it.
    const blur = !reduced && !phone.matches;
    const apply = (p: number, arrival: number, departure: number) => {
      beats.forEach((b) => {
        const i = Number(b.dataset.beat);
        const centre = (i + 0.5) / n;
        // Fully on within ±0.27/n of its centre, gone by twice that — so the
        // cross-fade keeps its shape whatever the beat count. The first beat
        // is on from the start and the last stays on to the end.
        const win = 0.27 / n;
        let d = Math.abs(p - centre);
        if ((i === 0 && p < centre) || (i === n - 1 && p > centre)) d = 0;
        const v = clamp01(1 - (d - win) / win) * arrival * (phone.matches ? 1 - departure : 1);
        b.style.opacity = String(v);
        b.style.transform = `translate3d(0, ${((1 - v) * 24 * (p < centre ? 1 : -1)).toFixed(1)}px, 0)`;
        b.style.filter = v < 0.999 && blur ? `blur(${((1 - v) * 8).toFixed(2)}px)` : "";
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
    <section ref={root} id="coin-story" data-dark className="relative h-[calc(var(--stage-h,100vh)*2)] bg-ink">
      <div className="sticky top-0 h-[var(--stage-h,100vh)] overflow-hidden">
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
                className="type-section-title absolute inset-x-0 bottom-0 text-cream
                           will-change-[transform,opacity]
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
                           text-cream/80 will-change-[transform,opacity]
                           lg:top-1/2 lg:-translate-y-1/2 lg:text-18 lg:leading-[1.7]"
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
