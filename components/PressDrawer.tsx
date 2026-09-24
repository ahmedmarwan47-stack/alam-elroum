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
    const focus = window.setTimeout(() => closeBtn.current?.focus(), 350);
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
      data-fixed-layer
      className={`fixed inset-0 z-[1100] overflow-hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Dim */}
      <button
        type="button"
        aria-label="Close article"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-700
                    ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={shown?.title ?? "Article"}
        data-dark={undefined}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-cream
                    shadow-[-24px_0_60px_rgba(28,43,58,0.3)] transition-transform
                    duration-750 ease-[cubic-bezier(0.76,0,0.24,1)] md:w-[min(520px,42vw)]
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="px-6 pt-5 md:px-10 md:pt-6">
          <button
            ref={closeBtn}
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

        <div
          ref={scroller}
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {shown && (
            <article
              key={shown.slug}
              className={`transition-[opacity,transform] delay-150 duration-700
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
              <div className="px-6 pt-8 pb-12 md:px-10 md:pt-8">
                <h2 className="font-serif text-[22px] leading-[1.15] font-normal text-ink md:text-28">
                  {shown.title}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-12 tracking-[0.04em] text-rust md:text-16">
                  <span>Press Release</span>
                  <span aria-hidden>·</span>
                  <span>{shown.date}</span>
                  <span aria-hidden>·</span>
                  <span>{shown.readTime}</span>
                </div>
                <p className="mt-8 font-sans text-18 leading-[1.7] text-ink/85">
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
