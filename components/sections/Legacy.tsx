"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import SweepLink from "@/components/SweepLink";

/**
 * Section 10 — Register interest. Cream panel closing the editorial run.
 *
 * Mirrors the original `.legacy-section` cascade: tag, heading, body, seals
 * and the bottom row each rise into place on the site's ease-out with
 * staggered delays (0 / 0.1 / 0.2 / 0.25 / 0.35s). The tag leads with a tiny
 * slide, the heading pulls into focus, and the bottom-row hairline
 * additionally draws in from the left.
 */
export default function Legacy() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE_OUT, opacity: 0 },
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });

      tl.from("[data-tag]", { x: -8, y: 10, duration: 0.8 }, 0)
        .fromTo(
          "[data-heading]",
          { y: 22, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, clearProps: "filter" },
          0.1,
        )
        .from("[data-body]", { y: 16, duration: 1 }, 0.2)
        .from("[data-seals]", { y: 20, duration: 1 }, 0.25)
        .from("[data-bottom]", { y: 12, duration: 1 }, 0.35)
        .from(
          "[data-bottom-line]",
          {
            scaleX: 0,
            opacity: 1,
            transformOrigin: "left center",
            duration: 1.2,
            ease: EASE_OUT,
          },
          0.35,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="legacySection"
      className="relative z-[2] flex flex-col border-t border-ink/12 bg-cream
                 px-6 pt-24 pb-24
                 md:px-[clamp(40px,6vw,80px)] md:pt-[clamp(48px,7vw,88px)] md:pb-[clamp(56px,8vw,96px)]"
    >
      <p
        data-tag
        className="type-eyebrow mb-[clamp(32px,5vh,56px)] text-ink/45"
      >
        Register Interest
      </p>

      <div
        className="grid grid-cols-1 items-start gap-10
                   md:grid-cols-[1fr_auto] md:gap-x-[clamp(40px,6vw,80px)] md:gap-y-0"
      >
        {/* Left: heading + body + CTA */}
        <div className="flex flex-col">
          <h2
            data-heading
            className="type-section-title mb-[clamp(20px,3.5vh,36px)] text-ink"
          >
            BE PART OF
            <br />
            OUR LEGACY
          </h2>
          <p
            data-body
            className="max-w-[500px] font-sans text-12 leading-[1.8] font-medium
                       text-ink/60 md:text-16"
          >
            Alam Al Roum is opening a new chapter on Egypt&rsquo;s North Coast.
          </p>
          <p
            data-body
            className="mt-[clamp(12px,2vh,20px)] max-w-[500px] font-sans text-12 leading-[1.8]
                       font-medium text-ink/60 md:text-16"
          >
            Those who arrive early help write it.
          </p>
          <div data-body className="mt-[clamp(24px,4vh,40px)] self-stretch md:self-start">
            <SweepLink
              href="#lead"
              label="Register Now"
              className="border-ink text-ink"
              fill="bg-ink"
              hoverText="group-hover:text-cream"
            />
          </div>
        </div>

        {/* Right: brand seals — row on mobile, stacked column on desktop */}
        <div
          data-seals
          className="flex flex-row flex-wrap items-center justify-start gap-[clamp(16px,2.5vh,24px)]
                     pt-1 md:flex-col"
        >
          <Image
            src="/images/seal-arabic-dark.png"
            alt="Alam Al Roum seal"
            width={112}
            height={112}
            className="h-16 w-16 object-contain md:h-[clamp(72px,8vw,112px)] md:w-[clamp(72px,8vw,112px)]"
          />
          <Image
            src="/images/seal-compass-dark.png"
            alt="Compass seal"
            width={112}
            height={112}
            className="h-16 w-16 object-contain md:h-[clamp(72px,8vw,112px)] md:w-[clamp(72px,8vw,112px)]"
          />
        </div>
      </div>

      {/* Bottom row */}
      <div
        data-bottom
        className="relative mt-[clamp(72px,14vh,140px)] flex flex-wrap items-end
                   justify-between gap-4 pt-[clamp(24px,4vh,40px)]"
      >
        <span
          data-bottom-line
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-ink/10"
        />
        <Image
          src="/images/image-17.png"
          alt="Qatari Diar"
          width={72}
          height={72}
          className="block h-[clamp(44px,5vw,72px)] w-auto opacity-85"
        />
        <Image
          src="/images/logo-wordmark.png"
          alt="Alam Al Roum"
          width={264}
          height={24}
          className="block h-[clamp(15px,4vw,20px)] w-auto opacity-85 md:h-[clamp(16px,1.9vw,24px)]"
        />
      </div>
    </section>
  );
}
