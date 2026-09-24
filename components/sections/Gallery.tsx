"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { galleryItems } from "@/lib/gallery";
import CoverflowCarousel from "@/components/CoverflowCarousel";
import MediaLightbox from "@/components/MediaLightbox";

/**
 * Media Gallery — one cover-flow of every set (beach, Experience Center, the
 * Prime Minister's visit, the land signing), arranged in lib/gallery.ts and
 * captioned by set. Tapping the centre card opens it full-screen; video
 * cards play there with sound. Placed after Location.
 */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

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
                 px-6 pt-10 pb-10 md:px-[clamp(40px,5vw,80px)] md:py-[clamp(60px,8vh,100px)]"
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
          className="type-editorial text-[clamp(22px,3vw,42px)] leading-[1.1] text-ink"
        >
          Media Gallery
        </h2>
      </div>

      {/* Full-bleed on mobile: inside the section's `px-6` the neighbouring
          cards were sliced off square at the padding edge. Let them run to the
          screen edge instead, so the rake reads as depth rather than a crop. */}
      <div data-carousel className="mt-4 -mx-6 md:mx-0 md:mt-10">
        <CoverflowCarousel slides={galleryItems} label="Alam Al Roum media gallery" onOpen={setOpen} />
      </div>

      <MediaLightbox
        items={galleryItems}
        index={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
