"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/**
 * Section 01 — Hero.
 *
 * A full-bleed film — the brand film from 2.28s (its first full-frame shot,
 * past the framed intro) to 38s (short of the logo outro) — muted and looping. The entrance is handled by the preloader's
 * iris, which opens onto this, so the hero itself is settled from the first
 * frame: film at a 1.08 scale, headline and location in white. Phones get a
 * 720p cut; the poster is the film's first frame so nothing jumps on play.
 *
 * Outer wrapper is a full-viewport scroll track holding a sticky panel so the
 * hero pins while the About panel scrolls over it. While that happens the
 * film drifts up a touch and the copy lifts away — a small depth cue
 * the original doesn't have.
 *
 * Mobile is a different layout, not a scaled-down desktop: the headline sits at
 * the top of the screen and runs full width.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLVideoElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const location = useRef<HTMLDivElement>(null);
  const headlineLines = useRef<HTMLHeadingElement>(null);

  // Browsers suspend video in a background tab and do not always resume a
  // muted autoplay one when it comes back, which leaves the hero on a frozen
  // frame. Nudge it back on whenever the page is shown again.
  useEffect(() => {
    const video = img.current;
    if (!video) return;
    const resume = () => {
      if (!document.hidden && video.paused) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

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
    <div ref={root} id="scrollTrigger" className="relative h-[var(--stage-h,100vh)]">
      <div className="sticky top-0 h-[var(--stage-h,100vh)] overflow-hidden">
        <div className="relative h-[var(--stage-h,100vh)] w-full overflow-hidden bg-cream">
          {/* Full-bleed film */}
          <div data-dark className="absolute inset-0 z-5 bg-black">
            <video
              ref={img}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={asset("/video/hero-poster.jpg")}
              aria-label="Alam Al Roum Coastline"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ transform: "scale(1.08)" }}
            >
              <source src={asset("/video/hero-720.mp4")} type="video/mp4" media="(max-width: 767px)" />
              <source src={asset("/video/hero-1080.mp4")} type="video/mp4" />
            </video>
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

          {/* Headline — top of screen on mobile (below the header and its contact
              strip), vertically centred from md up */}
          <div
            ref={copy}
            className="absolute inset-x-0 top-[calc(clamp(104px,15vh,132px)+var(--strip-h))] z-20 px-6
                       md:inset-x-auto md:top-1/2 md:right-auto
                       md:left-[clamp(40px,5vw,76px)] md:-translate-y-1/2 md:px-0"
          >
            {/* The mobile size is derived, not picked: the longest line —
                "Alam Al Roum, A Coastline" — measures about 12.1em wide, so
                dividing the available width (100vw less the two 24px gutters)
                by 14 keeps it on one line at any phone width, a size down from
                the limit. That is what holds the headline to two lines
                instead of three. */}
            <h1
              ref={headlineLines}
              className="font-sans text-[calc((100vw-48px)/14)] leading-[1.12]
                         font-medium tracking-display text-white
                         md:max-w-[760px] md:text-[48px] md:leading-[52px]"
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
                       type-eyebrow text-white
                       md:bottom-20 md:left-[clamp(40px,5vw,76px)]"
          >
            Mediterranean , Egypt
          </div>
        </div>
      </div>
    </div>
  );
}
