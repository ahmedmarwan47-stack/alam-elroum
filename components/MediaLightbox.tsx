"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { asset } from "@/lib/asset";
import type { GalleryItem } from "@/lib/gallery";

type Props = {
  items: GalleryItem[];
  /** Index of the item on show, or null when closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

/**
 * Full-screen viewer for the Media Gallery: the photograph uncropped, or the
 * film with its sound and controls. Arrows and ←/→ step through the set,
 * Esc or the close button leaves. The page stays locked behind it.
 */
export default function MediaLightbox({ items, index, onChange, onClose }: Props) {
  const open = index !== null;
  const item = open ? items[index] : null;
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    closeBtn.current?.focus();
    return () => unlockScroll();
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const step = (by: number) => onChange((index + by + items.length) % items.length);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onChange, onClose]);

  if (!item || index === null) return null;
  const step = (by: number) => onChange((index + by + items.length) % items.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      data-fixed-layer
      data-dark
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-ink/95
                 animate-[caption-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative h-[80vh] w-[92vw] md:w-[84vw]">
        {item.video ? (
          <video
            key={item.video}
            src={asset(item.video)}
            poster={asset(item.src)}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            fill
            sizes="92vw"
            className="object-contain"
          />
        )}
      </div>

      <p className="type-meta absolute bottom-5 left-1/2 -translate-x-1/2 text-cream/60">
        {index + 1} / {items.length}
      </p>

      <button
        ref={closeBtn}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="group absolute top-5 right-5 flex h-10 w-10 items-center justify-center md:top-8 md:right-8"
      >
        <span className="relative block h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-90">
          <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-cream" />
          <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-cream" />
        </span>
      </button>

      {items.length > 1 &&
        ([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            aria-label={dir < 0 ? "Previous" : "Next"}
            onClick={() => step(dir)}
            className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full
                        border border-cream/40 text-cream transition-colors duration-300 hover:bg-cream hover:text-ink
                        md:h-12 md:w-12 ${dir < 0 ? "left-3 md:left-6" : "right-3 md:right-6"}`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
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
        ))}
    </div>
  );
}
