"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

/**
 * Section 06 — Masterplan statement. Cream panel with a label and a single
 * wide headline, then the aerial render running full bleed beneath it.
 *
 * Mirrors the original `.s6`: the header slides in from the right, the image
 * follows 0.2s later on a longer travel, and the picture itself settles from a
 * slight zoom so the two movements read as one gesture. Inside the header the
 * tag leads with a tiny left-to-right slide and the headline pulls into focus.
 */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });

      tl.fromTo(
        "[data-s6-header]",
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: EASE_OUT },
        0,
      )
        .fromTo(
          "[data-s6-tag]",
          { x: -8, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease: EASE_OUT },
          0,
        )
        .fromTo(
          "[data-s6-title]",
          { filter: "blur(6px)" },
          { filter: "blur(0px)", duration: 0.9, ease: EASE_OUT, clearProps: "filter" },
          0,
        )
        .fromTo(
          "[data-s6-image]",
          { x: 80, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: EASE_OUT },
          0.2,
        )
        .fromTo(
          "[data-s6-image] img",
          { scale: 1.06 },
          { scale: 1, duration: 1.4, ease: EASE_OUT },
          0.2,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="s6"
      className="relative overflow-hidden bg-cream pt-22 md:pt-30"
    >
      <div
        data-s6-header
        className="mb-15 flex flex-col items-start gap-2 px-6 md:gap-3.5 md:px-20"
      >
        <span
          data-s6-tag
          className="font-sans text-12 whitespace-nowrap text-ink/50 md:text-16"
        >
          The Masterplan
        </span>
        <h2
          data-s6-title
          className="font-sans text-[clamp(24px,3.4vw,48px)] leading-[1.2] font-bold
                     tracking-[-0.01em] text-ink uppercase"
        >
          A sense of place defined by urban coastal living.
        </h2>
      </div>

      <div
        data-s6-image
        className="relative aspect-[1512/844] w-full overflow-hidden"
      >
        <Image
          src="/images/masterplan-aerial.jpg"
          alt="Aerial render of the Alam Al Roum masterplan"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
