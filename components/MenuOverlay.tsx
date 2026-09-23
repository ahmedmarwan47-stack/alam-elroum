"use client";

import { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import SweepLink from "./SweepLink";
import { DownloadIcon } from "./icons";
import { BROCHURE_HREF } from "@/lib/contact";

const ITEMS = [
  { n: "01", label: "About", href: "#about" },
  { n: "02", label: "The Vision", href: "#s4-trigger" },
  { n: "03", label: "The Masterplan", href: "#s6" },
  { n: "04", label: "Lifestyle & Experiences", href: "#ls-outer" },
  { n: "05", label: "Gallery", href: "#gallery" },
  { n: "06", label: "Location", href: "#connectSection" },
  { n: "07", label: "Press Release", href: "#press" },
];

/**
 * Full-screen menu. Two panels slide in from opposite edges — cream statement
 * on the left, rust navigation on the right — then the links stagger up and a
 * Register Interest button follows. On mobile only the rust panel shows,
 * matching the original.
 */
export default function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close on Escape, and stop the page scrolling behind the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <div
      id="menuOverlay"
      aria-hidden={!open}
      data-fixed-layer
      className={`fixed inset-0 z-900 flex
                  ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Statement panel — desktop only */}
      <div
        className={`hidden flex-col justify-end bg-cream p-10 transition-transform
                    duration-750 ease-[cubic-bezier(0.76,0,0.24,1)]
                    md:flex md:w-[45%] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <p
          className="mb-6 font-sans text-[clamp(28px,3.5vw,48px)] leading-[1.12]
                     font-medium tracking-[-0.01em] text-ink"
        >
          Alam Al Roum,
          <br />
          A Coastline Shaped
          <br />
          for{" "}
          <em className="font-serif font-normal italic tracking-normal">
            Greatness.
          </em>
        </p>
        <p className="font-sans text-12 text-ink/60 md:text-16">
          Mediterranean , Egypt
        </p>
      </div>

      {/* Navigation panel */}
      <nav
        className={`flex w-full flex-col justify-end bg-rust px-7 pt-25 pb-10
                    transition-transform duration-750 ease-[cubic-bezier(0.76,0,0.24,1)]
                    md:w-[55%] md:px-[50px] md:py-10 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <ul className="list-none">
          {ITEMS.map((item, i) => (
            <li
              key={item.n}
              className={`border-t border-white/18 transition-all duration-500 last:border-b
                          ${open ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
              style={{ transitionDelay: open ? `${0.35 + i * 0.07}s` : "0s" }}
            >
              <a
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-5 py-4 font-sans text-16
                           text-white no-underline transition-opacity duration-300
                           hover:opacity-70"
              >
                <span className="min-w-6 text-12 opacity-50">
                  {item.n} —
                </span>
                <span className="relative">
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0
                               bg-white/70 transition-transform duration-500
                               ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* The two calls to action, as buttons rather than list entries:
            the brochure outlined, Register Interest solid. Stacked on phones,
            side by side from md up. */}
        <div
          className={`mt-8 flex flex-col gap-3 transition-[opacity,transform] duration-500
                      md:flex-row
                      ${open ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
          style={{ transitionDelay: open ? `${0.35 + ITEMS.length * 0.07}s` : "0s" }}
        >
          <SweepLink
            href={BROCHURE_HREF}
            external
            label={
              <span className="inline-flex items-center gap-2">
                <DownloadIcon className="h-[18px] w-[18px]" />
                Download Brochure
              </span>
            }
            className="border-cream/80 text-cream"
            fill="bg-cream"
            hoverText="group-hover:text-rust"
          />
          <SweepLink
            href="#lead"
            onClick={onClose}
            label="Register Interest"
            bg="bg-cream"
            className="border-cream text-rust"
            fill="bg-ink"
            hoverText="group-hover:text-cream"
          />
        </div>
      </nav>
    </div>
  );
}
