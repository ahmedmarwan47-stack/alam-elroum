"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  EASE_OUT,
  clamp01,
  easeInOutQuad,
  easeOutQuad,
  reducedMotion,
} from "@/lib/gsap";

type Props = {
  id: string;
  image: string;
  alt: string;
  /** Rendered one line per entry, matching the original's <br> positions. */
  headline: string[];
  tag?: string;
  /** Section 05 fades the headline out once the image fills the frame. */
  fadeOut?: boolean;
  /** Section 05 tracks its headline wide; 03 tracks it tight. */
  wideTracking?: boolean;
  /**
   * Hands the full-bleed frame straight to the next section: once the image
   * has filled the screen and the track is spent, the whole stage is hidden
   * instead of scrolling away. The section that follows must be pulled up by
   * a viewport (`-mt-[100vh]`) so its own pinned stage is already sitting
   * underneath, showing the same photograph — which is how the picture stays
   * on screen exactly once instead of arriving twice.
   */
  handOff?: boolean;
  objectPosition?: string;
};

/**
 * Sections 03 and 05 — the "type, then expand" sequences.
 *
 * A 200vh scroll track (220vh on mobile) holds a sticky cream viewport. When
 * it pins, the headline's words rise and resolve from a soft blur, one after
 * another, centred at the top. Below it sits a small photograph (50vw × 36vh, pinned to the bottom
 * edge). As you keep scrolling the photograph grows to full bleed between 35%
 * and 85% of the track, on an ease-in-out; once it is past halfway the copy
 * flips to white. Section 05 additionally fades its headline away as the
 * image takes over. All of this — sizes, thresholds, curves — was measured
 * off the production site.
 */
export default function PinnedReveal({
  id,
  image,
  alt,
  headline,
  tag,
  fadeOut = false,
  wideTracking = false,
  handOff = false,
  objectPosition = "center center",
}: Props) {
  const track = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const tagEl = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const title = useRef<HTMLHeadingElement>(null);
  const [started, setStarted] = useState(false);

  // Word-by-word reveal once the section pins.
  useEffect(() => {
    if (!started || !title.current) return;
    const words = title.current.querySelectorAll("[data-word]");
    if (reducedMotion()) {
      gsap.set(words, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    const tween = gsap.fromTo(
      words,
      { opacity: 0, y: 26, filter: "blur(12px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.1,
        ease: EASE_OUT,
        stagger: 0.07,
        clearProps: "filter",
      },
    );
    return () => {
      tween.kill();
    };
  }, [started]);

  // Scroll-driven expand.
  useEffect(() => {
    const trackEl = track.current;
    const stickyEl = sticky.current;
    const wrapEl = wrap.current;
    const imgEl = img.current;
    const contentEl = content.current;
    if (!trackEl || !stickyEl || !wrapEl || !imgEl || !contentEl) return;

    const mobile = window.matchMedia("(max-width: 768px)");

    const apply = (p: number) => {
      const e = easeInOutQuad(clamp01((p - 0.35) / 0.5));
      const w0 = mobile.matches ? 90 : 50;
      const h0 = mobile.matches ? 30 : 36;
      wrapEl.style.width = `${(w0 + (100 - w0) * e).toFixed(3)}vw`;
      wrapEl.style.height = `${(h0 + (100 - h0) * e).toFixed(3)}vh`;
      imgEl.style.transform = `scale(${(1.08 - 0.08 * e).toFixed(4)})`;
      stickyEl.dataset.onImage = e >= 0.5 ? "true" : "false";
      if (fadeOut) {
        const o = String(1 - easeOutQuad(clamp01((p - 0.68) / 0.17)));
        contentEl.style.opacity = o;
        if (tagEl.current) tagEl.current.style.opacity = o;
      }
      // Spent: the next section is pinned underneath on the same frame, so
      // step out of the way rather than scrolling the picture off twice.
      if (handOff) {
        stickyEl.style.visibility = p > 0.9995 ? "hidden" : "visible";
      }
    };

    const typing = ScrollTrigger.create({
      trigger: trackEl,
      start: "top 12%",
      once: true,
      onEnter: () => setStarted(true),
    });

    const expand = ScrollTrigger.create({
      trigger: trackEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
      // A fast flick can cross the end without a final onUpdate; these keep
      // the hand-off from being left half-applied either way.
      onLeave: () => apply(1),
      onEnterBack: (self) => apply(self.progress),
    });

    apply(expand.progress);

    return () => {
      typing.kill();
      expand.kill();
    };
  }, [fadeOut, handOff]);

  // Each word is its own inline block so it can rise and sharpen on its own.
  const lines = headline.map((line, i) => (
    <Fragment key={i}>
      {line.split(" ").map((word, w) => (
        <Fragment key={w}>
          <span data-word className="inline-block opacity-0 will-change-[transform,opacity,filter]">
            {word}
          </span>
          {w < line.split(" ").length - 1 ? " " : null}
        </Fragment>
      ))}
      {i < headline.length - 1 ? <br /> : null}
    </Fragment>
  ));

  return (
    <section
      ref={track}
      id={id}
      className={`relative h-[220vh] md:h-[200vh] ${handOff ? "z-10" : ""}`}
    >
      <div
        ref={sticky}
        data-on-image="false"
        className="group sticky top-0 flex h-screen flex-col items-center
                   overflow-hidden bg-cream pt-[168px] md:pt-[200px]"
      >
        {tag && (
          <span
            ref={tagEl}
            className={`absolute inset-x-0 top-[112px] z-20 text-center font-sans text-12
                        text-ink transition-[color,opacity,transform] duration-700
                        ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[on-image=true]:text-white
                        md:top-[136px] md:text-16
                        ${started ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          >
            {tag}
          </span>
        )}

        <div
          ref={content}
          className="pointer-events-none relative z-20 mb-11 w-full px-6 text-center md:px-10"
        >
          <h2
            ref={title}
            aria-label={headline.join(" ")}
            className={`min-h-[2.2em] font-sans text-[clamp(24px,3.4vw,48px)] leading-[1.1]
                        font-bold text-ink uppercase transition-colors duration-500
                        group-data-[on-image=true]:text-white
                        ${wideTracking ? "tracking-[0.04em]" : "tracking-[-0.01em]"}`}
          >
            {lines}
          </h2>
        </div>

        {/* Photograph — starts as a small plate at the bottom edge, grows to full bleed */}
        <div
          ref={wrap}
          data-dark
          className="absolute bottom-0 left-1/2 z-10 h-[30vh] w-[90vw] -translate-x-1/2
                     overflow-hidden will-change-[width,height] md:h-[36vh] md:w-[50vw]"
        >
          <Image
            ref={img}
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover will-change-transform"
            style={{ objectPosition, transform: "scale(1.08)" }}
          />
        </div>
      </div>
    </section>
  );
}
