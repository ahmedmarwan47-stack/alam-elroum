"use client";

import Image from "next/image";
import * as React from "react";
import { gsap, CustomEase, EASE_OUT, reducedMotion } from "@/lib/gsap";

export type GallerySlide = {
  src: string;
  alt: string;
  title?: string;
  /** Marks a video card: it carries a play badge. */
  video?: string;
};

type Props = {
  slides: GallerySlide[];
  label?: string;
  /** Holds the autoplay, e.g. while the lightbox is open. */
  paused?: boolean;
  /** Called when the centre card is tapped (or Enter is pressed on it). */
  onOpen?: (index: number) => void;
};

/*
 * The motion, measured off the reference film frame by frame:
 *
 * - Every card makes the same 0.9s glide on the same curve — a slow lean-in,
 *   most of the distance in a rush through the middle, a long soft landing.
 * - They do not move as one. Each card sets off one film frame (~0.042s)
 *   after the card ahead of it in the direction of travel, so the gaps open
 *   up mid-glide (23px → ~77px on the 720px reference) and close again as
 *   the row lands.
 * - A glide starts every ~2.05s.
 */
const GLIDE = "galleryGlide";
if (!CustomEase.get(GLIDE)) CustomEase.create(GLIDE, "0.7, 0.05, 0.3, 0.95");
/** Seconds one card takes to glide one place. */
const STEP = 0.9;
/** Seconds between one card setting off and the next. */
const STAGGER = 0.042;
/** Seconds the row rests between glides. */
const HOLD = 1.1;
/*
 * The shapes. Side cards are portrait (4:5). The centre card is a touch taller
 * and much wider — landscape on a desktop, square on a phone — so a wide
 * photograph is not cut down to a sliver in the middle of the row. A card
 * grows into the centre shape as it arrives and gives it up as it leaves.
 */
/** Side card width over its height. */
const SIDE_RATIO = 0.8;
/** Centre card height over a side card's. */
const CENTRE_TALL = 1.12;
/** Centre card width over its own height: desktop, phone. */
const CENTRE_RATIO = { wide: 1.7, narrow: 1 };
/** Space between cards, px: desktop, phone. */
const GAP = { wide: 24, narrow: 14 };
/** Share of a phone's width the centre card takes. */
const PHONE_CENTRE = 0.76;
/** Cards further out than this are off screen and not painted. */
const REACH = 4;

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous slide" : "Next slide"}
      onClick={onClick}
      // A bare outline disappears over a photograph, so the control carries its
      // own frosted plate: a low white wash over a blur, which reads on a dark
      // photograph and on a bright one. Hover fills it solid with cream.
      className={`group absolute top-1/2 z-[200] flex h-10 w-10 -translate-y-1/2 items-center
                  justify-center rounded-full border border-white/50 bg-white/20 text-white
                  shadow-[0_2px_14px_rgba(0,0,0,0.2)] backdrop-blur-md
                  transition-[background-color,border-color,color] duration-400
                  hover:border-cream hover:bg-cream hover:text-ink md:h-12 md:w-12
                  ${dir < 0 ? "left-3 md:left-4 lg:left-10" : "right-3 md:right-4 lg:right-10"}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:h-6 md:w-6
                    ${dir < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
        fill="none"
      >
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
  );
}

/**
 * A line of caption that crossfades when its text changes: the old text
 * lifts away as the new one rises in over it. Both share one grid cell, so
 * the line never jumps in height. Unchanged text (the next beach shot is
 * still "Beach Shots") stays put rather than replaying its entrance.
 */
function CaptionSwap({
  text,
  className = "",
  delay = 0.3,
}: {
  text: string;
  className?: string;
  /** Seconds before the incoming text starts to rise. */
  delay?: number;
}) {
  const [current, setCurrent] = React.useState(text);
  const [previous, setPrevious] = React.useState<string | null>(null);
  const [generation, setGeneration] = React.useState(0);

  // Adjusting state to a changed prop during render, as React recommends
  // over an effect: the swap starts in the same paint as the new card.
  if (text !== current) {
    setPrevious(current);
    setCurrent(text);
    setGeneration((g) => g + 1);
  }

  return (
    <span className={`grid ${className}`}>
      {previous !== null && (
        <span
          key={`out-${generation}`}
          aria-hidden
          className="caption-swap-out col-start-1 row-start-1"
          onAnimationEnd={() => setPrevious(null)}
        >
          {previous}
        </span>
      )}
      <span
        key={`in-${generation}`}
        className={`col-start-1 row-start-1 ${generation > 0 ? "caption-swap-in" : ""}`}
        style={{ ["--swap-delay" as string]: `${delay}s` }}
      >
        {current}
      </span>
    </span>
  );
}

/**
 * A flat, endless row of rounded cards, three on show on a desktop: the
 * centre one wide and a touch taller, its portrait neighbours either side. Every couple of seconds the
 * row ripples one card to the left and rests again.
 *
 * The autoplay rests while the pointer is over the row, while it is being
 * dragged, while it is off screen, while `paused` is set, and always under
 * reduced motion. Drag, swipe, the arrows or ←/→ move it by hand; tapping a
 * side card brings it to the centre, tapping the centre card opens it.
 *
 * Each card keeps its own position, so the stagger falls out of giving each
 * one its own start time. It is all painted straight to the DOM; React only
 * hears which card is in the centre.
 */
export default function GalleryCarousel({ slides, label = "Gallery", paused = false, onOpen }: Props) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Each card's own position, as a fractional card index at the centre. */
  const cardPos = React.useRef<number[]>(Array(count).fill(0));
  /** Where the row is headed (or resting): the card index that is centred. */
  const target = React.useRef(0);
  /** The measured geometry: side and centre card sizes and the gap, in px. */
  const geo = React.useRef<{ sw: number; sh: number; cw: number; ch: number; gap: number } | null>(null);
  const tweenRef = React.useRef<gsap.core.Tween | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    start: number;
    last: number;
    v: number;
    t: number;
    moved: boolean;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [inView, setInView] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const indexAt = React.useCallback(
    (p: number) => ((Math.round(p) % count) + count) % count,
    [count],
  );

  /** How far card `index` sits from the centre at position `p`, wrapped to the near side. */
  const offsetAt = React.useCallback(
    (index: number, p: number) => {
      let offset = (((index - p) % count) + count) % count;
      if (offset > count / 2) offset -= count;
      return offset;
    },
    [count],
  );

  const paint = React.useCallback(() => {
    const g = geo.current;
    if (!g) return;
    // Centre to first neighbour, then neighbour to neighbour. Between the
    // centre and the first place a card's size and its distance change
    // together, so the gaps either side of it stay the same throughout.
    const first = g.cw / 2 + g.gap + g.sw / 2;
    const step = g.sw + g.gap;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const offset = offsetAt(index, cardPos.current[index]);
      const distance = Math.abs(offset);
      const near = Math.min(distance, 1);
      const x = Math.sign(offset) * (first * near + step * Math.max(0, distance - 1));
      const w = g.cw + (g.sw - g.cw) * near;
      const h = g.ch + (g.sh - g.ch) * near;
      card.style.width = `${w.toFixed(2)}px`;
      card.style.height = `${h.toFixed(2)}px`;
      card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), -50%, 0)`;
      // Out past REACH nothing is on screen; the wrap from one end of the
      // row to the other happens out there, unseen.
      card.style.visibility = Math.abs(offset) > REACH ? "hidden" : "visible";
    });
  }, [offsetAt]);

  /** Puts every card at `p` at once — for dragging. */
  const setAll = React.useCallback(
    (p: number) => {
      cardPos.current.fill(p);
      paint();
    },
    [paint],
  );

  /**
   * Glides the row to `to`. With `ripple`, each card sets off STAGGER after
   * the one ahead of it in the direction of travel; without, they move as
   * one (a drag being let go).
   */
  const glideTo = React.useCallback(
    (to: number, { ripple = true, duration = STEP, ease = GLIDE } = {}) => {
      tweenRef.current?.kill();
      target.current = to;
      setSelected(indexAt(to));
      const from = cardPos.current.slice();
      const curve = gsap.parseEase(ease);
      const dir = Math.sign(to - from[indexAt(to)]) || 1;
      const delays = from.map((p, index) => {
        if (!ripple) return 0;
        const offset = Math.max(-REACH, Math.min(REACH, offsetAt(index, p)));
        // Moving left, the leftmost card leads; moving right, the rightmost.
        return (dir > 0 ? offset + REACH : REACH - offset) * STAGGER;
      });
      const total = duration + Math.max(...delays);
      const clock = { t: 0 };
      tweenRef.current = gsap.to(clock, {
        t: total,
        duration: total,
        ease: "none",
        onUpdate: () => {
          from.forEach((p, index) => {
            const u = Math.min(1, Math.max(0, (clock.t - delays[index]) / duration));
            cardPos.current[index] = p + (to - p) * curve(u);
          });
          paint();
        },
      });
    },
    [indexAt, offsetAt, paint],
  );

  const nudge = React.useCallback((by: number) => glideTo(target.current + by), [glideTo]);

  /** To card `index`, the short way round. */
  const goTo = React.useCallback(
    (index: number) => glideTo(target.current + Math.round(offsetAt(index, target.current))),
    [glideTo, offsetAt],
  );

  // Autoplay: rest, glide, rest, glide — a glide every STEP + HOLD, like the
  // reference. Rescheduled whenever anything that can hold it changes.
  const playing = inView && !hovered && !dragging && !paused;
  React.useEffect(() => {
    if (!playing || reducedMotion()) return;
    let call: gsap.core.Tween;
    const tick = () => {
      nudge(1);
      call = gsap.delayedCall(STEP + HOLD, tick);
    };
    call = gsap.delayedCall(HOLD, tick);
    return () => void call.kill();
  }, [playing, nudge]);

  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(frame);
    return () => io.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const W = frame.clientWidth;
      const H = frame.clientHeight;
      if (!W || !H) return;
      const wide = window.matchMedia("(min-width: 768px)").matches;
      const ratio = wide ? CENTRE_RATIO.wide : CENTRE_RATIO.narrow;
      const gap = wide ? GAP.wide : GAP.narrow;
      // Side height `sh` fixes everything: the centre is `CENTRE_TALL × sh`
      // tall and `ratio` times that wide. A desktop fits exactly three across
      // — centre, both neighbours, a gap between each and one more at either
      // screen edge, so no fourth card peeks in; a phone fits the centre to
      // its share of the width. Both stop where the centre card meets the
      // row's height.
      const across = wide
        ? (W - 4 * gap) / (2 * SIDE_RATIO + CENTRE_TALL * ratio)
        : (W * PHONE_CENTRE) / (CENTRE_TALL * ratio);
      const sh = Math.min(across, (H - 8) / CENTRE_TALL);
      const ch = sh * CENTRE_TALL;
      geo.current = { sw: sh * SIDE_RATIO, sh, cw: ch * ratio, ch, gap };
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(() => () => void tweenRef.current?.kill(), []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    tweenRef.current?.kill();
    // Wherever the ripple had got to, take hold of the row by its centre card.
    const centre = cardPos.current[indexAt(target.current)];
    setAll(centre);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      start: centre,
      last: centre,
      v: 0,
      t: performance.now(),
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const g = geo.current;
    if (!g) return;
    // One place along, measured centre to neighbour.
    const pitch = g.cw / 2 + g.gap + g.sw / 2;
    const now = performance.now();
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    const p = drag.start - dx / pitch;
    drag.v = ((p - drag.last) / Math.max(now - drag.t, 1)) * 1000;
    drag.last = p;
    drag.t = now;
    setAll(p);
    const index = indexAt(p);
    if (index !== selected) setSelected(index);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    const settle = { ripple: false, duration: 0.6, ease: EASE_OUT };
    if (!drag.moved) {
      // A tap. The cards are flat, so whatever is under the pointer is the
      // card that was tapped.
      const hit = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)
        ?.closest<HTMLElement>("[data-slide]");
      const index = hit ? Number(hit.dataset.slide) : null;
      if (index !== null && index !== indexAt(drag.last)) return goTo(index);
      glideTo(Math.round(drag.last), settle);
      if (index !== null) onOpen?.(index);
      return;
    }
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    glideTo(Math.round(drag.last + carried), settle);
  };

  const active = slides[selected];

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="flex w-full flex-col justify-center">
      {/* The row takes the height its parent leaves it and the cards are
          sized to it (see `measure`), so the section fits the screen whatever
          its shape. On a phone the width sets the card, so the row stops at
          the centre card's height and the spare height is shared above and
          below rather than left as a gap under the photo. */}
      <div className="relative min-h-0 flex-1 max-md:max-h-[calc(76vw+8px)]">
      <div className="absolute inset-0">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            } else if (event.key === "Enter" && onOpen) {
              event.preventDefault();
              onOpen(selected);
            }
          }}
          className="relative h-full cursor-grab overflow-hidden outline-none select-none
                     focus-visible:ring-1 focus-visible:ring-cream/40 active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.src}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-slide={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              className="absolute top-1/2 left-1/2 overflow-hidden rounded-[clamp(16px,2vw,28px)]
                         bg-cream/5 will-change-transform"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                draggable={false}
                sizes="(max-width: 768px) 80vw, 50vw"
                className="pointer-events-none object-cover select-none"
              />
              {slide.video && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2
                             -translate-y-1/2 items-center justify-center rounded-full border border-white/60
                             bg-white/20 text-white backdrop-blur-md md:h-18 md:w-18"
                >
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 md:h-7 md:w-7" fill="currentColor">
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>

        <Arrow dir={-1} onClick={() => nudge(-1)} />
        <Arrow dir={1} onClick={() => nudge(1)} />
      </div>
      </div>

      {/* Caption: which set the centre card is from. It changes as the
          glide sets off and lands with the card. */}
      <div className="mt-[clamp(12px,2.5vh,28px)] flex min-h-[40px] shrink-0 flex-col items-center px-6 text-center">
        <CaptionSwap
          text={active?.title ?? ""}
          className="font-serif text-24 leading-[1.1] text-cream md:text-32"
        />
      </div>

      {/* Counter over a slim progress line */}
      <div className="mt-[clamp(10px,2vh,24px)] flex shrink-0 flex-col items-center gap-3">
        <p className="type-meta tabular-nums text-cream/60" aria-live="polite">
          {String(selected + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
        <div aria-hidden className="h-px w-40 bg-cream/15">
          <div
            className="h-full bg-cream transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${((selected + 1) / count) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
