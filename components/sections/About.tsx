"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

/**
 * Section 02 — About. A full-viewport cream panel, split in two on desktop:
 * the copy reads as one column on the left, the right half is left clear for
 * the coin to land in.
 *
 * Both blocks (`.fade-up`) rise 40px into place on the site's ease-out with
 * the lower block trailing by 150ms, and the headline resolves out of a soft
 * blur as it comes.
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
      className="bg-cream px-6 pt-16 pb-14
                 md:grid md:min-h-screen md:grid-cols-[minmax(0,46%)_minmax(0,54%)]
                 md:items-center md:gap-x-10 md:px-19 md:py-19"
    >
      {/* Phones: where the coin lands after the chapter (see <LeadCoin>),
          ahead of the copy so its glide never crosses text. Sized to the
          landed disc (~67vw) plus air. */}
      <div data-coin-landing aria-hidden className="mb-10 md:hidden" style={{ height: "76vw" }} />

      {/* One block, not two. The copy used to be pushed to the top and bottom
          edges of a full-height panel, which left a gulf between the headline
          and the paragraph that belongs to it; grouped here, the air lands on
          the right — around the coin — where it is doing the work. */}
      <div className="md:max-w-[620px]">
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

        <div data-fade-up className="mt-10 md:mt-8">
          <span aria-hidden className="mb-6 block h-px w-14 bg-ink/25 md:mb-7" />
          <p className="font-serif text-[clamp(15px,1.6vw,20px)] leading-[1.65] text-ink">
            Alam Al Roum unfolds across 7.2 kilometres of Mediterranean
            shoreline and 22 kilometres of lagoon. A city where coastal living,
            open water, and urban life meet. Not for a season, but for a
            lifetime.
          </p>
        </div>
      </div>

      {/* Left empty on purpose: on desktop the coin settles here (see
          <LeadCoin>), and the floating seals render globally. */}
      <div aria-hidden className="hidden md:block" />
    </section>
  );
}
