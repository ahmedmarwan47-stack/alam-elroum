"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, EASE_OUT, reducedMotion } from "@/lib/gsap";
import { pressArticles, type PressArticle } from "@/lib/press";
import PressDrawer from "@/components/PressDrawer";
import { ArrowRightIcon } from "@/components/icons";

/**
 * Press Release — the three latest pieces of coverage in one row, in the site's editorial voice.
 * Each card opens its article in a side drawer rather than leaving the page.
 */
export default function Press() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<PressArticle | null>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = (article: PressArticle) => {
    setActive(article);
    setOpen(true);
  };

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 80%", once: true } })
        .from("[data-tag]", { x: -8, opacity: 0, duration: 0.8, ease: EASE_OUT }, 0)
        .from(
          "[data-heading]",
          { y: 24, opacity: 0, filter: "blur(6px)", duration: 0.9, ease: EASE_OUT, clearProps: "filter" },
          0.05,
        )
        .from(
          "[data-card]",
          { y: 36, opacity: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08 },
          0.2,
        );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="press"
      className="border-t border-ink/12 bg-cream px-6 pt-24 pb-16
                 md:px-[clamp(40px,5vw,80px)] md:py-[clamp(60px,8vh,100px)]"
    >
      <div className="flex flex-col items-start gap-2">
        <span
          data-tag
          className="type-eyebrow text-ink/40"
        >
          Press Release
        </span>
        <h2
          data-heading
          className="type-editorial text-[clamp(28px,3.4vw,48px)] leading-[1.1] text-ink"
        >
          Latest Press Releases
        </h2>
      </div>
      <ul className="mt-10 grid list-none grid-cols-1 gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {pressArticles.slice(0, 3).map((article) => (
          <li key={article.slug} data-card>
            <button
              type="button"
              onClick={() => show(article)}
              className="group flex h-full w-full flex-col gap-5 py-8 text-left"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/10">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms]
                             ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>

              <div className="type-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-ink/50">
                <span>{article.date}</span>
                <span className="h-1 w-1 rounded-full bg-ink/40" />
                <span>{article.readTime}</span>
              </div>

              <h3 className="font-serif text-24 leading-[1.15] text-ink md:text-28">
                {article.title}
              </h3>
              <p className="font-sans text-16 leading-[1.6] text-ink/70">{article.excerpt}</p>

              {/* `mt-auto`, so the link sits on the floor of the card. The
                  grid already stretches every card to the tallest in the row;
                  this is what stops the links themselves from laddering if a
                  title or excerpt ever runs a line longer than its neighbours. */}
              <span className="type-meta mt-auto inline-flex items-center gap-2 pt-1 text-ink">
                Read the article
                <ArrowRightIcon className="h-5 w-5" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <PressDrawer article={active} open={open} onClose={close} />
    </section>
  );
}
