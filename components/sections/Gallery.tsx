"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { galleryItems } from "@/lib/gallery";
import GalleryCarousel from "@/components/GalleryCarousel";
import MediaLightbox from "@/components/MediaLightbox";

/**
 * Media Gallery — every set (beach, the land signing, the Experience Center,
 * the Prime Minister's visit) in one endless row of portrait cards that glides
 * on by itself, in the order set in lib/gallery.ts and captioned by set.
 * Tapping the centre card opens it full-screen; video cards play there with
 * sound.
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
      data-dark
      // Exactly one screen: the heading clears the fixed header, and the
      // carousel takes whatever height is left, sizing its cards to it.
      className="flex h-[var(--stage-h,100vh)] flex-col overflow-hidden bg-ink px-6
                 pt-[calc(var(--strip-h)+72px)] pb-[clamp(16px,3vh,32px)]
                 md:px-[clamp(40px,5vw,80px)] md:pt-[calc(var(--strip-h)+104px)]"
    >
      <div className="flex shrink-0 flex-col items-start gap-2">
        <span
          data-tag
          className="type-eyebrow text-cream/40"
        >
          Gallery
        </span>
        <h2
          data-heading
          className="type-editorial text-[clamp(22px,3vw,42px)] leading-[1.1] text-cream"
        >
          Media Gallery
        </h2>
      </div>

      {/* Full-bleed: the row runs to the screen edge on both sides, so the
          neighbouring cards are cut by the screen, not by the padding. */}
      <div
        data-carousel
        className="mt-[clamp(12px,2.5vh,32px)] -mx-6 flex min-h-0 flex-1 md:-mx-[clamp(40px,5vw,80px)]"
      >
        <GalleryCarousel
          slides={galleryItems}
          label="Alam Al Roum media gallery"
          paused={open !== null}
          onOpen={setOpen}
        />
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
