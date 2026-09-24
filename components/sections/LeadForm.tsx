"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, EASE_OUT, reducedMotion } from "@/lib/gsap";
import SweepLink from "@/components/SweepLink";
import LeadCoin from "@/components/coin/LeadCoin";
import { COUNTRIES, PRIORITY_CODES, flagOf } from "@/lib/countries";

/**
 * The select's own chevron, since `appearance-none` takes the native one
 * away. Inline data URI rather than a Tailwind arbitrary background: the
 * markup carries spaces, and a class name cannot.
 */
const CHEVRON = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
    '<path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" ' +
    'stroke="rgba(240,237,230,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    "</svg>",
)}")`;

/** Priority markets first, then everyone else by name. */
const PRIORITY = PRIORITY_CODES.map((code) => COUNTRIES.find((c) => c.code === code)!);
const REST = COUNTRIES.filter((c) => !PRIORITY_CODES.includes(c.code));

const FIELDS: {
  label: string;
  id: string;
  type?: string;
  options?: string[];
  /** `phone` pairs the number with a dial-code picker; `country` is the nationality list. */
  kind?: "phone" | "country";
}[] = [
  { label: "Full name", id: "full-name" },
  { label: "Email", id: "email", type: "email" },
  { label: "Phone number", id: "phone", kind: "phone" },
  { label: "Nationality", id: "nationality", kind: "country" },
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
  const [dialCountry, setDialCountry] = useState("EG");
  const dial = COUNTRIES.find((c) => c.code === dialCountry)!;

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
      className="relative z-10 flex items-center bg-cream px-4 pt-15 pb-15 md:min-h-screen md:px-19 md:py-28"
    >
      <div
        ref={card}
        data-dark
        className="relative z-10 mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-7 rounded-[2px] bg-ink
                   px-5 py-7 text-cream shadow-[0_30px_80px_rgba(28,43,58,0.28)]
                   will-change-transform md:grid-cols-[1fr_1.5fr] md:gap-16 md:px-14 md:py-14"
      >
        <div>
          <p data-lead-item className="type-eyebrow text-cream/50">
            Register Interest
          </p>
          <h2
            data-lead-item
            className="mt-3 font-serif text-[clamp(22px,2.8vw,40px)] leading-[1.1] text-cream md:mt-6"
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
              <label htmlFor={`lead-${f.id}`} className="type-meta text-cream/60">
                {f.label}
              </label>
              {f.kind === "phone" ? (
                // One underline across the pair. The dial-code picker shows a
                // compact flag + prefix; the real <select> sits invisibly on
                // top of it, so the native list (and its accessibility) is
                // kept without the long "Egypt (+20)" label in the field.
                <div className="flex items-center gap-3 border-b border-cream/30 pb-2 transition-colors focus-within:border-cream md:pb-3">
                  <div className="relative flex shrink-0 items-center gap-1.5 pr-5 font-sans text-16 text-cream">
                    <span aria-hidden>{flagOf(dial.code)}</span>
                    <span aria-hidden>{dial.dial}</span>
                    <span
                      aria-hidden
                      className="absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 bg-contain bg-no-repeat"
                      style={{ backgroundImage: CHEVRON }}
                    />
                    <select
                      aria-label="Country code"
                      name="phone-code"
                      value={dialCountry}
                      onChange={(e) => setDialCountry(e.target.value)}
                      className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                    >
                      <CountryOptions withDial />
                    </select>
                  </div>
                  <span aria-hidden className="h-4 w-px shrink-0 bg-cream/30" />
                  <input
                    id={`lead-${f.id}`}
                    name={f.id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-16 text-cream outline-none"
                  />
                </div>
              ) : f.kind === "country" ? (
                <select
                  id={`lead-${f.id}`}
                  name={f.id}
                  defaultValue=""
                  className="appearance-none border-0 border-b border-cream/30 bg-transparent
                             bg-[length:18px_18px] bg-[position:right_2px_center] bg-no-repeat
                             pb-2 pr-6 font-sans text-16 text-cream outline-none transition-colors
                             focus:border-cream md:pb-3"
                  style={{ backgroundImage: CHEVRON }}
                >
                  <option value="" disabled className="text-ink">
                    Select
                  </option>
                  <CountryOptions />
                </select>
              ) : f.options ? (
                <select
                  id={`lead-${f.id}`}
                  name={f.id}
                  defaultValue=""
                  className="appearance-none border-0 border-b border-cream/30 bg-transparent
                             bg-[length:18px_18px] bg-[position:right_2px_center] bg-no-repeat
                             pb-2 pr-6 font-sans text-16 text-cream outline-none transition-colors
                             focus:border-cream md:pb-3"
                  style={{ backgroundImage: CHEVRON }}
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

/**
 * The country list for both pickers: the priority markets, a rule, then the
 * rest by name. The dial-code picker keys on the ISO code, since several
 * countries share a prefix (+1, +7, +39).
 */
function CountryOptions({ withDial = false }: { withDial?: boolean }) {
  const option = (c: (typeof COUNTRIES)[number]) => (
    <option key={c.code} value={withDial ? c.code : c.name} className="text-ink">
      {withDial ? `${c.name} (${c.dial})` : c.name}
    </option>
  );
  return (
    <>
      {PRIORITY.map(option)}
      <option disabled className="text-ink">
        ──────────
      </option>
      {REST.map(option)}
    </>
  );
}
