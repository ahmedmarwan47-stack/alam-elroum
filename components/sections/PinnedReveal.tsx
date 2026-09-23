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
 * A 160vh scroll track (180vh on mobile) holds a sticky cream viewport. The
 * tag and the headline's words rise and resolve from a soft blur together as
 * the section comes up, rather than once it has pinned — waiting for the pin
 * left the tag floating alone on an empty screen for a beat.
 *
 * Nothing here waits for a threshold, and nothing is ever a still. The plate
 * is already growing while the section is rising into view (50vw × 38vh up to
 * 62vw × 54vh by the moment it pins), it expands to full bleed over the first
 * 62% of the pinned track, and the picture inside keeps easing off its
 * overscan all the way to the end. The copy rides the same movement: it sits
 * high while the section rises and comes down to its resting place as the
 * photograph arrives. Each line flips to white as the picture reaches it, and
 * the headline fades at 72–92% as the image takes the frame.
 */
export default function PinnedReveal({
  id,
  image,
  alt,
  headline,
  tag,
  fadeOut = false,
  handOff = false,
  objectPosition = "center center",
}: Props) {
  const track = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const tagEl = useRef<HTMLSpanElement>(null);
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
        duration: 0.7,
        ease: EASE_OUT,
        stagger: 0.035,
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
    const titleEl = title.current;
    if (!trackEl || !stickyEl || !wrapEl || !imgEl || !contentEl || !titleEl) return;

    const mobile = window.matchMedia("(max-width: 768px)");

    /**
     * The plate at three moments, in viewport units: as it first comes over
     * the fold while the section is still rising, at the instant the section
     * pins, and full bleed. The middle one is the composition the reader
     * actually stops on, so it is the fixed point — the other two are where
     * the movement comes from.
     */
    const sizes = () =>
      mobile.matches
        ? { wPre: 86, hPre: 36, w0: 92, h0: 50 }
        : { wPre: 50, hPre: 38, w0: 62, h0: 54 };

    /**
     * How far above its settled place the copy starts. It sits high while the
     * section rises — close to the section it is following, and balanced in
     * the cream rather than stranded in the middle of it — then comes down to
     * its resting position as the photograph arrives, which is the position
     * that clears the header.
     */
    const shift = () => (mobile.matches ? 40 : 56);

    /**
     * Every line of copy, with the vertical midpoint it occupies inside the
     * sticky box. Each line flips to white on its own arrival, because the
     * photograph covers the stage from the bottom up: flipping a two-line
     * headline as one block leaves a whole line white on cream, or in ink on
     * a night sky, for the length of the crossing. Per line, the worst case
     * is one line briefly half-contrasted rather than one line wholly
     * invisible.
     *
     * Offsets are measured from the top of the sticky box, NOT the viewport.
     * A refresh can run at any scroll position — at page load this stage is
     * four screens down, and a viewport-relative read there is a
     * four-thousand-pixel number that makes every later comparison true.
     * While pinned the box sits at top 0, so this offset *is* the on-screen
     * position at the moment it matters. The copy's own travel is taken back
     * out, so a mark is where the line rests, not where it happens to be.
     */
    let marks: { el: HTMLElement; mid: number }[] = [];
    let offsetY = 0;
    const measure = () => {
      const top = stickyEl.getBoundingClientRect().top;
      const els: HTMLElement[] = [
        ...(tagEl.current ? [tagEl.current] : []),
        ...Array.from(titleEl.querySelectorAll<HTMLElement>("[data-line]")),
      ];
      marks = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, mid: r.top + r.height / 2 - top - offsetY };
      });
    };

    // Two triggers, read rather than cached: one for the approach, one for
    // the pin. Their refresh order is not guaranteed, and a stale copy of the
    // other's progress shows up as a jump at the seam between them.
    // A holder rather than two bindings: `render` closes over them, and
    // creating a ScrollTrigger can call back into it synchronously, which a
    // plain `const` declared below would meet in its dead zone.
    const st: { rise?: ScrollTrigger; expand?: ScrollTrigger } = {};

    /** The stage that takes this one's place — see the hand-off in `render`. */
    const nextStickyEl = handOff
      ? (trackEl.nextElementSibling?.firstElementChild as HTMLElement | null)
      : null;

    const render = () => {
      const { wPre, hPre, w0, h0 } = sizes();
      const approach = st.rise?.progress ?? 0;
      const pinned = st.expand?.progress ?? 0;

      // Before the pin the plate is already growing, gently, as it comes up
      // the screen — the reader should never meet it as a still that only
      // starts moving once some threshold is crossed. After the pin it does
      // the real expansion. The two meet exactly at (w0, h0) and scale 1.12,
      // so the seam is invisible.
      let w: number;
      let h: number;
      let scale: number;
      if (pinned > 0) {
        const e = easeInOutQuad(clamp01(pinned / 0.62));
        w = w0 + (100 - w0) * e;
        h = h0 + (100 - h0) * e;
        // Still easing off its overscan after the frame is full, so there is
        // no scroll position where nothing is moving. Lands on exactly
        // scale(1) at pinned = 1, which is the frame section 04 takes over —
        // the hand-off is only seamless if the two agree here.
        scale = 1.12 - 0.12 * pinned;
      } else {
        const a = easeOutQuad(approach);
        w = wPre + (w0 - wPre) * a;
        h = hPre + (h0 - hPre) * a;
        scale = 1.16 - 0.04 * a;
      }
      // Height as a percentage of the stage rather than in `vh`: the stage is
      // sized from `--stage-h`, so a percentage of it is the same number the
      // scroll maths uses. `vh` here would be the large viewport again.
      wrapEl.style.width = `${w.toFixed(3)}vw`;
      wrapEl.style.height = `${h.toFixed(3)}%`;
      imgEl.style.transform = `scale(${scale.toFixed(4)})`;

      // One continuous descent across both phases: `t` runs 0 → 1 over the
      // approach and 1 → 2 over the pin, so the copy settles just after the
      // section lands and well before the photograph reaches it.
      const t = pinned > 0 ? 1 + pinned : approach;
      offsetY = -shift() * (1 - easeOutQuad(clamp01((t - 0.55) / 0.61)));
      contentEl.style.transform = `translate3d(0, ${offsetY.toFixed(1)}px, 0)`;

      const imgTop = stickyEl.clientHeight * (1 - h / 100);
      for (const m of marks) {
        m.el.dataset.onImage = imgTop <= m.mid + offsetY ? "true" : "false";
      }

      if (fadeOut) {
        // Held until the frame is full and read, then away — ending just
        // short of the hand-off so the next section's copy can start rising
        // almost immediately instead of after a blank screen.
        contentEl.style.opacity = String(1 - easeOutQuad(clamp01((pinned - 0.72) / 0.2)));
      }
      // Spent: the next section is pinned underneath on the same frame, so
      // step out of the way rather than scrolling the picture off twice.
      //
      // The cue is where that section actually is, not only this one's
      // progress: the two boundaries are computed separately (this pin's
      // length here, the next track's pull-up in CSS) and can land a pixel
      // apart after rounding, which would hold this picture over the top of
      // the next section for the first slice of its timeline. Whichever cue
      // comes first wins; once this track runs out nothing here updates
      // again, so the progress test stays as the backstop.
      if (handOff) {
        const covered =
          pinned > 0.9995 ||
          (nextStickyEl !== null &&
            nextStickyEl.getBoundingClientRect().top <= 0.5);
        stickyEl.style.visibility = covered ? "hidden" : "visible";
      }
    };

    const typing = ScrollTrigger.create({
      trigger: trackEl,
      start: "top 65%",
      once: true,
      onEnter: () => setStarted(true),
    });

    st.rise = ScrollTrigger.create({
      trigger: trackEl,
      start: "top 80%",
      end: "top top",
      onUpdate: render,
      onRefresh: render,
    });

    st.expand = ScrollTrigger.create({
      trigger: trackEl,
      start: "top top",
      // The pin's own length, from the boxes, not `bottom bottom`: that
      // resolves against `innerHeight`, which on a phone is the short view
      // with the address bar up while the sticky box is the large one — and
      // the difference had the picture still expanding after the stage had
      // already let go.
      end: () => `+=${trackEl.offsetHeight - stickyEl.offsetHeight}`,
      invalidateOnRefresh: true,
      onUpdate: render,
      onRefresh: () => {
        measure();
        render();
      },
      // A fast flick can cross either end without a final onUpdate; these
      // keep the hand-off from being left half-applied.
      onLeave: render,
      onEnterBack: render,
    });

    measure();
    render();
    // The first measurement runs before the webfont lands, and the headline's
    // height is what it turns on.
    document.fonts?.ready.then(() => {
      measure();
      render();
    });

    return () => {
      typing.kill();
      st.rise?.kill();
      st.expand?.kill();
    };
  }, [fadeOut, handOff]);

  // One block per line — the line is what carries the colour as the
  // photograph reaches it. Each word inside is its own inline block so it can
  // rise and sharpen on its own.
  const lines = headline.map((line, i) => {
    const words = line.split(" ");
    return (
      <span
        key={i}
        data-line
        data-on-image="false"
        className="block transition-colors duration-300 data-[on-image=true]:text-white"
      >
        {words.map((word, w) => (
          <Fragment key={w}>
            <span data-word className="inline-block opacity-0 will-change-[transform,opacity,filter]">
              {word}
            </span>
            {w < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    );
  });

  return (
    <section
      ref={track}
      id={id}
      className={`relative h-[calc(var(--stage-h,100vh)*1.8)] md:h-[calc(var(--stage-h,100vh)*1.6)] ${handOff ? "z-10" : ""}`}
    >
      <div
        ref={sticky}
        className="sticky top-0 h-[var(--stage-h,100vh)] overflow-hidden bg-cream"
      >
        {/* The copy is centred in the band of cream between the header and
            the photograph's resting top edge, rather than hung from a fixed
            top padding. Hanging it put the tag directly under the header on
            some viewports and left a hole above the picture on others; the
            band always splits the difference. Its padding is the header's own
            height, so the centring is of the air you can actually see. */}
        <div
          ref={content}
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[50%]
                     flex-col items-center justify-center px-6 pt-[64px] text-center
                     md:h-[46%] md:px-10 md:pt-[80px]"
        >
          {tag && (
            <span
              ref={tagEl}
              data-on-image="false"
              className={`type-eyebrow mb-5 text-ink transition-[color,opacity,transform]
                          duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                          data-[on-image=true]:text-white md:mb-6
                          ${started ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              {tag}
            </span>
          )}

          <h2
            ref={title}
            aria-label={headline.join(" ")}
            className="type-section-title min-h-[2.2em] text-ink"
          >
            {lines}
          </h2>
        </div>

        {/* Photograph — starts as a small plate at the bottom edge, grows to full bleed */}
        <div
          ref={wrap}
          data-dark
          className="absolute bottom-0 left-1/2 z-10 h-[50%] w-[92vw] -translate-x-1/2
                     overflow-hidden md:h-[54%] md:w-[62vw]"
        >
          <Image
            ref={img}
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover will-change-transform"
            style={{ objectPosition, transform: "scale(1.12)" }}
          />
        </div>
      </div>
    </section>
  );
}
