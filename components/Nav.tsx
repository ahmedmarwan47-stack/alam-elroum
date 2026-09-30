"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import SweepLink from "./SweepLink";
import { CallIcon, DownloadIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "./icons";
import {
  BROCHURE_FILENAME,
  BROCHURE_HREF,
  FACEBOOK_HREF,
  INSTAGRAM_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  WHATSAPP_HREF,
} from "@/lib/contact";

type Props = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

/**
 * Fixed header: one translucent cream bar with ink marks — the wordmark, the
 * Qatari Diar seal in the middle, and on the right the direct channels (the
 * hotline, then WhatsApp, Facebook and Instagram as bare icons), the two
 * calls to action and the menu. It holds from the top of the page to the
 * bottom, hero included, so nothing flips as sections change.
 *
 * The channels used to ride in a thin ink strip above the bar; they moved
 * into it, and the buttons went compact to make the room. Below `lg` the
 * buttons live in the menu and the hotline drops its number, leaving four
 * icons beside the burger. Presentational: menu state is owned by
 * <SiteChrome>.
 */
export default function Nav({ menuOpen, onToggleMenu }: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const onBurst = () => setEntered(true);
    window.addEventListener("preloader:burst", onBurst, { once: true });
    return () => window.removeEventListener("preloader:burst", onBurst);
  }, []);

  const channel = "flex items-center gap-2 text-ink/75 transition-colors duration-300 hover:text-ink";

  return (
    <header
      data-fixed-layer
      className={`fixed inset-x-0 top-0 z-1000 transition-[transform,opacity] duration-500 ease-out
                  ${entered ? "translate-y-0 opacity-100 delay-[600ms]" : "-translate-y-3 opacity-0"}`}
    >
      <nav className="relative isolate flex items-center justify-between px-4 py-3 md:px-15 md:py-[18px]">
        {/* The cream bar, as its own layer rather than the nav's background,
            so the menu can deepen it without touching the nav's own stacking. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 transition-colors duration-300 ease-out
                      ${menuOpen ? "bg-cream/95" : "bg-cream/88"}`}
        />

        <a href="#" aria-label="Alam Al Roum" className="flex items-center">
          <Image
            src="/images/logo-wordmark.png"
            alt="Alam Al Roum"
            width={187}
            height={17}
            priority
            className="h-3 w-auto md:h-[17px]"
          />
        </a>

        <Image
          src="/images/image-17.png"
          alt="Qatari Diar"
          width={96}
          height={96}
          priority
          className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2
                     rounded-[2px] object-contain md:h-12 md:w-12"
        />

        <div className="flex items-center gap-2 md:gap-3">
          {/* The direct channels. Right of the seal there is room for the
              hotline's number only on a wide screen; below that its icon
              still dials it. */}
          <div className="flex items-center gap-2.5 font-sans text-[11px] leading-none tracking-link uppercase md:gap-3.5">
            <a href={PHONE_HREF} aria-label={`Call ${PHONE_DISPLAY}`} className={channel}>
              <CallIcon className="h-4 w-4" />
              <span className="hidden min-[1440px]:inline">{PHONE_DISPLAY}</span>
            </a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={channel}>
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <a href={FACEBOOK_HREF} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={channel}>
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={channel}>
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
          <span aria-hidden className="hidden h-6 w-px bg-ink/15 lg:block" />

          {/* Two calls to action — the brochure outlined, Register Interest
              solid so the pair reads as secondary and primary. Compact, and
              each only as wide as its label, so the channels fit beside them.
              The menu carries both wherever the bar cannot. */}
          <div className="hidden items-center gap-2 lg:flex">
            <div className="hidden xl:flex">
              <SweepLink
                href={BROCHURE_HREF}
                download={BROCHURE_FILENAME}
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <DownloadIcon className="h-4 w-4" />
                    Brochure
                  </span>
                }
                size="compact"
                className="border-ink text-ink"
                fill="bg-ink"
                hoverText="group-hover:text-cream"
              />
            </div>
            <SweepLink
              href="#lead"
              label="Register Interest"
              size="compact"
              bg="bg-ink"
              className="border-ink text-cream"
              fill="bg-cream"
              hoverText="group-hover:text-ink"
            />
          </div>

          {/* Hamburger that folds into an ×. Two rules only: each bar slides to
              the centre line and turns. `top` and `rotate` are separate CSS
              properties, so both can be transitioned without touching
              `transform` — which is where Tailwind v4 puts the centring
              translate and would otherwise fight the turn. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center md:ml-1"
          >
            <span className="relative block h-6 w-6">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`absolute left-0 h-px w-full origin-center bg-ink transition-[top,rotate]
                              duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]
                              ${
                                menuOpen
                                  ? i === 0
                                    ? "top-1/2 rotate-45"
                                    : "top-1/2 -rotate-45"
                                  : i === 0
                                    ? "top-[8px] rotate-0"
                                    : "top-[16px] rotate-0"
                              }`}
                />
              ))}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
