"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";

const STATS = [
  { value: "20.58M", unit: "SQM", caption: "Total Land Area" },
  { value: "4.902", unit: "Feddan", caption: "Total Masterplan Area" },
  { value: "7.2", unit: "Kilometer", caption: "Mediterranean Shoreline" },
  { value: "22", unit: "Kilometer", caption: "Total Water Frontage Including Lagoons" },
];

const DELIVERS = [
  "Beachfront Communities",
  "Lagoon Neighbourhood",
  "Marina and Waterfront Boulevard",
  "Resort and Hospitality Districts",
  "Championship Golf Community",
  "Mixed-Use Town Centres and Commercial Districts",
  "Free Zone and Business Hub",
];

/** "20.58M" → { number: 20.58, decimals: 2, suffix: "M" }; null if no leading number. */
function parseStat(value: string) {
  const match = /^([\d.]+)(.*)$/.exec(value);
  if (!match) return null;
  const [, num, suffix] = match;
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { number: parseFloat(num), decimals, suffix };
}

/**
 * Section 07 — Scale of the masterplan: intro copy beside a column of figures,
 * then a full-bleed rust panel listing what the plan delivers.
 *
 * Mirrors the original `.s7`: hairlines draw in from the left, stat contents
 * fade up behind them, the deliverables come up as a bulleted list. Everything is
 * rendered in its final state so reduced-motion users (and the server render)
 * see the finished layout; the tweens only take over when motion is allowed.
 */
export default function Feature() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;

    const ctx = gsap.context((self) => {
      const q = self.selector;
      if (!q) return;

      /* ── Top half: headline + body fade up ─────────────────────────────── */
      const copy = q("[data-s7-copy]")[0] as HTMLElement | undefined;
      if (copy) {
        gsap
          .timeline({ scrollTrigger: { trigger: copy, start: "top 85%", once: true } })
          .fromTo(
            q("[data-s7-headline]"),
            { y: 40, opacity: 0, filter: "blur(6px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.9,
              ease: EASE_OUT,
              clearProps: "filter",
            },
            0,
          )
          .fromTo(
            q("[data-s7-body]"),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: EASE_OUT },
            0.15,
          );
      }

      /* ── Top half: stats — lines draw, content fades, numbers count up ── */
      const statsCol = q("[data-s7-stats]")[0] as HTMLElement | undefined;
      if (statsCol) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: statsCol, start: "top 85%", once: true },
        });

        (q("[data-s7-stat]") as HTMLElement[]).forEach((stat, i) => {
          const at = i * 0.12;

          tl.fromTo(
            stat.querySelectorAll("[data-s7-line]"),
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1, ease: EASE_OUT },
            at,
          );
          tl.fromTo(
            stat.querySelectorAll("[data-s7-stat-content]"),
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: EASE_OUT },
            at + 0.1,
          );

          const counter = stat.querySelector<HTMLElement>("[data-s7-count]");
          const parsed = counter ? parseStat(counter.dataset.s7Count ?? "") : null;
          if (counter && parsed) {
            const { number, decimals, suffix } = parsed;
            const proxy = { v: 0 };
            counter.textContent = proxy.v.toFixed(decimals) + suffix;
            tl.to(
              proxy,
              {
                v: number,
                duration: 1.2,
                ease: EASE_OUT,
                onUpdate: () => {
                  counter.textContent = proxy.v.toFixed(decimals) + suffix;
                },
              },
              at,
            );
          }
        });
      }

      /* ── Bottom half: rust panel ───────────────────────────────────────── */
      const panel = q("[data-s7-bottom]")[0] as HTMLElement | undefined;
      if (panel) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, start: "top 90%", once: true },
        });

        tl.fromTo(
          q("[data-s7-delivers-headline]"),
          { y: 20, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: EASE_OUT,
            clearProps: "filter",
          },
          0,
        );

        // Bullets, so they arrive as a list is read — from the left, each
        // marker just ahead of its line — rather than sliding in from the
        // right the way the hairline rows used to.
        (q("[data-s7-deliver]") as HTMLElement[]).forEach((item, i) => {
          const at = i * 0.07;
          tl.fromTo(
            item.querySelectorAll("[data-s7-dot]"),
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: EASE_OUT },
            at,
          );
          tl.fromTo(
            item.querySelectorAll("[data-s7-deliver-text]"),
            { x: -12, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, ease: EASE_OUT },
            at + 0.05,
          );
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="s7" className="bg-cream">
      {/* ── TOP: headline + body left | stats right ─────────────────────── */}
      <div
        className="grid grid-cols-1 items-start gap-10 px-6 pt-22 pb-15
                   md:min-h-[70vh] md:grid-cols-[1fr_1.4fr] md:gap-20 md:px-19 md:py-30"
      >
        <div data-s7-copy>
          <h2
            data-s7-headline
            className="mb-7 font-sans text-[clamp(24px,3.4vw,48px)] leading-[1.2]
                       font-bold tracking-[-0.01em] text-ink uppercase"
          >
            A 7.2-Kilometre Beachfront
            <br />
            Defines the Edge.
          </h2>
          <p data-s7-body className="font-serif text-16 leading-[1.8] text-ink/80">
            A network of lagoons carries the water deep inland, creating over 28
            kilometres of waterfront that reach into residential communities,
            leisure zones, and urban centres far beyond the shoreline. A central
            boulevard connects the arrival gateway to the marina, forming the
            spine of a walkable, human-scaled city.
          </p>
        </div>

        <dl data-s7-stats className="flex flex-col">
          {STATS.map((s, i) => {
            const parsed = parseStat(s.value);
            return (
              <div
                key={s.caption}
                data-s7-stat
                className="relative overflow-hidden py-6 md:py-[33px]"
              >
                {i === 0 && (
                  <span
                    data-s7-line
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px origin-left bg-ink/20"
                  />
                )}
                <span
                  data-s7-line
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-left bg-ink/20"
                />

                <div
                  data-s7-stat-content
                  className="flex flex-col items-start gap-1
                             md:flex-row md:items-baseline md:justify-between md:gap-4"
                >
                  <dt
                    className="font-sans text-[clamp(40px,12vw,64px)] leading-none font-bold
                               tracking-[-0.02em] whitespace-nowrap text-ink md:text-40"
                  >
                    {parsed ? (
                      <span data-s7-count={s.value}>{s.value}</span>
                    ) : (
                      s.value
                    )}
                    <span className="ml-2.5 text-[0.75em] font-normal opacity-60">
                      {s.unit}
                    </span>
                  </dt>
                  <dd
                    className="font-serif text-12 text-ink/55
                               md:self-end md:pb-1.5 md:text-right md:text-16"
                  >
                    {s.caption}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      {/* ── BOTTOM: rust panel — what the masterplan delivers ────────────── */}
      <div
        data-s7-bottom
        data-dark
        className="relative grid grid-cols-1 items-start gap-10 bg-rust px-6 pt-22 pb-15
                   md:grid-cols-[1fr_1.6fr] md:gap-20 md:px-20 md:py-30"
      >
        <h3
          data-s7-delivers-headline
          className="font-sans text-[clamp(24px,3.4vw,48px)] leading-[1.15] font-bold
                     tracking-[-0.01em] text-white uppercase md:sticky md:top-10"
        >
          What the Masterplan
          <br />
          Delivers
        </h3>

        {/* Bullets. Full-width rows between hairlines read as a menu you are
            meant to click; this is a list of what gets built. */}
        <ul className="flex flex-col gap-4 md:gap-5">
          {DELIVERS.map((item) => (
            <li key={item} data-s7-deliver className="flex items-start gap-3.5">
              <span
                data-s7-dot
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/70 md:mt-[11px]"
              />
              <p
                data-s7-deliver-text
                className="font-serif text-16 leading-[1.5] text-white md:text-18"
              >
                {item}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
