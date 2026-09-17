"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import type { PressArticle } from "@/lib/press";

type Props = {
  /** The article to show — kept by the parent while the drawer slides out. */
  article: PressArticle | null;
  open: boolean;
  onClose: () => void;
};

/**
 * The article reader. Slides in from the right on the site's panel ease while
 * the page dims; the content scrolls inside, the page behind stays put. The
 * last article stays rendered while the drawer slides out so the exit never
 * shows an empty panel.
 */
export default function PressDrawer({ article, open, onClose }: Props) {
  const shown = article;
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    scroller.current?.scrollTo({ top: 0 });
    const focus = window.setTimeout(() => closeBtn.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[1100] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Dim */}
      <button
        type="button"
        aria-label="Close article"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-ink/45 transition-opacity duration-700
                    ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={shown?.title ?? "Article"}
        data-dark={undefined}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-cream
                    shadow-[-24px_0_60px_rgba(28,43,58,0.25)] transition-transform
                    duration-750 ease-[cubic-bezier(0.76,0,0.24,1)] md:w-[560px]
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ink/12 px-6 py-4 md:px-10">
          <span className="font-sans text-12 text-ink/45 md:text-16">
            Press
          </span>
          <button
            ref={closeBtn}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full
                       border border-ink/20 transition-[background-color,border-color]
                       duration-400 hover:border-ink hover:bg-ink"
          >
            <span className="relative block h-[18px] w-[18px]">
              <span
                className="absolute top-1/2 left-1/2 h-px w-[18px] -translate-x-1/2 -translate-y-1/2
                           rotate-45 bg-ink transition-[transform,background-color] duration-500
                           ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-[135deg] group-hover:bg-cream"
              />
              <span
                className="absolute top-1/2 left-1/2 h-px w-[18px] -translate-x-1/2 -translate-y-1/2
                           -rotate-45 bg-ink transition-[transform,background-color] duration-500
                           ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-45 group-hover:bg-cream"
              />
            </span>
          </button>
        </div>

        <div
          ref={scroller}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {shown && (
            <article
              key={shown.slug}
              className={`transition-[opacity,transform] delay-200 duration-700
                          ease-[cubic-bezier(0.16,1,0.3,1)]
                          ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <div className="relative mx-6 mt-6 aspect-[16/10] overflow-hidden md:mx-10 md:mt-8">
                <Image
                  src={shown.image}
                  alt={shown.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
              <div className="px-6 py-8 md:px-10 md:py-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-12 tracking-[0.04em] text-ink/50 md:text-16">
                  <span>{shown.source}</span>
                  <span className="h-1 w-1 rounded-full bg-ink/40" />
                  <span>{shown.date}</span>
                  <span className="h-1 w-1 rounded-full bg-ink/40" />
                  <span>{shown.readTime}</span>
                </div>
                <h2 className="mt-5 font-serif text-[clamp(28px,3vw,40px)] leading-[1.1] text-ink">
                  {shown.title}
                </h2>
                <div className="mt-6 h-px w-8 bg-ink" />
                <p className="mt-6 font-serif text-18 leading-[1.7] text-ink">
                  {shown.excerpt}
                </p>
                {shown.body.map((para, i) => (
                  <p key={i} className="mt-5 font-sans text-16 leading-[1.75] text-ink/80">
                    {para}
                  </p>
                ))}
              </div>
            </article>
          )}
        </div>
      </aside>
    </div>
  );
}
