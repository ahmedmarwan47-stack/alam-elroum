"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { gallerySlides } from "@/lib/gallery";
import CoverflowCarousel from "@/components/CoverflowCarousel";

/** Gallery — a cover-flow of the renders, placed after Location. */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
      tl.from("[data-tag]", { x: -8, opacity: 0, duration: 0.8, ease: EASE_OUT }, 0)
        .from(
          "[data-heading]",
          { y: 24, opacity: 0, filter: "blur(6px)", duration: 0.9, ease: EASE_OUT, clearProps: "filter" },
          0.05,
        )
        .from("[data-carousel]", { y: 40, opacity: 0, duration: 1.1, ease: EASE_OUT }, 0.2);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="gallery"
      className="overflow-hidden border-t border-ink/12 bg-cream
                 px-6 pt-24 pb-16 md:px-[clamp(40px,5vw,80px)] md:py-[clamp(60px,8vh,100px)]"
    >
      <div className="flex flex-col items-start gap-2">
        <span
          data-tag
          className="type-eyebrow text-ink/40"
        >
          Gallery
        </span>
        <h2
          data-heading
          className="type-editorial text-[clamp(28px,3.4vw,48px)] leading-[1.1] text-ink"
        >
          A Coastline in Pictures
        </h2>
      </div>

      <div data-carousel className="mt-8 md:mt-10">
        <CoverflowCarousel slides={gallerySlides} label="Alam Al Roum gallery" />
      </div>
    </section>
  );
}
