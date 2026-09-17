"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, EASE_OUT, reducedMotion } from "@/lib/gsap";
import SweepLink from "@/components/SweepLink";
import LeadCoin from "@/components/coin/LeadCoin";

const FIELDS: { label: string; id: string; type?: string; options?: string[] }[] = [
  { label: "Full name", id: "full-name" },
  { label: "Email", id: "email", type: "email" },
  { label: "Phone number", id: "phone", type: "tel" },
  { label: "Nationality", id: "nationality" },
  {
    label: "Area of interest",
    id: "interest",
    options: ["Residential", "Hospitality", "Commercial", "Investment"],
  },
  { label: "Subject", id: "subject" },
];

/** How much of the card shows above the hero's bottom edge before you scroll. */
const PEEK_DESKTOP = 36;
const PEEK_MOBILE = 28;

/**
 * Register interest — an ink card that sits in the section under the hero.
 *
 * While the hero is on screen the card's top edge peeks up over the hero's
 * bottom; as the section scrolls into view the card glides down until it
 * rests vertically centred. Driven by scroll, so it moves with your hand.
 *
 * The form has no endpoint yet: submission is caught client-side and shows a
 * thank-you line. Wire it to the CRM before launch.
 */
export default function LeadForm() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = root.current;
    const el = card.current;
    if (!section || !el) return;

    const mobile = window.matchMedia("(max-width: 768px)");
    const peek = () => (mobile.matches ? PEEK_MOBILE : PEEK_DESKTOP);

    const ctx = gsap.context(() => {
      if (reducedMotion()) return;

      // Distance from the section's top to the card's resting top, ignoring
      // whatever translate is applied at the moment of measuring.
      const restingTop = () =>
        el.getBoundingClientRect().top -
        section.getBoundingClientRect().top -
        Number(gsap.getProperty(el, "y") || 0);

      // From "top edge peeking over the hero" to "resting where the layout put it".
      gsap.fromTo(
        el,
        { y: () => -(restingTop() + peek()) },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      // Contents settle in once the card is mostly on screen.
      gsap.from("[data-lead-item]", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: EASE_OUT,
        stagger: 0.05,
        scrollTrigger: { trigger: section, start: "top 55%", once: true },
      });

      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="lead"
      className="relative z-10 flex items-center bg-cream px-4 pt-24 pb-16 md:min-h-screen md:px-19 md:py-28"
    >
      <div
        ref={card}
        data-dark
        className="relative z-10 mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-7 rounded-[2px] bg-ink
                   px-5 py-7 text-cream shadow-[0_30px_80px_rgba(28,43,58,0.28)]
                   will-change-transform md:grid-cols-[1fr_1.5fr] md:gap-16 md:px-14 md:py-14"
      >
        <div>
          <p data-lead-item className="font-sans text-12 text-cream/50 md:text-16">
            Register Interest
          </p>
          <h2
            data-lead-item
            className="mt-3 font-serif text-[clamp(24px,3.2vw,44px)] leading-[1.1] text-cream md:mt-6"
          >
            Be among the first to discover Alam Al Roum
          </h2>
          <p data-lead-item className="mt-6 hidden max-w-[360px] font-sans text-16 leading-[1.7] text-cream/70 md:block">
            Leave your details and our team will be in touch with launch news,
            pricing and private viewings.
          </p>
        </div>

        <form
          className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:gap-x-8 md:gap-y-7"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {FIELDS.map((f) => (
            <div key={f.id} data-lead-item className="flex flex-col gap-1 md:gap-2">
              <label htmlFor={`lead-${f.id}`} className="font-sans text-12 tracking-[0.06em] text-cream/60 md:text-16">
                {f.label}
              </label>
              {f.options ? (
                <select
                  id={`lead-${f.id}`}
                  name={f.id}
                  defaultValue=""
                  className="appearance-none border-0 border-b border-cream/30 bg-transparent
                             bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 stroke=%22rgba(240,237,230,0.6)%22 stroke-width=%221.2%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')]
                             bg-[length:10px_6px] bg-[position:right_4px_center] bg-no-repeat pb-2 md:pb-3
                             font-sans text-16 text-cream outline-none transition-colors
                             focus:border-cream"
                >
                  <option value="" disabled className="text-ink">
                    Select
                  </option>
                  {f.options.map((o) => (
                    <option key={o} value={o} className="text-ink">
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`lead-${f.id}`}
                  name={f.id}
                  type={f.type ?? "text"}
                  className="border-0 border-b border-cream/30 bg-transparent pb-2 font-sans
                             text-16 text-cream outline-none transition-colors focus:border-cream md:pb-3"
                />
              )}
            </div>
          ))}

          <div data-lead-item className="mt-1 flex flex-wrap items-center gap-6 sm:col-span-2 md:mt-2">
            <SweepLink
              type="submit"
              label="Register Interest"
              className="border-cream/80 text-cream"
              fill="bg-cream"
              hoverText="group-hover:text-ink"
            />
            {sent && (
              <p
                aria-live="polite"
                className="animate-[caption-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both] font-sans text-16 text-cream/70"
              >
                Thank you. We will be in touch shortly.
              </p>
            )}
          </div>
        </form>
      </div>

      <LeadCoin section={root} card={card} hold="#coin-story" landing="#about" />
    </section>
  );
}
