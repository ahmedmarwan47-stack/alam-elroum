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
 * Transparent over the hero with white marks. Once the page scrolls it sits on
 * a single translucent cream bar with ink marks — one state, no flipping as
 * sections change. Presentational: menu state is owned by <SiteChrome>.
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
  const bar = menuOpen ? "bg-cream/95" : scrolled ? "bg-cream/88" : "bg-transparent";

  const markColor = light ? "text-white" : "text-ink";
  const contactLink = `hidden items-center gap-2 font-serif text-16 leading-none
                       transition-[color,opacity] duration-500 hover:opacity-70 lg:flex ${markColor}`;
  const iconOnly = `flex h-9 w-9 items-center justify-center transition-colors duration-500 lg:hidden ${markColor}`;

  return (
    <nav
      data-dark={light ? "" : undefined}
      className={`fixed inset-x-0 top-0 z-1000 flex items-center justify-between px-4 py-3
                  transition-[background-color,transform,opacity] duration-500 ease-out
                  md:px-15 md:py-[18px] ${bar}
                  ${entered ? "translate-y-0 opacity-100 delay-[600ms]" : "-translate-y-3 opacity-0"}`}
    >
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
