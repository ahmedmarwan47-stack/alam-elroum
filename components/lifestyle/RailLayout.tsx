"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, clamp01 } from "@/lib/gsap";
import { lifestyleCards } from "@/lib/lifestyle";

/**
 * Lifestyle, layout C — the horizontal rail.
 *
 * One pinned screen with the eleven cards travelling sideways across it, so
 * the section keeps a signature feel and still costs four viewports instead
 * of twelve. The counter and the progress bar are the important part: the
 * stack never tells you how far in you are, and this does — "03 / 11" with a
 * line filling under it, so the end is always in sight.
 *
 * On phones it drops the pinning entirely and becomes an ordinary swipeable
 * rail with scroll snapping — pinned horizontal scroll fights the thumb.
 *
 * The card here *is* the photograph, so the copy is a caption: the one-line
 * `short` rather than the full body, set small, over a band of scrim at the
 * foot. The full body would take half the picture and there is nowhere for it
 * to go but on top of it.
 */
export default function RailLayout() {
  const outer = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = outer.current;
    const rail = row.current;
    if (!el || !rail) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const n = lifestyleCards.length;

    // How far the row has to travel for its last card to reach the right
    // edge. Re-measured on refresh, since it depends on the card width, which
    // is a clamp against the viewport.
    let travel = 0;
    const measure = () => {
      travel = desktop.matches
        ? Math.max(0, rail.scrollWidth - window.innerWidth)
        : 0;
    };

    const apply = (p: number) => {
      const t = clamp01(p);
      setProgress(t);
      setAt(Math.round(t * (n - 1)));
      rail.style.transform = desktop.matches
        ? `translate3d(${(-travel * t).toFixed(2)}px, 0, 0)`
        : "";
    };

    // Phones scroll the rail themselves, so the counter reads its own scroll
    // position there. The vertical track is desktop-only: on a phone the
    // outer div is barely taller than the viewport, so its progress runs
    // 0 → 1 almost at once and the counter would sit on "11 / 11" from the
    // first frame.
    const fromRail = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      apply(max > 0 ? rail.scrollLeft / max : 0);
    };

    const sync = (p: number) => {
      measure();
      if (desktop.matches) apply(p);
      else fromRail();
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (desktop.matches) apply(self.progress);
      },
      onRefresh: (self) => sync(self.progress),
    });
    sync(st.progress);

    const onScroll = () => {
      if (!desktop.matches) fromRail();
    };
    rail.addEventListener("scroll", onScroll, { passive: true });

    // Crossing the breakpoint swaps which of the two drives the rail; the
    // transform has to be cleared on the way down or the row stays shunted
    // sideways while the phone tries to scroll it.
    const onBreakpoint = () => {
      rail.style.transform = "";
      sync(st.progress);
      ScrollTrigger.refresh();
    };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      st.kill();
      rail.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, []);

  return (
    <div ref={outer} className="relative border-t border-ink/12 md:h-[400vh]">
      <div
        className="flex flex-col bg-cream
                   md:sticky md:top-0 md:h-screen md:overflow-hidden"
      >
        <div
          // The stage is pinned under a fixed 80px header, so the heading has
          // to start below it. The floor is a px value and not a vh one on
          // purpose: the header does not get shorter on a short screen, so a
          // purely proportional value would slide back under it on a laptop.
          className="order-1 flex flex-wrap items-baseline gap-x-[14px] gap-y-2 px-6 pt-14
                     md:px-[clamp(40px,5vw,80px)] md:pt-[clamp(108px,14vh,148px)]"
        >
          <span className="font-sans text-12 text-ink/40 md:text-16">Lifestyle &amp; Experiences</span>
          <h2 className="font-serif text-[clamp(26px,3vw,40px)] leading-[1.1] text-ink">
            Eleven Ways to Live Here
          </h2>
        </div>

        {/* The rail. Phones scroll it natively with snapping; from md up the
            scroll position is driven by the pinned track above. */}
        <div className="order-3 mt-6 md:order-2 md:mt-0 md:flex md:flex-1 md:items-stretch md:overflow-hidden">
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
                       md:snap-none md:gap-[clamp(16px,2vw,28px)] md:overflow-x-visible
                       md:px-[clamp(40px,5vw,80px)] md:py-[clamp(12px,2vh,28px)]
                       md:will-change-transform"
          >
            {lifestyleCards.map((card) => (
              <article
                key={card.tag}
                data-dark
                // `md:h-auto` — a flex item that stretches. The card is then
                // as tall as the stage has room for, whatever the heading and
                // the counter leave behind, at any viewport height.
                className="group relative h-[60vh] w-[76vw] shrink-0 snap-start overflow-hidden
                           bg-ink/10 md:h-auto md:w-[clamp(360px,40vw,580px)]"
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
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="font-serif text-20 leading-[1.05] text-white md:text-24">
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

        {/* Where you are, and how much is left — the thing the stack never
            says. On a phone it leads, directly under the heading: at the foot
            it was buried behind the toggle and the floating seals, and it is
            the only thing telling you the rail moves sideways at all. On a
            desktop it trails, high enough to clear the toggle — on its own
            the extra air reads as a margin, not a gap. */}
        <div
          className="order-2 mt-5 flex items-center gap-4 px-6 pb-14
                     md:order-3 md:mt-0 md:px-[clamp(40px,5vw,80px)] md:pb-[clamp(64px,9vh,104px)]"
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
