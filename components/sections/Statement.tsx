"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

/** The masterplan render's own proportions: the frame keeps them, so nothing is cropped. */
const PLAN = { src: "/images/masterplan-aerial.jpg", width: 2400, height: 1340 };

type MasterplanPin = {
  label: string;
  /** Where the pin's point lands, in % of the render's width and height. */
  x: number;
  y: number;
  kind: "usp" | "gate";
};

const usp = (label: string, x: number, y: number): MasterplanPin => ({ label, x, y, kind: "usp" });
const gate = (n: number, x: number, y: number): MasterplanPin => ({ label: `Gate ${n}`, x, y, kind: "gate" });

/*
 * From the client's "Project Masterplan USP's" board: the blue pins are the
 * USPs, the red ones the gates. The board is drawn on the flat plan; this is
 * the angled aerial, seen from over the sea — west (the golf) on the right,
 * the inland highway along the top — and it is not a true projection of the
 * plan, so each pin was placed by eye on its landmark: the gates on the
 * highway and on the road beside the old village, the beaches on the sand,
 * the marina in its basin, the lagoons and the boulevard on theirs.
 */
const MASTERPLAN_PINS: MasterplanPin[] = [
  usp("18-Hole Golf Course", 82.5, 22.0),
  usp("Vibrant Town Center", 72.9, 23.5),
  usp("Vibrant Town Center", 35.8, 32.1),
  usp("Open-Sea Lagoon & Continuous Promenade", 68.8, 30.2),
  usp("Commercial Boulevard", 57.1, 31.3),
  usp("International & Local Marina", 65.0, 52.2),
  usp("7km Beach & Promenade", 79.2, 38.4),
  usp("7km Beach & Promenade", 50.0, 59.3),
  usp("Neighborhood Swimmable Lagoons", 68.3, 17.9),
  usp("Neighborhood Swimmable Lagoons", 61.3, 20.1),
  usp("Neighborhood Swimmable Lagoons", 39.6, 30.6),
  usp("Freezone", 60.0, 16.0),
  usp("Polo & Equestrian Club", 64.2, 14.9),
  usp("Events Center", 67.3, 44.8),
  usp("Expo Center", 50.0, 28.0),
  usp("Postgrad University Campus", 30.6, 33.2),
  gate(1, 81.7, 11.2),
  gate(2, 67.7, 12.7),
  gate(3, 59.2, 13.6),
  gate(4, 48.3, 20.0),
  gate(5, 35.2, 28.4),
  gate(6, 22.7, 36.4),
  gate(7, 25.0, 48.5),
];

/**
 * The board's two pin colours: at rest, and the deeper shade each shifts to
 * on hover — the way the original purple pin turned rust.
 */
const KIND = {
  usp: { rest: "bg-[#4a7fc7]", on: "bg-[#2c5a9e]", hover: "group-hover:bg-[#2c5a9e]" },
  gate: { rest: "bg-[#c0121b]", on: "bg-[#8a0a12]", hover: "group-hover:bg-[#8a0a12]" },
} as const;

/**
 * Section 06 — Masterplan statement. A compact heading over the aerial
 * render, shown whole — never cropped, so no pin is ever cut off — with the
 * USPs and gates pinned on it. Each pin names its place on hover with a
 * mouse, on tap on a touch screen.
 *
 * Desktop: the render runs full width at its own proportions. Phone: at full
 * width it would be too small to read, so it keeps a readable height and
 * scrolls sideways, starting from the middle.
 *
 * Mirrors the original `.s6`: the header slides in from the right, the image
 * follows 0.2s later on a longer travel, and the picture itself settles from a
 * slight zoom so the two movements read as one gesture. Inside the header the
 * tag leads with a tiny left-to-right slide and the headline pulls into focus;
 * the pins pop in last.
 */
export default function Statement() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  /** The pin tapped open on a touch screen (a mouse just hovers). */
  const [tapped, setTapped] = useState<number | null>(null);

  // On a phone the render is wider than the screen: open on its middle.
  useEffect(() => {
    const el = scroller.current;
    const plan = el?.firstElementChild as HTMLElement | null;
    if (el && plan) el.scrollLeft = (plan.offsetWidth - el.clientWidth) / 2;
  }, []);

  // A tap anywhere off the pins puts the open label away.
  useEffect(() => {
    if (tapped === null) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-map-pin]")) setTapped(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [tapped]);

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
    <section ref={root} id="s6" className="relative overflow-hidden bg-cream">
      <div
        data-s6-header
        className="flex flex-col items-start gap-2 px-6 pt-15 pb-7
                   md:gap-3.5 md:px-20 md:pt-28 md:pb-10"
      >
        <span data-s6-tag className="type-eyebrow whitespace-nowrap text-ink/50">
          The Masterplan
        </span>
        <h2 data-s6-title className="type-section-title max-w-[900px] text-ink">
          A sense of place defined by urban coastal living.
        </h2>
        <p className="type-meta text-ink/50 md:hidden">Swipe to explore the plan</p>
      </div>

      <div
        ref={scroller}
        data-s6-image
        data-dark
        className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain bg-ink
                   [scrollbar-width:none] md:overflow-hidden [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="relative h-[min(62svh,460px)] overflow-hidden md:h-auto md:w-full"
          style={{ aspectRatio: `${PLAN.width} / ${PLAN.height}` }}
        >
          <Image
            src={PLAN.src}
            alt="Aerial render of the Alam Al Roum masterplan"
            fill
            sizes="(max-width: 768px) 830px, 100vw"
            className="object-cover"
            draggable={false}
          />

          <div aria-hidden className="absolute inset-0 bg-ink/8" />

          {MASTERPLAN_PINS.map((pin, index) => {
            const open = tapped === index;
            const kind = KIND[pin.kind];
            // The original pin, at about 70% of its size.
            return (
              <button
                key={`${pin.label}-${index}`}
                type="button"
                data-map-pin
                aria-label={pin.label}
                aria-expanded={open}
                // A mouse hovers; a finger has no hover, so a tap shows the name.
                onPointerUp={(event) => {
                  if (event.pointerType !== "mouse") setTapped(open ? null : index);
                }}
                className={`group absolute h-10 w-9 -translate-x-1/2 -translate-y-full cursor-default
                            focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream
                            ${open ? "z-30" : "z-20 hover:z-30 focus-visible:z-30"}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span
                  aria-hidden
                  className="absolute bottom-0 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-ink/35 blur-[3px]"
                />
                <span
                  aria-hidden
                  className={`absolute top-0 left-1/2 flex h-8 w-8 -translate-x-1/2
                              items-center justify-center will-change-transform
                              transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                              group-hover:-translate-y-2 group-hover:scale-110
                              ${open ? "-translate-y-2 scale-110" : ""}`}
                >
                  <span
                    className={`flex h-full w-full rotate-[-45deg] items-center justify-center
                                rounded-[50%_50%_50%_0] border-2 border-cream
                                shadow-[0_8px_22px_rgba(28,43,58,0.4)]
                                transition-[background-color,box-shadow] duration-500
                                ease-[cubic-bezier(0.22,1,0.36,1)] ${kind.hover}
                                group-hover:shadow-[0_12px_28px_rgba(28,43,58,0.32)]
                                ${open ? `${kind.on} shadow-[0_12px_28px_rgba(28,43,58,0.32)]` : kind.rest}`}
                  >
                    <span className="h-2 w-2 rounded-full border-2 border-cream bg-transparent" />
                  </span>
                </span>

                <span
                  className={`pointer-events-none absolute top-[calc(100%+5px)] left-1/2
                              -translate-x-1/2 translate-y-2 whitespace-nowrap bg-cream px-3 py-2
                              font-sans text-12 tracking-[0.04em] text-ink opacity-0 shadow-lg
                              transition-[opacity,transform] delay-0 duration-500
                              ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0
                              group-hover:opacity-100 group-hover:delay-75 group-focus-visible:translate-y-0
                              group-focus-visible:opacity-100
                              ${open ? "translate-y-0 opacity-100 delay-75" : ""}`}
                >
                  {pin.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
