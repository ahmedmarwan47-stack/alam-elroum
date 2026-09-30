"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { lifestyleCards } from "@/lib/lifestyle";

/**
 * Lifestyle, layout C — the horizontal rail.
 *
 * An ordinary section in the page's flow: the eleven cards sit on one row
 * that scrolls sideways on its own — a swipe on a phone, a trackpad swipe,
 * a drag of the scrollbar-less row or the arrows on a desktop — while the
 * page itself scrolls straight past it. It used to pin the page for four
 * screens and turn the vertical scroll into the row's sideways travel;
 * that forced every visitor through all eleven cards to get past it.
 *
 * The counter and the progress bar are the important part: "03 / 11" with a
 * line filling under it, so the end is always in sight. They follow the
 * row's own scroll position.
 *
 * The card here *is* the photograph, so the copy is a caption: the one-line
 * `short` rather than the full body, set small, over a band of scrim at the
 * foot. The full body would take half the picture and there is nowhere for it
 * to go but on top of it.
 */
export default function RailLayout() {
  const row = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const rail = row.current;
    if (!rail) return;
    const n = lifestyleCards.length;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const t = max > 0 ? rail.scrollLeft / max : 0;
      setProgress(t);
      setAt(Math.round(t * (n - 1)));
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /** One card along, either way, for the desktop arrows. */
  const step = (dir: -1 | 1) => {
    const rail = row.current;
    const card = rail?.querySelector("article");
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <div className="relative border-t border-ink/12">
      <div className="flex flex-col bg-cream md:pb-[clamp(48px,7vh,88px)]">
        <div
          className="order-1 flex items-end justify-between gap-6 px-6 pt-10
                     md:px-[clamp(40px,5vw,80px)] md:pt-[clamp(60px,9vh,100px)]"
        >
          <div className="flex flex-col items-start gap-2">
            <span className="type-eyebrow text-ink/40">Lifestyle &amp; Experiences</span>
            <h2 className="type-editorial text-[clamp(22px,3vw,42px)] leading-[1.1] text-ink">
              Experience Greatness
            </h2>
          </div>
          {/* Arrows to step through the rail by mouse — up here beside the
              heading, clear of the floating seals in the corner. */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={dir < 0 ? "Previous experience" : "Next experience"}
                onClick={() => step(dir)}
                disabled={dir < 0 ? progress <= 0.001 : progress >= 0.999}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-ink/25
                           text-ink transition-[background-color,border-color,color,opacity] duration-400
                           hover:border-ink hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"
                    {...(dir > 0 ? { transform: "translate(24 0) scale(-1 1)" } : {})}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* The rail, scrolled natively and snapping card by card at every
            width. */}
        <div className="order-3 mt-5 md:order-2 md:mt-[clamp(20px,3vh,36px)]">
          <div
            ref={row}
            // `scroll-pl-6` matters more than it looks. A snap target aligns
            // to the *snapport*, which is the scrollport minus its scroll
            // padding — not the padding box. Without it, mandatory snapping
            // aligns each card to the bare screen edge: the first card is
            // dragged flush to the border the moment the section settles, the
            // page's own gutter vanishes, and every later card comes to rest a
            // gutter's width short, clipped on the left with the next one
            // showing. Matching it to `px-6` makes the cards settle on the
            // site's grid instead.
            //
            // The gap matches the gutter for the same reason: any narrower and
            // the card you just left stops short of the screen edge, leaving a
            // sliver of it stranded in the margin.
            className="flex snap-x snap-mandatory gap-6 scroll-pl-6 overflow-x-auto px-6 pb-4
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                       md:gap-[clamp(16px,2vw,28px)] md:scroll-pl-[clamp(40px,5vw,80px)]
                       md:px-[clamp(40px,5vw,80px)] md:pb-0"
          >
            {lifestyleCards.map((card) => (
              <article
                key={card.tag}
                data-dark
                // 84vw on a phone, not 76: the card's own measure is what
                // decides whether a title like "Entertainment & Culture" can
                // hold its words together, and at 76vw it could not. The next
                // card still peeks by a clear 36px.
                className="group relative h-[60vh] w-[84vw] shrink-0 snap-start overflow-hidden
                           bg-ink/10 md:h-[min(64vh,600px)] md:w-[clamp(360px,40vw,580px)]"
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 76vw, 40vw"
                  className="object-cover transition-transform duration-[900ms]
                             ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t
                             from-black/85 via-black/45 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                  <h3 className="font-serif text-[min(calc((84vw-32px)/15.5),24px)] leading-[1.05] text-white">
                    {card.headline.join(" ")}
                  </h3>
                  <p className="mt-2.5 max-w-[34ch] font-serif text-12 leading-[1.55] text-white/80 md:text-14">
                    {card.short}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Where you are, and how much is left. On a phone it leads,
            directly under the heading — it is the only thing telling you the
            rail moves sideways at all. On a desktop it trails the rail. */}
        <div
          className="order-2 mt-4 flex items-center gap-4 px-6
                     md:order-3 md:mt-[clamp(20px,3vh,32px)] md:px-[clamp(40px,5vw,80px)]"
        >
          <span className="font-sans text-12 tabular-nums text-ink md:text-16">
            {lifestyleCards[at]?.tag}
            <span className="text-ink/40"> / {lifestyleCards.length}</span>
          </span>
          <span aria-hidden className="relative h-px flex-1 bg-ink/15">
            <span
              className="absolute inset-y-0 left-0 bg-ink"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
