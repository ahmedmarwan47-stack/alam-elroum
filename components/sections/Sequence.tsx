"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, clamp01, easeInOutQuad, easeOutQuad, reducedMotion } from "@/lib/gsap";

/**
 * Section 04 — Landmark of Return / the developer.
 *
 * A 250vh track pinning one viewport through two beats that dissolve into
 * each other. Everything here is a pure function of scroll progress: nothing
 * flips at a threshold, so the swap runs at the speed of your hand and comes
 * apart again cleanly if you scroll back up.
 *
 * The beats overlap rather than queue, which is what makes it read as one
 * movement instead of three separate ones:
 *
 *   0.00–0.07  the "A Landmark of Return" copy rises in over the headland,
 *              straight off the hand-off — section 03's headline has only
 *              just cleared
 *   0.40–0.50  it lifts away and blurs out — the picture is alone for a beat
 *   0.46–0.64  the Lusail skyline dissolves in on top, the headland drifting
 *              very slightly wider beneath it as it goes
 *   0.60–0.72  the Qatari Diar block rises into the corner the first one left
 *
 * The dissolve is one-sided on purpose. Both frames are full bleed and the
 * skyline is stacked above, so fading *it* in over a headland that stays
 * opaque avoids the luminance dip you get from cross-fading two layers past
 * each other at 50/50.
 *
 * The track is pulled up a full viewport so it pins at the exact scroll where
 * section 03 stops pinning, and 03 hides itself there (`handOff`). Without
 * that the reader met the same photograph twice — once as 03 scrolled it away
 * and again as this section brought an identical copy back up — with a dead
 * viewport of scrolling in between. The picture arrives once, and the copy
 * follows straight on.
 */
export default function Sequence() {
  const track = useRef<HTMLDivElement>(null);
  const imgA = useRef<HTMLImageElement>(null);
  const imgB = useRef<HTMLImageElement>(null);
  const copyA = useRef<HTMLDivElement>(null);
  const copyB = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const trackEl = track.current;
    const a = imgA.current;
    const b = imgB.current;
    const ca = copyA.current;
    const cb = copyB.current;
    if (!trackEl || !a || !b || !ca || !cb) return;

    const reduced = reducedMotion();

    /**
     * One block of copy at a given strength: `v` 0 → 1 rises it into place,
     * `out` 0 → 1 lifts it away again. Hidden outright at either end so a
     * block nobody can see cannot be tabbed into either.
     */
    const place = (el: HTMLElement, v: number, out: number) => {
      const o = v * (1 - out);
      el.style.opacity = String(o);
      el.style.visibility = o < 0.004 ? "hidden" : "visible";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      if (reduced) return;
      el.style.transform = `translate3d(0, ${((1 - v) * 20 - out * 26).toFixed(1)}px, 0)`;
      el.style.filter = out > 0.002 ? `blur(${(out * 7).toFixed(2)}px)` : "";
    };

    const apply = (p: number) => {
      // No lead-in: section 03's headline has just finished fading two dozen
      // pixels of scroll ago, and anything more than that reads as a dead
      // frame of bare photograph between the two.
      place(ca, easeOutQuad(clamp01(p / 0.07)), easeInOutQuad(clamp01((p - 0.4) / 0.1)));
      place(cb, easeOutQuad(clamp01((p - 0.6) / 0.12)), 0);

      // The dissolve.
      const s = easeInOutQuad(clamp01((p - 0.46) / 0.18));
      b.style.opacity = String(s);
      // Nothing to composite once the skyline covers it.
      a.style.visibility = s > 0.999 ? "hidden" : "visible";
      if (reduced) return;
      // The headland eases wider as it goes, the skyline settles in from
      // slightly over-size — so the swap carries movement and is not two
      // stills trading places.
      a.style.transform = `scale(${(1 + 0.05 * s).toFixed(4)})`;
      b.style.transform = `scale(${(1.08 - 0.08 * s).toFixed(4)})`;
    };

    const st = ScrollTrigger.create({
      trigger: trackEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
      // A fast flick can cross either end without a final onUpdate.
      onLeave: () => apply(1),
      onLeaveBack: () => apply(0),
    });
    apply(st.progress);

    return () => st.kill();
  }, []);

  return (
    <div ref={track} id="s4-trigger" className="relative -mt-[100vh] h-[250vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Imagery only. Both beats of copy now sit on the photograph, so
            there is no cream panel left for the floating seals to invert
            against — but keep the flag on the pictures, where it belongs. */}
        <div data-dark className="absolute inset-0">
          <Image
            ref={imgA}
            src="/images/image-14.jpg"
            alt="Alam Al Roum headland at night"
            fill
            sizes="100vw"
            className="object-cover will-change-transform"
            // Same framing and scale as section 03 leaves it on, or the
            // hand-off jumps on the frame the two sections share.
            style={{ objectPosition: "center 30%", transform: "scale(1)" }}
          />
          <Image
            ref={imgB}
            src="/images/image-16.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover will-change-[opacity,transform]"
            style={{ opacity: 0, transform: "scale(1.08)" }}
          />
        </div>

        {/* The History — bottom left over the headland, the same overlay the
            developer beat uses. It was a cream drawer sliding in from the
            right; two beats of the same pinned stage now read as one
            treatment, and the photograph is never covered by half a screen of
            panel. */}
        <div
          ref={copyA}
          className="absolute right-16 bottom-10 left-6 z-10 text-white
                     will-change-[transform,opacity,filter]
                     md:right-auto md:bottom-15 md:left-15 md:max-w-[560px]"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <p className="mb-2 font-sans text-12 opacity-60 md:text-16">01</p>
          <h2 className="mb-2 font-sans text-24 leading-[1.15] font-bold tracking-[0.02em] uppercase md:text-32">
            A Landmark
            <br />
            of Return
          </h2>
          <p className="mb-4 font-sans text-12 leading-[1.6] opacity-80 md:text-16">
            The History
          </p>
          <p className="font-serif text-16 leading-[1.75] opacity-90 md:text-18">
            A Roman landmark that once guided sailors safely home, Alam Al Roum
            now returns this coastline to its true meaning—defined by timeless
            beauty, grandeur, and enduring light.
          </p>
        </div>

        {/* Qatari Diar — rises into the corner the first block has just left */}
        <div
          ref={copyB}
          className="absolute bottom-10 left-6 z-20 max-w-[480px] text-white
                     will-change-[transform,opacity]
                     md:bottom-15 md:left-15"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <Image
            src="/images/image-17.png"
            alt="Qatari Diar"
            width={80}
            height={80}
            className="mb-4 h-20 w-20 object-contain"
          />
          <p className="mb-2 font-sans text-12 opacity-60 md:text-16">
            02
          </p>
          <h2 className="mb-2 font-sans text-24 leading-[1.15] font-bold tracking-[0.02em] uppercase md:text-32">
            Qatari Diar —
            <br />
            The Developer
          </h2>
          <p className="mb-5 font-sans text-12 leading-[1.6] opacity-80 md:text-16">
            Twenty Years. Twenty Countries.
            <br />
            One Standard.
          </p>

          <div
            className={`overflow-hidden font-serif text-16 leading-[1.75]
                        transition-[max-height,opacity,margin] duration-700
                        ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${expanded ? "mb-4 max-h-[320px] opacity-100" : "mb-0 max-h-0 opacity-0"}`}
          >
            <p className="mb-3">
              Qatari Diar is a global real estate developer backed by the
              sovereign capital of the Qatar Investment Authority. Across more
              than 50 projects in 20 countries, from London to Doha, from
              Morocco to Tajikistan, the same principle has held: that
              exceptional places are built for people, not just for markets.
            </p>
            <p className="italic opacity-80">
              Alam Al Roum is Qatari Diar&rsquo;s defining statement on
              Egypt&rsquo;s North Coast.
            </p>
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="group relative inline-block border-b border-white/50 pb-[3px]
                       font-sans text-12 font-medium text-white
                       md:text-16"
          >
            {expanded ? "Read Less" : "Read More"}
            <span
              aria-hidden
              className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-white
                         transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                         group-hover:scale-x-100"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
