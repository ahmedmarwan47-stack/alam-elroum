"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

const CITIES = [
  { city: "Doha", time: "2.5 hrs" },
  { city: "Rome", time: "3.5 hrs" },
  { city: "Riyadh", time: "4 hrs" },
  { city: "Dubai", time: "4 hrs" },
  { city: "London", time: "5 hrs" },
  { city: "Paris", time: "5 hrs" },
];

const LINKS = [
  ["INTERNATIONAL COASTAL ROAD", "Direct access from Cairo and the wider Egyptian network."],
  ["RAS EL HEKMA AIRPORT", "The nearest international gateway, minutes away."],
  ["MARSA MATROUH INTERNATIONAL AIRPORT", "Established regional air access."],
  ["FUTURE HIGH-SPEED RAIL", "Integration into the national rail network under development."],
  ["INTEGRATED MARINA", "International yachting access connecting the Mediterranean network."],
];

/** `.connect-subhead` — italic tag beside a bold, tracked heading. */
function SubHead({ tag, heading }: { tag: string; heading: string }) {
  return (
    <div data-subhead className="mb-[clamp(20px,3vh,36px)] flex items-baseline gap-3.5">
      <span
        data-subhead-tag
        className="shrink-0 font-sans text-12 text-ink/40 md:text-16"
      >
        {tag}
      </span>
      <span className="font-sans text-16 leading-[1.35] font-bold tracking-[0.08em] text-ink uppercase">
        {heading}
      </span>
    </div>
  );
}

/**
 * Section 09 — Connectivity: flight radius, then the routes into Egypt.
 *
 * Mirrors the original `.connect-section`: the whole panel rises 24px on the
 * site's ease-out once the section is 80% up the viewport. On top of that the
 * contents cascade in — sub-head, cities, sea band, then the Egypt items —
 * with the city hairlines drawing in from the left, the italic tags leading
 * each sub-head with a tiny slide, and the sea band settling from a slight
 * zoom inside its clipped wrapper.
 */
export default function Connect() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE_OUT },
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });

      const subheads = gsap.utils.toArray<HTMLElement>("[data-subhead]");
      const tagOf = (subhead: HTMLElement | undefined) =>
        subhead?.querySelector<HTMLElement>("[data-subhead-tag]") ?? [];

      tl.from("[data-panel]", { y: 24, opacity: 0, duration: 0.9 }, 0)
        .from(subheads[0], { y: 24, opacity: 0, duration: 0.8 }, 0.05)
        .from(tagOf(subheads[0]), { x: -8, opacity: 0, duration: 0.8 }, 0.05)
        .from("[data-city]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.12)
        .from(
          "[data-city-line]",
          {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1,
            ease: EASE_OUT,
            stagger: 0.06,
          },
          0.12,
        )
        .from("[data-band]", { y: 24, opacity: 0, duration: 0.8 }, 0.45)
        .fromTo(
          "[data-band] img",
          { scale: 1.06 },
          { scale: 1, duration: 1.4, ease: EASE_OUT },
          0.45,
        )
        .from(subheads[1], { y: 24, opacity: 0, duration: 0.8 }, 0.55)
        .from(tagOf(subheads[1]), { x: -8, opacity: 0, duration: 0.8 }, 0.55)
        .from("[data-item]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.62);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="connectSection"
      className="border-t border-ink/12 bg-cream px-6 pt-16 pb-14
                 md:px-[clamp(40px,5vw,80px)] md:py-[clamp(60px,8vh,100px)]"
    >
      <div data-panel className="relative w-full">
        {/* Flight radius */}
        <SubHead tag="Locations" heading="WITHIN A 5-HOUR FLIGHT RADIUS" />
        <div
          className="mb-[clamp(28px,4vw,48px)] grid grid-cols-2 gap-x-5
                     md:grid-cols-3 md:gap-x-[clamp(24px,4vw,64px)]"
        >
          {CITIES.map(({ city, time }, i) => (
            <div
              key={city}
              data-city
              className="relative flex items-baseline justify-between gap-3 py-[clamp(8px,1vw,14px)]"
            >
              <span className="font-serif text-[clamp(24px,7vw,38px)] leading-none tracking-[0.01em] text-ink md:text-[clamp(26px,3vw,48px)]">
                {city}
              </span>
              <span className="font-sans text-12 tracking-[0.04em] whitespace-nowrap text-ink/50 md:text-16">
                {time}
              </span>
              {/* Hairline: every city on mobile, only the top row on desktop
                  (`.connect-city:nth-child(n+4) { border-bottom: none }`). */}
              <span
                data-city-line
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-ink/15 ${
                  i >= 3 ? "md:hidden" : ""
                }`}
              />
            </div>
          ))}
        </div>

        {/* Sea band */}
        <div
          data-band
          className="relative mb-[clamp(28px,4vw,48px)] h-[clamp(120px,16vw,220px)]
                     w-full overflow-hidden rounded-[10px]"
        >
          <Image
            src="/images/connect-water.jpg"
            alt="Mediterranean water"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Connected to Egypt */}
        <SubHead tag="Locations" heading="CONNECTED TO EGYPT" />
        <div
          className="grid grid-cols-1 gap-y-[22px]
                     md:grid-cols-2 md:gap-x-[clamp(32px,5vw,80px)] md:gap-y-[clamp(20px,3vw,32px)]"
        >
          {LINKS.map(([title, desc]) => (
            <div key={title} data-item>
              <h3 className="mb-1.5 block font-sans text-12 font-bold tracking-[0.09em] text-ink uppercase md:text-16">
                {title}
              </h3>
              <p className="font-sans text-16 leading-[1.55] text-ink/75">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
