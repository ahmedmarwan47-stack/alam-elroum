"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import SweepLink from "./SweepLink";
import { CallIcon, WhatsAppIcon } from "./icons";
import { PHONE_HREF, WHATSAPP_HREF } from "@/lib/contact";

type Props = {
  menuOpen: boolean;
  onToggleMenu: () => void;
};

/**
 * Fixed header.
 *
 * Transparent over the hero with white marks, backed by a black scrim — a
 * top-down gradient plus a blur, both masked to fade out before the bar's own
 * bottom edge so nothing spills past the header — which keeps the marks
 * readable over whatever the hero is playing underneath. Once the page scrolls
 * it sits on a single translucent cream bar with ink marks — one state, no
 * flipping as sections change. Presentational: menu state is owned by
 * <SiteChrome>.
 */
export default function Nav({ menuOpen, onToggleMenu }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const onBurst = () => setEntered(true);
    window.addEventListener("preloader:burst", onBurst, { once: true });
    return () => window.removeEventListener("preloader:burst", onBurst);
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const light = !scrolled && !menuOpen;

  const markColor = light ? "text-white" : "text-ink";
  const contactLink = `hidden items-center gap-2 font-serif text-16 leading-none
                       transition-[color,opacity] duration-500 hover:opacity-70 lg:flex ${markColor}`;
  const iconOnly = `flex h-9 w-9 items-center justify-center transition-colors duration-500 lg:hidden ${markColor}`;

  return (
    <nav
      data-dark={light ? "" : undefined}
      className={`fixed inset-x-0 top-0 z-1000 flex items-center justify-between px-4 py-3
                  transition-[transform,opacity] duration-500 ease-out
                  md:px-15 md:py-[18px]
                  ${entered ? "translate-y-0 opacity-100 delay-[600ms]" : "-translate-y-3 opacity-0"}`}
    >
      {/* The cream bar, as its own layer rather than the nav's background: on
          its own it can leave faster (300ms) than the scrim arrives (500ms),
          so the swap never settles on a half-cream, half-black blend — which
          is what read as a washed-out grey band on the way back up. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 ease-out
                    ${menuOpen ? "bg-cream/95" : "bg-cream/88"}
                    ${light ? "opacity-0" : "opacity-100"}`}
      />

      {/* Scrim for the transparent state — two layers, deliberately.
          Chromium promotes an element that has both `backdrop-filter` and an
          animated `opacity` to its own layer, where it loses its real backdrop
          and paints as a flat pale haze; the bug only shows once the opacity
          transition has run, i.e. on the way back up to the hero. So the blur
          animates its own filter and never its opacity, and the gradient — which
          does fade — carries no filter. Both are `absolute inset-0`, which ties
          them to the bar's exact height, and `-z-10` keeps them under the marks
          but over the (transparent) bar. The mask ends them softly just inside
          the bottom edge instead of on a visible seam. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10
                    transition-[backdrop-filter,-webkit-backdrop-filter] duration-500 ease-out
                    [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]
                    [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]
                    ${light ? "backdrop-blur-[6px]" : "backdrop-blur-none"}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10
                    bg-gradient-to-b from-black/65 via-black/35 to-transparent
                    transition-opacity duration-500 ease-out
                    [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]
                    [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]
                    ${light ? "opacity-100" : "opacity-0"}`}
      />

      <a href="#" aria-label="Alam Al Roum" className="flex items-center">
        <Image
          src="/images/logo-wordmark.png"
          alt="Alam Al Roum"
          width={187}
          height={17}
          priority
          className={`h-3 w-auto transition-[filter] duration-500 md:h-[17px]
                      ${light ? "brightness-0 invert" : ""}`}
        />
      </a>

      <Image
        src="/images/image-17.png"
        alt="Qatari Diar"
        width={34}
        height={34}
        priority
        className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2
                   rounded-[2px] md:h-[34px] md:w-[34px]"
      />

      <div className="flex items-center gap-2 md:gap-6">
        {/* Call / WhatsApp — labels from lg up, icons only below */}
        <a href={PHONE_HREF} className={contactLink}>
          <CallIcon className="h-[18px] w-[18px]" />
          <span>Call us</span>
        </a>
        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className={contactLink}>
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          <span>WhatsApp</span>
        </a>
        <a href={PHONE_HREF} aria-label="Call us" className={iconOnly}>
          <CallIcon className="h-[18px] w-[18px]" />
        </a>
        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={iconOnly}>
          <WhatsAppIcon className="h-[18px] w-[18px]" />
        </a>

        {/* Hidden on mobile — the menu carries Register Interest there. */}
        <div className="hidden md:block">
          <SweepLink
            href="#lead"
            label="Register Interest"
            className={light ? "border-white/80 text-white" : "border-ink text-ink"}
            fill="bg-ink"
            hoverText="group-hover:text-cream"
          />
        </div>

        {/* "+" that rotates into "×" when open, as on the original */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
          className="relative ml-1 flex h-7 w-7 shrink-0 items-center justify-center"
        >
          <span className="relative block h-[22px] w-[22px]">
            <span
              className={`absolute top-1/2 left-1/2 h-px w-[18px] -translate-x-1/2 -translate-y-1/2
                          transition-[transform,background-color] duration-400
                          ease-[cubic-bezier(0.76,0,0.24,1)]
                          ${light ? "bg-white" : "bg-ink"} ${menuOpen ? "rotate-45" : ""}`}
            />
            <span
              className={`absolute top-1/2 left-1/2 h-[18px] w-px -translate-x-1/2 -translate-y-1/2
                          transition-[transform,background-color] duration-400
                          ease-[cubic-bezier(0.76,0,0.24,1)]
                          ${light ? "bg-white" : "bg-ink"} ${menuOpen ? "rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>
    </nav>
  );
}
