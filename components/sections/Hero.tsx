"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, EASE_OUT, reducedMotion } from "@/lib/gsap";

/**
 * Section 01 — Hero.
 *
 * The production site shows the full-bleed photograph immediately — the
 * entrance is handled by the preloader's iris, which opens onto this. So the
 * hero itself is settled from the first frame: photograph at a 1.08 scale,
 * headline and location in white.
 *
 * Outer wrapper is a full-viewport scroll track holding a sticky panel so the
 * hero pins while the About panel scrolls over it. While that happens the
 * photograph drifts up a touch and the copy lifts away — a small depth cue
 * the original doesn't have.
 *
 * Mobile is a different layout, not a scaled-down desktop: the headline sits at
 * the top of the screen and runs full width.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const location = useRef<HTMLDivElement>(null);
  const headlineLines = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      // Entrance — the headline and location rise in as the iris opens.
      const lines = headlineLines.current?.children ?? [];
      gsap.set([...lines, location.current], { y: 28, opacity: 0 });
      const onBurst = () => {
        gsap.to([...lines, location.current], {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: EASE_OUT,
          stagger: 0.12,
          delay: 0.35,
          clearProps: "transform,opacity",
        });
      };
      window.addEventListener("preloader:burst", onBurst, { once: true });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .fromTo(
          img.current,
          { scale: 1.08, yPercent: 0 },
          { scale: 1.16, yPercent: -5, ease: "none" },
          0,
        )
        .to([copy.current, location.current], { yPercent: -40, opacity: 0.25, ease: "none" }, 0);

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} id="scrollTrigger" className="relative h-screen">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-screen w-full overflow-hidden bg-cream">
          {/* Full-bleed photograph */}
          <div data-dark className="absolute inset-0 z-5">
            <Image
              ref={img}
              src="/images/image-11.jpg"
              alt="Alam Al Roum Coastline"
              fill
              priority
              sizes="100vw"
              className="object-cover will-change-transform"
              style={{ transform: "scale(1.08)" }}
            />
            {/* Legibility wash so the headline reads over the beach */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 34%, rgba(0,0,0,0) 62%)",
              }}
            />
          </div>

          {/* Headline — top of screen on mobile, vertically centred from md up */}
          <div
            ref={copy}
            className="absolute inset-x-0 top-[clamp(104px,15vh,132px)] z-20 px-6
                       md:inset-x-auto md:top-1/2 md:right-auto
                       md:left-[clamp(40px,5vw,76px)] md:-translate-y-1/2 md:px-0"
          >
            <h1
              ref={headlineLines}
              className="font-sans text-[clamp(20px,5.4vw,28px)] leading-[1.3]
                         font-medium tracking-display text-white
                         md:max-w-[608px] md:text-48 md:leading-52"
            >
              <span className="block">Alam Al Roum, A Coastline</span>
              <span className="block">
                Shaped for{" "}
                <em className="font-serif font-normal italic tracking-normal">
                  Greatness.
                </em>
              </span>
            </h1>
          </div>

          {/* Location — sits clear of the register card that peeks over the
              bottom edge (28px on phones, 36px from md up) plus its shadow */}
          <div
            ref={location}
            className="absolute bottom-14 left-6 z-20
                       font-sans text-12 text-white
                       md:bottom-20 md:left-[clamp(40px,5vw,76px)] md:text-16"
          >
            Mediterranean , Egypt
          </div>
        </div>
      </div>
    </div>
  );
}
