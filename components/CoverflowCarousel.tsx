"use client";

import Image from "next/image";
import * as React from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export type CoverflowSlide = {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
};

type Props = {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  label?: string;
  className?: string;
};

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous slide" : "Next slide"}
      onClick={onClick}
      // A bare outline disappears over a photograph, so the control carries its
      // own frosted plate: a low white wash over a blur, which reads on a dark
      // render and on a bright one. Hover still fills it solid with ink.
      className={`group absolute top-1/2 z-[200] hidden h-12 w-12 -translate-y-1/2 items-center
                  justify-center rounded-full border border-white/50 bg-white/25 text-ink
                  shadow-[0_2px_14px_rgba(28,43,58,0.14)] backdrop-blur-md
                  transition-[background-color,border-color,color] duration-400
                  hover:border-ink hover:bg-ink hover:text-cream md:flex
                  ${dir < 0 ? "left-4 lg:left-10" : "right-4 lg:right-10"}`}
    >
      <svg
        viewBox="0 0 20 20"
        className={`h-[18px] w-[18px] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${dir < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dir < 0 ? <path d="M12.5 4 6.5 10l6 6" /> : <path d="M7.5 4l6 6-6 6" />}
      </svg>
    </button>
  );
}

/**
 * A cover-flow gallery: drag, flick, arrow keys or the controls move a ring
 * of cards through a raked 3D perspective. Position is painted straight to
 * the DOM — sixty React renders a second would be wasted on numbers React
 * never needs to see. Adapted to the site's palette and type.
 */
export default function CoverflowCarousel({
  slides,
  rotate = 40,
  depth = 0.55,
  perspective = 3,
  falloff = 0.56,
  fade = 0.12,
  cardWidth = "clamp(260px, 46vw, 660px)",
  gap = 0.06,
  loop = true,
  label = "Gallery",
  className = "",
}: Props) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    moved: boolean;
  } | null>(null);

  /** The card the press landed on — read on pointerup, see `endDrag`. */
  const hitRef = React.useRef<number | null>(null);

  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));
      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.14;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  /** How far a card sits from the centre of the ring, in card steps. */
  const offsetOf = React.useCallback(
    (index: number) => {
      let offset = index - posRef.current;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      return Math.abs(offset);
    },
    [count, loop],
  );

  /**
   * Which card is under the pointer.
   *
   * Not `document.elementFromPoint`, and not a click handler on the card:
   * the rake pushes every card but the centre one *behind* the track's own
   * plane (`translateZ` is negative), and a browser hit-tests that plane
   * first — so the neighbours never receive a press at all, which is why
   * tapping one used to do nothing. Their boxes are still measurable, so
   * test those directly, and where two overlap take the one nearer the
   * centre — the one drawn in front.
   */
  const cardAt = React.useCallback(
    (clientX: number, clientY: number) => {
      let hit: number | null = null;
      let nearest = Infinity;
      cardRefs.current.forEach((card, index) => {
        if (!card || Number(card.style.opacity || "1") < 0.15) return;
        const box = card.getBoundingClientRect();
        if (
          clientX < box.left ||
          clientX > box.right ||
          clientY < box.top ||
          clientY > box.bottom
        ) {
          return;
        }
        const distance = offsetOf(index);
        if (distance < nearest) {
          nearest = distance;
          hit = index;
        }
      });
      return hit;
    },
    [offsetOf],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    hitRef.current = cardAt(event.clientX, event.clientY);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;
    const now = performance.now();
    const previous = posRef.current;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 3) drag.moved = true;
    posRef.current = clamp(drag.pos - dx / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const hit = hitRef.current;
    hitRef.current = null;
    // A tap on an off-centre card sweeps the ring to it, so the carousel can
    // be driven by pointing as well as by dragging.
    if (!drag.moved && hit !== null && hit !== indexAt(posRef.current)) {
      goTo(hit);
      return;
    }
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={`w-full ${className}`}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          data-cursor="drag"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden pt-8 pb-16 outline-none focus-visible:ring-1
                     focus-visible:ring-ink/40 active:cursor-grabbing md:pt-12 md:pb-20"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "calc(var(--cf-card) * 0.75)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.src}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className="absolute top-0 left-1/2 aspect-[4/3] overflow-hidden bg-ink/10
                           shadow-[0_16px_40px_rgba(28,43,58,0.16)] will-change-transform"
                style={{ width: "var(--cf-card)" }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 80vw, 46vw"
                  className="pointer-events-none select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <Arrow dir={-1} onClick={() => nudge(-1)} />
        <Arrow dir={1} onClick={() => nudge(1)} />
      </div>

      {/* Caption */}
      <div className="-mt-4 flex min-h-[64px] flex-col items-center px-6 text-center md:-mt-6">
        {active?.title && (
          <p
            key={`t-${selected}`}
            className="animate-[caption-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both]
                       font-serif text-24 leading-[1.1] text-ink md:text-32"
          >
            {active.title}
          </p>
        )}
        {active?.subtitle && (
          <p
            key={`s-${selected}`}
            className="mt-2 animate-[caption-in_0.6s_cubic-bezier(0.16,1,0.3,1)_0.06s_both]
                       font-sans text-12 text-ink/55 md:text-16"
          >
            {active.subtitle}
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === selected}
            onClick={() => goTo(index)}
            className={`h-1.5 rounded-full bg-ink transition-[width,opacity] duration-400
                        ${index === selected ? "w-6 opacity-100" : "w-1.5 opacity-30 hover:opacity-60"}`}
          />
        ))}
      </div>
    </div>
  );
}
