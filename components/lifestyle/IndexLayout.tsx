"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { lifestyleCards, type LifestyleCard } from "@/lib/lifestyle";
import { useMediaQuery, DESKTOP } from "@/lib/useMediaQuery";

/**
 * Lifestyle, layout A — the index, across three screens in a Z.
 *
 * Eleven entries split four / four / three, each panel a full screen: list
 * left and photograph right, then mirrored, then mirrored back. The eye
 * crosses the page on every panel instead of running straight down it, which
 * is what stops three identical screens reading as three of the same thing.
 *
 * The photograph column is flush to the edge of the screen rather than inset
 * on the section's padding — the same full-bleed the original stack uses, so
 * the floating seals sit *on* the picture instead of straddling its border.
 * Only the copy column carries padding.
 *
 * None of that survives one column. Stacked, the list sits above a preview
 * you cannot see while you are tapping it — you choose blind and then scroll
 * to find out what you chose, which is worse than no choice at all. So the
 * phone gets a different thing entirely, below: the same index, but each row
 * opens in place. All eleven titles still visible, and what you pick appears
 * under your thumb.
 */
const GROUPS: Array<{ from: number; to: number }> = [
  { from: 0, to: 4 },
  { from: 4, to: 8 },
  { from: 8, to: 11 },
];

/** Phones: the index as an accordion — the row you open shows its own card. */
function MobileIndex() {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-6 py-14">
      <div data-ix-head className="mb-8 flex flex-wrap items-baseline gap-x-[14px] gap-y-2">
        <span className="font-sans text-12 text-ink/40">Lifestyle &amp; Experiences</span>
        <h2 className="font-serif text-[clamp(26px,7vw,34px)] leading-[1.1] text-ink">
          Eleven Ways to Live Here
        </h2>
      </div>

      <ul className="border-t border-ink/12">
        {lifestyleCards.map((card, i) => {
          const on = i === open;
          return (
            <li key={card.tag} data-ix-row className="border-b border-ink/12">
              <button
                type="button"
                onClick={() => setOpen(on ? -1 : i)}
                aria-expanded={on}
                className="flex w-full items-center gap-3 py-4 text-left"
              >
                <span
                  className={`w-6 shrink-0 font-sans text-12 tabular-nums transition-colors duration-400
                              ${on ? "text-ink" : "text-ink/35"}`}
                >
                  {card.tag}
                </span>
                <span
                  className={`font-serif text-18 leading-[1.2] transition-colors duration-400
                              ${on ? "text-ink" : "text-ink/55"}`}
                >
                  {card.headline.join(" ")}
                </span>
                <span
                  aria-hidden
                  className={`ml-auto shrink-0 transition-transform duration-500
                              ease-[cubic-bezier(0.76,0,0.24,1)] ${on ? "rotate-180" : "rotate-0"}`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              {/* 0fr → 1fr animates to the content's own height without
                  anyone having to measure it. */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500
                            ease-[cubic-bezier(0.16,1,0.3,1)]
                            ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div data-dark className="relative aspect-[4/3] w-full overflow-hidden bg-ink/10">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="pt-4 pb-6 font-serif text-14 leading-[1.7] text-ink/70">
                    {card.body}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Panel({
  cards,
  flipped,
  heading,
}: {
  cards: LifestyleCard[];
  /** Photograph on the left, list on the right — every other panel. */
  flipped: boolean;
  heading: boolean;
}) {
  const [active, setActive] = useState(0);
  const card = cards[active];

  return (
    <section className="grid min-h-screen grid-cols-2 items-stretch">
      {/* Copy column — the only one with padding. */}
      <div
        className={`flex flex-col justify-center px-[clamp(40px,5vw,80px)] py-[clamp(48px,6vh,80px)]
                    ${flipped ? "order-2" : "order-1"}`}
      >
        {heading && (
          <div
            data-ix-head
            className="mb-12 flex flex-wrap items-baseline gap-x-[14px] gap-y-2"
          >
            <span className="font-sans text-16 text-ink/40">Lifestyle &amp; Experiences</span>
            <h2 className="font-serif text-[clamp(26px,3vw,40px)] leading-[1.1] text-ink">
              Eleven Ways to Live Here
            </h2>
          </div>
        )}

        <ul className="border-t border-ink/12">
          {cards.map((item, i) => {
            const on = i === active;
            return (
              <li key={item.tag} data-ix-row className="border-b border-ink/12">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-current={on}
                  className="group flex w-full items-baseline gap-4 py-[clamp(12px,2vh,22px)] text-left"
                >
                  <span
                    className={`w-6 shrink-0 font-sans text-12 tabular-nums transition-colors duration-400
                                ${on ? "text-ink" : "text-ink/35"}`}
                  >
                    {item.tag}
                  </span>
                  <span
                    className={`font-serif text-[clamp(17px,1.8vw,26px)] leading-[1.2] transition-[color,transform]
                                duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                                ${on ? "translate-x-1 text-ink" : "translate-x-0 text-ink/50"}`}
                  >
                    {item.headline.join(" ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Photograph — edge to edge. */}
      <div
        data-dark
        data-ix-panel
        className={`relative overflow-hidden bg-ink/10 ${flipped ? "order-1" : "order-2"}`}
      >
        {cards.map((item, i) => (
          <Image
            key={item.image}
            src={item.image}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* Lifted off the bottom edge: on the mirrored panel this caption sits
            bottom-left, which is exactly where the layout toggle lives. The
            extra air reads as a margin on its own. */}
        <div
          key={active}
          className="relative flex h-full flex-col justify-end p-[clamp(28px,3vw,52px)]
                     pb-[clamp(76px,10vh,112px)]"
        >
          <span className="font-sans text-16 text-white/70">{card.tag}</span>
          <h3
            className="mt-3 animate-[caption-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both]
                       font-serif text-[clamp(24px,3vw,40px)] leading-[1.05] text-white"
          >
            {card.headline.map((line, n) => (
              <span key={n} className="block">
                {line}
              </span>
            ))}
          </h3>
          <span aria-hidden className="mt-5 h-px w-8 bg-white/60" />
          {/* The seals float bottom-right; keep the measure clear of them. */}
          <p
            className="mt-5 max-w-[44ch] animate-[caption-in_0.6s_cubic-bezier(0.16,1,0.3,1)_0.08s_both]
                       font-serif text-16 leading-[1.7] text-white/85 pr-16"
          >
            {card.body}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function IndexLayout() {
  const root = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery(DESKTOP);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context((self) => {
      const q = self.selector;
      if (!q) return;
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } })
        .from("[data-ix-head]", { y: 24, opacity: 0, duration: 0.9, ease: EASE_OUT }, 0)
        .from(
          (q("[data-ix-row]") as HTMLElement[]).slice(0, GROUPS[0].to),
          { x: -14, opacity: 0, duration: 0.7, ease: EASE_OUT, stagger: 0.06 },
          0.15,
        )
        .from((q("[data-ix-panel]") as HTMLElement[])[0], { opacity: 0, duration: 1, ease: EASE_OUT }, 0.2);
    }, root);
    return () => ctx.revert();
  }, [desktop]);

  return (
    <div ref={root} className="border-t border-ink/12 bg-cream">
      {desktop ? (
        GROUPS.map((group, i) => (
          <Panel
            key={group.from}
            cards={lifestyleCards.slice(group.from, group.to)}
            flipped={i % 2 === 1}
            heading={i === 0}
          />
        ))
      ) : (
        <MobileIndex />
      )}
    </div>
  );
}
