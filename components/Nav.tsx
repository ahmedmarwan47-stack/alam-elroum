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
 * Fixed header.
 *
 * A thin ink strip carrying the direct channels — phone and WhatsApp, then
 * Facebook and Instagram; split to either end on phones, all on the right
 * from md up — over a translucent cream bar
 * with ink marks. Both hold from the top of the page to the bottom, hero
 * included, so nothing flips as sections change. The strip's height is
 * `--strip-h` (globals.css), which sections that clear the header add to the
 * bar's own height. Presentational: menu state is owned by <SiteChrome>.
 */
export default function Nav({ menuOpen, onToggleMenu }: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const onBurst = () => setEntered(true);
    window.addEventListener("preloader:burst", onBurst, { once: true });
    return () => window.removeEventListener("preloader:burst", onBurst);
  }, []);

  const stripLink = `flex items-center gap-2 text-cream/80 transition-colors duration-300 hover:text-cream`;

  return (
    <header
      data-fixed-layer
      className={`fixed inset-x-0 top-0 z-1000 transition-[transform,opacity] duration-500 ease-out
                  ${entered ? "translate-y-0 opacity-100 delay-[600ms]" : "-translate-y-3 opacity-0"}`}
    >
      <div
        className="flex h-[var(--strip-h)] items-center justify-between bg-ink px-4
                   font-sans text-[11px] leading-none tracking-link uppercase
                   md:justify-end md:gap-5 md:px-15"
      >
        <div className="flex items-center gap-5">
          <a href={PHONE_HREF} aria-label={`Call ${PHONE_DISPLAY}`} className={stripLink}>
            <CallIcon className="h-[14px] w-[14px]" />
            <span>{PHONE_DISPLAY}</span>
          </a>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={stripLink}>
            <WhatsAppIcon className="h-[14px] w-[14px]" />
            <span>WhatsApp</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href={FACEBOOK_HREF} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={stripLink}>
            <FacebookIcon className="h-[14px] w-[14px]" />
          </a>
          <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={stripLink}>
            <InstagramIcon className="h-[14px] w-[14px]" />
          </a>
        </div>
      </div>

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

        <div className="flex items-center gap-2 md:gap-4">
          {/* Two calls to action — the brochure outlined, Register Interest
              solid so the pair reads as secondary and primary. Two equal grid
              columns hold them to the same width (the wider label's). The menu
              carries both wherever the bar cannot. */}
          <div className="hidden gap-3 lg:grid xl:grid-cols-[1fr_1fr]">
            <div className="hidden xl:grid">
              <SweepLink
                href={BROCHURE_HREF}
                download={BROCHURE_FILENAME}
                label={
                  <span className="inline-flex items-center gap-2">
                    <DownloadIcon className="h-[18px] w-[18px]" />
                    Download Brochure
                  </span>
                }
                className="border-ink text-ink"
                fill="bg-ink"
                hoverText="group-hover:text-cream"
              />
            </div>
            <SweepLink
              href="#lead"
              label="Register Interest"
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
            className="relative ml-1 flex h-9 w-9 shrink-0 items-center justify-center"
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
