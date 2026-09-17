"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

/**
 * Section 02 — About. A full-viewport cream panel: heading block pinned to the
 * top, body copy to the bottom.
 *
 * Mirrors the original `.s2`: a full-width hairline above the headline, then
 * both blocks (`.fade-up`) rise 40px into place on the site's ease-out with
 * the lower block trailing by 150ms. The hairline additionally draws in from
 * the left as the section reveals.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });

      tl.from(
        "[data-fade-up]",
        { y: 40, opacity: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.15 },
        0,
      )
        // Soft focus on the headline as its block rises; filter is cleared
        // once done so the type renders crisp.
        .fromTo(
          "[data-headline]",
          { filter: "blur(6px)" },
          { filter: "blur(0px)", duration: 0.9, ease: EASE_OUT, clearProps: "filter" },
          0,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="about"
      className="flex flex-col justify-between bg-cream
                 px-6 pt-16 pb-14 md:min-h-screen md:px-19 md:py-19"
    >
      {/* Phones: where the coin lands after the chapter (see <LeadCoin>),
          ahead of the copy so its glide never crosses text. Sized to the
          landed disc (~67vw) plus air. */}
      <div data-coin-landing aria-hidden className="mb-10 md:hidden" style={{ height: "76vw" }} />

      <div data-fade-up>
        <h2
          data-headline
          className="font-sans text-[clamp(22px,6vw,36px)] leading-[1.15] font-bold
                     tracking-[-0.01em] text-ink uppercase md:text-[clamp(20px,2.4vw,36px)]"
        >
          An Icon in the North&nbsp;Coast,
          <br />
          Defined by Scale
        </h2>
        <p className="mt-4 font-sans text-12 text-ink/50 md:text-16">
          Mediterranean , Egypt
        </p>
      </div>

      <div
        data-fade-up
        className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-[560px]">
          <p className="font-serif text-[clamp(15px,1.6vw,20px)] leading-[1.65] text-ink">
            Alam Al Roum unfolds across 7.2 kilometres of Mediterranean
            shoreline and 22 kilometres of lagoon. A city where coastal living,
            open water, and urban life meet. Not for a season, but for a
            lifetime.
          </p>
        </div>
        {/* Seals render globally via <FloatingSeals /> — the original leaves
            this column empty; on desktop the coin settles in it. */}
        <div className="shrink-0" />
      </div>
    </section>
  );
}
