"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import SweepLink from "@/components/SweepLink";

/**
 * Section 11 — Contact. Navy panel closing the page. The enquiry form now
 * lives under the hero, so this carries the address, a route back to it,
 * and the legal line.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
      tl.from("[data-tag]", { x: -8, y: 12, opacity: 0, duration: 0.8, ease: EASE_OUT }, 0)
        .fromTo(
          "[data-headline]",
          { y: 36, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: EASE_OUT, clearProps: "filter" },
          0,
        )
        .from("[data-item]", { y: 20, opacity: 0, duration: 1, ease: EASE_OUT, stagger: 0.08 }, 0.2)
        .from(
          "[data-divider]",
          { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: EASE_OUT },
          0.5,
        )
        .from("[data-bottom]", { y: 14, opacity: 0, duration: 0.8, ease: EASE_OUT }, 0.7);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="footerSection"
      data-dark
      className="bg-ink px-6 pt-[clamp(36px,5vw,60px)] pb-[clamp(24px,3vw,36px)] text-cream
                 md:px-[clamp(40px,6vw,80px)]"
    >
      <p data-tag className="type-eyebrow text-cream/50">
        Contact
      </p>
      <h2
        data-headline
        className="type-section-title mt-[clamp(14px,2vh,22px)] max-w-[620px]"
      >
        Be among the first
        <br />
        to discover
        <br />
        Alam Al Roum
      </h2>

      <div className="mt-[clamp(28px,4vh,48px)] grid grid-cols-1 gap-8 md:grid-cols-[1fr_1fr_auto] md:items-end md:gap-12">
        <address data-item className="not-italic">
          <p className="font-sans text-12 leading-[1.9] tracking-[0.03em] text-cream/50 md:text-16">
            Lusail City
          </p>
          <p className="font-sans text-12 leading-[1.9] tracking-[0.03em] text-cream/50 md:text-16">
            Doha, Qatar
          </p>
        </address>
        <div data-item>
          <p className="font-sans text-12 leading-[1.9] tracking-[0.03em] text-cream/50 md:text-16">
            Sales enquiries
          </p>
          <a
            href="mailto:info@alamalroumegypt.com"
            className="font-sans text-12 leading-[1.9] tracking-[0.03em] text-cream transition-opacity duration-300 hover:opacity-70 md:text-16"
          >
            info@alamalroumegypt.com
          </a>
        </div>
        <div data-item>
          <SweepLink
            href="#lead"
            label="Register Interest"
            className="border-cream/80 text-cream"
            fill="bg-cream"
            hoverText="group-hover:text-ink"
          />
        </div>
      </div>

      <div data-divider className="mt-[clamp(28px,4vh,44px)] mb-[clamp(14px,2vh,22px)] h-px w-full bg-white/10" />

      <div
        data-bottom
        className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
      >
        <p className="font-sans text-12 text-cream/25 md:text-16">
          All rights reserved © Qatari Diar 2026
        </p>
        <div className="flex flex-wrap gap-4 md:gap-7">
          <a
            href="#"
            className="font-sans text-12 text-cream/25 transition-colors duration-300 hover:text-cream md:text-16"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-sans text-12 text-cream/25 transition-colors duration-300 hover:text-cream md:text-16"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </section>
  );
}
