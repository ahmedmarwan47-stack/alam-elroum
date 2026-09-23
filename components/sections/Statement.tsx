"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import MasterplanDrawer, { type MasterplanPlace } from "@/components/MasterplanDrawer";

type MasterplanPin = MasterplanPlace & {
  x: number;
  y: number;
};

const MASTERPLAN_PINS: MasterplanPin[] = [
  {
    title: "The Arrival Gateway",
    category: "First Impression",
    scenes: [
      {
        image: "/images/image-11.jpg",
        description:
          "The western gateway marks the transition from the coastal road into Alam Al Roum—a calm, landscaped arrival that reveals the city gradually.",
      },
      {
        image: "/images/ls-smart.jpg",
        description:
          "Beyond the arrival, intelligent infrastructure and autonomous mobility connect every district without interrupting the landscape.",
      },
      {
        image: "/images/masterplan-aerial.jpg",
        description:
          "From the gateway, the central boulevard becomes the city’s organizing spine, running clearly toward the Mediterranean waterfront.",
      },
    ],
    x: 24,
    y: 40,
  },
  {
    title: "The Town Centre",
    category: "Urban Life",
    scenes: [
      {
        image: "/images/ls-town.jpg",
        description:
          "A walkable mixed-use heart brings homes, shaded streets, cafés, retail, and public gardens together around the water.",
      },
      {
        image: "/images/ls-canals.jpg",
        description:
          "A network of canals draws the water into the centre, lining everyday routes with cafés, promenades, and shaded gathering places.",
      },
      {
        image: "/images/ls-hotel.jpg",
        description:
          "Hospitality, residences, and public life meet at an urban scale designed to remain active well beyond the summer season.",
      },
    ],
    x: 51,
    y: 34,
  },
  {
    title: "The Lighthouse & Marina",
    category: "The Waterfront",
    scenes: [
      {
        image: "/images/ls-marina.jpg",
        description:
          "The defining waterfront destination pairs Alam Al Roum’s new landmark with an international marina and a lively promenade at the end of the central boulevard.",
      },
      {
        image: "/images/image-18.jpg",
        description:
          "The Lighthouse rises at the meeting point of boulevard, marina, and sea—a contemporary marker visible across the city and coastline.",
      },
      {
        image: "/images/ls-iconic.jpg",
        description:
          "From inland, the city’s main axis frames the landmark and open water, keeping the Mediterranean present throughout the journey.",
      },
    ],
    x: 63,
    y: 53,
  },
  {
    title: "The Mediterranean Pier",
    category: "Beachfront Experience",
    scenes: [
      {
        image: "/images/sea-pier.jpg",
        description:
          "A sculptural pier reaches into clear Mediterranean water, creating a quiet place for swimming, gathering, and uninterrupted views along the coast.",
      },
      {
        image: "/images/ls-beach.jpg",
        description:
          "The pier joins a generous beachfront landscape where gardens, walking paths, and clear water shape the rhythm of the day.",
      },
      {
        image: "/images/s9-sailboat.jpg",
        description:
          "Beyond the shore, open-water experiences extend the life of the city into the Mediterranean—from sailing to quiet sunrise crossings.",
      },
    ],
    x: 46,
    y: 70,
  },
];

/**
 * Section 06 — Masterplan statement. A compact heading and the interactive
 * aerial render share a single full-viewport composition.
 *
 * Mirrors the original `.s6`: the header slides in from the right, the image
 * follows 0.2s later on a longer travel, and the picture itself settles from a
 * slight zoom so the two movements read as one gesture. Inside the header the
 * tag leads with a tiny left-to-right slide and the headline pulls into focus.
 */
export default function Statement() {
  const root = useRef<HTMLElement>(null);
  const [activePin, setActivePin] = useState<number | null>(null);
  const [shownPin, setShownPin] = useState(0);

  const openPin = (index: number) => {
    setShownPin(index);
    setActivePin(index);
  };
  const closePin = useCallback(() => setActivePin(null), []);
  const showAdjacentPin = useCallback((direction: -1 | 1) => {
    const next = (shownPin + direction + MASTERPLAN_PINS.length) % MASTERPLAN_PINS.length;
    setShownPin(next);
    setActivePin(next);
  }, [shownPin]);

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
        )
        .fromTo(
          "[data-map-pin]",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, stagger: 0.08, ease: EASE_OUT },
          0.75,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="s6"
      className="relative flex h-[100svh] flex-col overflow-hidden bg-cream"
    >
      <div
        data-s6-header
        className="flex shrink-0 flex-col items-start gap-2 px-6 pt-15 pb-7
                   md:gap-3.5 md:px-20 md:pt-28 md:pb-10"
      >
        <span data-s6-tag className="type-eyebrow whitespace-nowrap text-ink/50">
          The Masterplan
        </span>
        <h2 data-s6-title className="type-section-title max-w-[900px] text-ink">
          A sense of place defined by urban coastal living.
        </h2>
      </div>

      <div
        data-s6-image
        data-dark
        className="relative min-h-0 w-full flex-1 overflow-hidden bg-ink"
      >
        <Image
          src="/images/masterplan-aerial.jpg"
          alt="Aerial render of the Alam Al Roum masterplan"
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div aria-hidden className="absolute inset-0 bg-ink/8" />

        {MASTERPLAN_PINS.map((pin, index) => (
          <button
            key={pin.title}
            type="button"
            data-map-pin
            aria-label={`Explore ${pin.title}`}
            aria-pressed={activePin === index}
            onClick={() => openPin(index)}
            className="group absolute z-20 h-14 w-12 -translate-x-1/2 -translate-y-full
                       focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span aria-hidden className="absolute bottom-0 left-1/2 h-2 w-7 -translate-x-1/2 rounded-full bg-ink/35 blur-[3px]" />
            <span
              aria-hidden
              className={`absolute top-0 left-1/2 flex h-11 w-11 -translate-x-1/2
                         items-center justify-center will-change-transform
                         transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                         group-hover:-translate-y-2 group-hover:scale-110
                         ${activePin === index ? "-translate-y-2 scale-110" : ""}`}
            >
              <span
                className={`flex h-full w-full rotate-[-45deg] items-center justify-center
                           rounded-[50%_50%_50%_0] border-2 border-cream bg-qatar-purple
                           shadow-[0_8px_22px_rgba(28,43,58,0.4)]
                           transition-[background-color,box-shadow] duration-500
                           ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-rust
                           group-hover:shadow-[0_12px_28px_rgba(28,43,58,0.32)]
                           ${
                             activePin === index
                               ? "bg-rust shadow-[0_12px_28px_rgba(28,43,58,0.32)]"
                               : ""
                           }`}
              >
                <span className="h-2.5 w-2.5 rounded-full border-2 border-cream bg-transparent" />
              </span>
            </span>

            <span
              className={`pointer-events-none absolute bottom-[calc(100%+48px)] left-1/2 z-30 flex
                         -translate-x-1/2 translate-y-5 scale-[0.94] items-end opacity-0
                         transition-[opacity,transform] delay-0 duration-500
                         ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0
                         group-hover:scale-100 group-hover:opacity-100 group-hover:delay-75
                         group-focus-visible:translate-y-0 group-focus-visible:scale-100
                         group-focus-visible:opacity-100
                         ${activePin === index ? "translate-y-0 scale-100 opacity-100 delay-75" : ""}`}
            >
              {pin.scenes.slice(0, 2).map((scene, previewIndex) => (
                <span
                  key={scene.image}
                  className={`relative block h-20 w-28 overflow-hidden border-2 border-cream shadow-xl
                              will-change-transform transition-transform duration-500
                              ease-[cubic-bezier(0.22,1,0.36,1)]
                              ${
                                previewIndex === 0
                                  ? `z-10 translate-x-2 translate-y-2 rotate-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-[-4deg] ${activePin === index ? "translate-x-0 translate-y-0 rotate-[-4deg]" : ""}`
                                  : `-ml-5 -translate-x-2 translate-y-4 rotate-0 group-hover:translate-x-0 group-hover:translate-y-2 group-hover:rotate-[4deg] ${activePin === index ? "translate-x-0 translate-y-2 rotate-[4deg]" : ""}`
                              }`}
                >
                  <Image
                    src={scene.image}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </span>
              ))}
            </span>
            <span
              className={`pointer-events-none absolute top-[calc(100%+5px)] left-1/2
                         -translate-x-1/2 translate-y-2 whitespace-nowrap bg-cream px-3 py-2
                         font-sans text-12 tracking-[0.04em] text-ink opacity-0 shadow-lg
                         transition-[opacity,transform] delay-0 duration-500
                         ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0
                         group-hover:opacity-100 group-hover:delay-75 group-focus-visible:translate-y-0
                         group-focus-visible:opacity-100
                         ${activePin === index ? "translate-y-0 opacity-100 delay-75" : ""}`}
            >
              {pin.title}
            </span>
          </button>
        ))}
      </div>

      <MasterplanDrawer
        place={MASTERPLAN_PINS[shownPin]}
        open={activePin !== null}
        onClose={closePin}
        onPreviousPlace={() => showAdjacentPin(-1)}
        onNextPlace={() => showAdjacentPin(1)}
        placeIndex={shownPin}
        placeCount={MASTERPLAN_PINS.length}
      />
    </section>
  );
}
