"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { coinStory } from "@/lib/coinStory";
import StageCoin from "@/components/coin/StageCoin";

/**
 * The coin's chapter: one viewport of ink with the coin turning in the
 * middle, the headline beside it and the body on the other side. The copy
 * settles in once as the section arrives; the coin turns on its own loop.
 *
 * Desktop: headline left, coin centre, body right.
 * Phone: headline top, coin middle, body bottom, all set flush left on the
 * same edge. The middle row is sized to the disc (~46vw) plus air for its
 * turn, not to its canvas, so the copy sits close but never under it.
 */
export default function CoinStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } })
        .from("[data-coin-title]", { y: 24, opacity: 0, duration: 0.9, ease: EASE_OUT }, 0)
        .from("[data-coin-body]", { y: 24, opacity: 0, duration: 0.9, ease: EASE_OUT }, 0.15);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="coin-story" data-dark className="relative h-[var(--stage-h,100vh)] overflow-hidden bg-ink">
      <div
        className="relative mx-auto grid h-full w-full max-w-[1400px] px-6
                   grid-rows-[1fr_minmax(0,62vw)_1fr] items-center
                   lg:grid-cols-[minmax(0,32%)_1fr_minmax(0,32%)] lg:grid-rows-1
                   lg:px-[clamp(40px,5vw,80px)]"
      >
        {/* Headline — top on phones, left on desktop. The desktop size is set
            here, over .type-section-title, so the longest line ("Defined by
            Scale", ~9.7em) fits the 32% column on one line. */}
        <h2
          data-coin-title
          className="type-section-title self-end pb-4 text-cream
                     lg:self-center lg:pb-0 lg:text-[clamp(26px,2.8vw,38px)]!"
        >
          {coinStory.title.map((line, l) => (
            <span key={l} className="block">
              {line}
            </span>
          ))}
        </h2>

        {/* The coin, turning in the middle of the stage */}
        <div aria-hidden className="relative h-full">
          <StageCoin />
        </div>

        {/* Body — bottom on phones, right on desktop */}
        <p
          data-coin-body
          className="max-w-[380px] self-start pt-4 font-serif text-16 leading-[1.6] text-cream/80
                     lg:self-center lg:pt-0 lg:text-18 lg:leading-[1.7]"
        >
          {coinStory.body}
        </p>
      </div>
    </section>
  );
}
