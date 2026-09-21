"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Section 04 — Landmark of Return / the developer.
 *
 * A 250vh track pinning one viewport through three beats, driven by scroll
 * progress but animated with the original's CSS transitions:
 *
 *   1. (0–3%)    image-14 full bleed — the *same* frame section 03 has just
 *                finished expanding to, taken over in place
 *   2. (3–45%)   the cream "A Landmark of Return" panel slides in from the
 *                right and holds
 *   3. (45%+)    panel slides back out, the photograph cross-fades to the
 *                Lusail skyline, and the Qatari Diar overlay fades up with a
 *                Read More expander
 *
 * The track is pulled up a full viewport so it pins at the exact scroll where
 * section 03 stops pinning, and 03 hides itself there (`handOff`). Without
 * that the reader met the same photograph twice — once as 03 scrolled it away
 * and again as this section brought an identical copy back up — with a dead
 * viewport of scrolling in between before the panel moved. Now the picture
 * arrives once and the panel follows straight on.
 */
export default function Sequence() {
  const track = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [overlay, setOverlay] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!track.current) return;

    const apply = (p: number) => {
      setBeat(p >= 0.45 ? 2 : p >= 0.03 ? 1 : 0);
      setOverlay(p >= 0.47);
    };

    const st = ScrollTrigger.create({
      trigger: track.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    apply(st.progress);

    return () => st.kill();
  }, []);

  return (
    <div ref={track} id="s4-trigger" className="relative -mt-[100vh] h-[250vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Imagery only — data-dark must NOT wrap the cream panel, or the
            floating seals invert while sitting over it. */}
        <div data-dark className="absolute inset-0">
          <Image
            src="/images/image-14.jpg"
            alt="Alam Al Roum headland at night"
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-[900ms] ease-[ease]"
            // Same framing as section 03 leaves it on, or the hand-off jumps.
            style={{ opacity: beat >= 2 ? 0 : 1, objectPosition: "center 30%" }}
          />
          <Image
            src="/images/image-16.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-[900ms] ease-[ease]"
            style={{ opacity: beat >= 2 ? 1 : 0 }}
          />
        </div>

        {/* Cream panel — slides in from the right */}
        <aside
          className={`absolute top-0 right-0 bottom-0 z-10 flex w-full flex-col justify-start
                      bg-cream px-6 pt-32 pb-10 transition-transform duration-[900ms]
                      ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform
                      md:w-[42%] md:justify-center md:px-[70px] md:py-20
                      ${beat === 1 ? "translate-x-0" : "translate-x-full"}`}
        >
          <h2
            className="mb-7 font-sans text-[clamp(28px,3vw,44px)] leading-[1.05]
                       font-bold tracking-[-0.01em] text-ink uppercase"
          >
            A Landmark
            <br />
            of Return
          </h2>
          <p className="mb-[14px] font-sans text-12 font-semibold text-ink md:text-16">
            The History
          </p>
          <p className="font-serif text-16 leading-[1.75] text-ink/85 md:text-18">
            A Roman landmark that once guided sailors safely home, Alam Al Roum
            now returns this coastline to its true meaning—defined by timeless
            beauty, grandeur, and enduring light.
          </p>
        </aside>

        {/* Qatari Diar overlay — bottom left, fades up on the image swap */}
        <div
          className={`absolute bottom-10 left-6 z-20 max-w-[480px] text-white
                      transition-[opacity,transform] duration-800 ease-[ease]
                      md:bottom-15 md:left-15
                      ${overlay ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
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
