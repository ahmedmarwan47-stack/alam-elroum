"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";

export type MasterplanPlace = {
  title: string;
  category: string;
  scenes: {
    image: string;
    description: string;
  }[];
};

type Props = {
  place: MasterplanPlace;
  open: boolean;
  onClose: () => void;
  onPreviousPlace: () => void;
  onNextPlace: () => void;
  placeIndex: number;
  placeCount: number;
};

/** Detail panel for the interactive masterplan pins. */
export default function MasterplanDrawer({
  place,
  open,
  onClose,
  onPreviousPlace,
  onNextPlace,
  placeIndex,
  placeCount,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const scene = place.scenes[0];

  useEffect(() => {
    if (!open) return;
    lockScroll();
    scroller.current?.scrollTo({ top: 0 });
    const focus = window.setTimeout(() => closeButton.current?.focus(), 350);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      data-fixed-layer
      className={`fixed inset-0 z-[1100] overflow-hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close masterplan details"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-700
                    ${open ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={place.title}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-cream
                    shadow-[-24px_0_60px_rgba(28,43,58,0.3)] transition-transform
                    duration-750 ease-[cubic-bezier(0.76,0,0.24,1)] md:w-[min(520px,42vw)]
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="px-6 pt-5 md:px-10 md:pt-6">
          <button
            ref={closeButton}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="group relative flex h-9 w-9 items-center justify-center"
          >
            <span className="relative block h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-90">
              <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-ink" />
              <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-ink" />
            </span>
          </button>
          <span aria-hidden className="mt-4 block h-px w-full bg-ink/20" />
        </div>

        <div ref={scroller} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          <article
            key={place.title}
            className={`transition-[opacity,transform] delay-150 duration-700
                        ease-[cubic-bezier(0.16,1,0.3,1)]
                        ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <div
              key={scene.image}
              className="drawer-scene-in relative mx-6 mt-6 aspect-[16/10] overflow-hidden md:mx-10 md:mt-8"
            >
              <Image
                src={scene.image}
                alt={place.title}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>

            <div className="px-6 pt-8 pb-12 md:px-10 md:pt-8">
              <h3 className="font-serif text-[22px] leading-[1.15] font-normal text-ink md:text-28">
                {place.title}
              </h3>
              <p className="type-eyebrow mt-3 text-rust">{place.category}</p>
              <p
                key={scene.description}
                className="drawer-scene-in mt-8 font-sans text-16 leading-[1.7] text-ink/85 md:text-18"
              >
                {scene.description}
              </p>
            </div>
          </article>
        </div>

        <div className="flex items-center gap-6 px-6 pb-6 md:px-10 md:pb-8">
          <div className="relative h-px flex-1 overflow-hidden bg-ink/18">
            <span
              className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-500
                         ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${((placeIndex + 1) / placeCount) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Previous masterplan location"
              onClick={onPreviousPlace}
              className="text-20 text-ink transition-transform duration-300 hover:-translate-x-1"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next masterplan location"
              onClick={onNextPlace}
              className="text-20 text-ink transition-transform duration-300 hover:translate-x-1"
            >
              →
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
