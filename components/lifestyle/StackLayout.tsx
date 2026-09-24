"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ScrollTrigger, clamp01, easeInOutQuad, easeOutCubic } from "@/lib/gsap";
import { lifestyleCards } from "@/lib/lifestyle";

/**
 * Section 08 — Lifestyle, the original layout: the full-height stack.
 *
 * The longest thing on the page by a distance — twelve viewports, two fifths
 * of the whole scroll — which is what the layout toggle exists to compare
 * against. See <LifestyleSwitcher>.
 *
 * Eleven absolutely-positioned cards sharing one sticky viewport, each
 * sliding up over the one before. The outer track is (cards + 1) × 100vh:
 * card 1 slides in during the viewport *before* the stage pins, the last card
 * lands one viewport before the track ends, and the remainder is dwell.
 *
 * Each card owns one viewport of scroll. The hand-over runs in two beats:
 *   1. the card on screen recedes — sinks, shrinks and tips away from the
 *      viewer about its top edge — its copy dims and the whole card softens
 *      into a 14px blur, all while still fully in view;
 *   2. only then does the next card slide up over it on an ease-out cubic,
 *      its photograph settling from a 1.06 scale and its copy fading up once
 *      it has landed (tag to 0.4, divider to 0.2, body to 0.65 — the
 *      original's resting opacities).
 * Cards buried deeper stay parked in the receded state. The last card has
 * nothing coming over it, so it holds still.
 */
const REST = { tag: 0.4, head: 1, divider: 0.2, body: 0.65 };
const DIM = { tag: 0.18, head: 0.5, divider: 0.08, body: 0.3 };

type Parts = {
  card: HTMLElement;
  tag: HTMLElement;
  head: HTMLElement;
  divider: HTMLElement;
  body: HTMLElement;
  img: HTMLElement;
};

export default function StackLayout() {
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;

    const parts: Parts[] = Array.from(
      el.querySelectorAll<HTMLElement>("[data-card]"),
    ).map((card) => ({
      card,
      tag: card.querySelector<HTMLElement>("[data-tag]")!,
      head: card.querySelector<HTMLElement>("[data-head]")!,
      divider: card.querySelector<HTMLElement>("[data-divider]")!,
      body: card.querySelector<HTMLElement>("[data-body]")!,
      img: card.querySelector<HTMLElement>("[data-img]")!,
    }));
    const n = parts.length;

    const apply = (progress: number) => {
      const s = progress * (n + 1); // viewports scrolled since card 1 began entering
      parts.forEach((pt, i) => {
        const p = s - i; // this card's own viewport of travel, 0..1 while entering
        const next = s - (i + 1); // the same for the card after it
        // How far through the hand-over to the next card we are, 0..1.
        // The last card has nothing coming over it, so it simply holds.
        const cover = i === n - 1 ? 0 : clamp01(next);
        // Beat one: this card recedes and blurs away while still fully in view.
        const late = easeInOutQuad(clamp01((cover - 0.1) / 0.5));
        const blur = 14 * late;
        // Beat two: only then does the next card slide up over it. The slide
        // maps the tail of the card's own travel so the two never overlap.
        const slide = easeOutCubic(clamp01((p - 0.45) / 0.55));

        if (p < 1) {
          pt.card.style.transform = `translate3d(0, ${((1 - slide) * 100).toFixed(3)}%, 0)`;
          pt.card.style.opacity = "1";
          pt.card.style.filter = "";
        } else {
          // Recede: sink, shrink and tip away from the viewer about the top edge.
          pt.card.style.transform =
            `translate3d(0, ${(-28 * late).toFixed(2)}px, ${(-120 * late).toFixed(1)}px) ` +
            `scale(${(1 - 0.05 * late).toFixed(4)}) rotateX(${(-9 * late).toFixed(2)}deg)`;
          pt.card.style.opacity = String(1 - 0.18 * late);
          pt.card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
        }

        // Copy — fades up on entry, then dims as the next card pushes this one back.
        const c = easeOutCubic(clamp01((p - 0.6) / 0.4));
        const mix = (rest: number, dim: number) => (rest + (dim - rest) * late) * c;
        pt.tag.style.opacity = String(mix(REST.tag, DIM.tag));
        pt.head.style.opacity = String(mix(REST.head, DIM.head));
        pt.head.style.transform = `translate3d(0, ${(30 * (1 - c)).toFixed(2)}px, 0)`;
        pt.divider.style.opacity = String(mix(REST.divider, DIM.divider));
        pt.body.style.opacity = String(mix(REST.body, DIM.body));
        pt.body.style.transform = `translate3d(0, ${(20 * (1 - c)).toFixed(2)}px, 0)`;

        // Photograph — opaque from the first frame so nothing shows through it.
        pt.img.style.opacity = "1";
        pt.img.style.transform = `scale(${(1.06 - 0.06 * slide).toFixed(4)})`;
      });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);

    return () => st.kill();
  }, []);

  return (
    <div
      ref={outer}
      className="relative"
      style={{ height: `${(lifestyleCards.length + 1) * 100}vh` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden bg-cream"
        style={{ perspective: "1400px" }}
      >
        {lifestyleCards.map((card, i) => (
          <section
            key={card.tag}
            data-card
            id={`ls${i + 1}`}
            className="absolute inset-0 grid origin-top grid-cols-1 grid-rows-[1fr_1fr]
                       overflow-hidden will-change-transform md:grid-cols-2 md:grid-rows-1"
            style={{ zIndex: i + 1, transform: "translate3d(0, 100%, 0)" }}
          >
            {/* Copy */}
            <div
              className={`relative z-1 flex flex-col justify-center overflow-hidden bg-cream
                          px-6 pt-18 pb-6 md:px-[clamp(48px,6vw,88px)] md:py-[clamp(60px,8vw,120px)]
                          ${card.reversed ? "md:order-2" : "md:order-1"}`}
            >
              <span
                data-tag
                className="mb-6 font-sans text-12 text-ink opacity-0 md:text-16"
              >
                {card.tag}
              </span>
              <h2
                data-head
                className="mb-[10px] font-serif text-[clamp(22px,5.8vw,34px)] leading-[1.05]
                           font-normal text-ink opacity-0 will-change-[transform,opacity]
                           md:mb-7 md:text-[clamp(24px,2.7vw,40px)]"
              >
                {card.headline.map((line, n) => (
                  <span key={n} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <div data-divider className="mb-6 h-px w-8 bg-ink opacity-0" />
              <p
                data-body
                className="font-serif text-12 leading-[1.6] text-ink opacity-0
                           will-change-[transform,opacity] md:max-w-[360px] md:text-16
                           md:leading-[1.7] md:text-[clamp(15px,1.15vw,17px)]"
              >
                {card.body}
              </p>
            </div>

            {/* Photograph — overfilled by 2% a side so the renders' feathered
                edges clip away instead of showing a light seam. */}
            <div
              data-dark
              className={`relative overflow-hidden border-t-8 border-cream md:border-t-0
                          ${card.reversed ? "md:order-1" : "md:order-2"}`}
            >
              <div
                data-img
                className="absolute -inset-[2%] will-change-transform"
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
