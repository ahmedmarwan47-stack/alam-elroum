"use client";

import { lifestyleLayouts, type LifestyleLayoutId } from "@/lib/lifestyleLayouts";

type Props = {
  value: LifestyleLayoutId;
  onChange: (id: LifestyleLayoutId) => void;
};

/**
 * The presentation control: a floating bar, bottom left, that swaps the
 * Lifestyle section between its four layouts live.
 *
 * Each option carries its scroll cost ("12 screens" against "1 screen")
 * because that is the whole argument — the comparison should be legible on
 * the screen behind it, not something anyone has to take on trust.
 *
 * Deliberately a bar and not a panel: the index layout's list runs down the
 * left side of the screen, and anything taller sat on top of its last two
 * entries. The caption and the explanation live in a card that rises on
 * hover, so nothing is lost and nothing is covered at rest.
 *
 * This is a review tool, not part of the site. Drop <LayoutToggle> from
 * <LifestyleSwitcher> and the chosen layout ships on its own.
 */
export default function LayoutToggle({ value, onChange }: Props) {
  const current = lifestyleLayouts.find((l) => l.id === value) ?? lifestyleLayouts[0];

  return (
    <aside
      data-fixed-layer
      aria-label="Lifestyle section layout"
      className="group fixed bottom-4 left-4 z-800 md:bottom-6 md:left-6"
    >
      {/* Caption and trade-off — only while you are actually using the thing. */}
      <div
        className="pointer-events-none absolute bottom-full left-0 mb-2 w-[260px]
                   rounded-[4px] border border-ink/15 bg-cream/90 p-3
                   shadow-[0_8px_30px_rgba(28,43,58,0.16)] backdrop-blur-md
                   translate-y-1 opacity-0 transition-[opacity,translate] duration-300
                   group-hover:translate-y-0 group-hover:opacity-100"
      >
        <p className="mb-1.5 font-sans text-8 tracking-wide text-ink/45 uppercase md:text-12">
          Lifestyle section — layout
        </p>
        <p className="font-serif text-12 leading-[1.45] text-ink/70">{current.note}</p>
      </div>

      <div
        role="radiogroup"
        className="flex gap-1 rounded-[4px] border border-ink/15 bg-cream/85 p-1
                   shadow-[0_8px_30px_rgba(28,43,58,0.16)] backdrop-blur-md"
      >
        {lifestyleLayouts.map((option) => {
          const on = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(option.id)}
              className={`flex w-[58px] flex-col items-center gap-0.5 rounded-[3px] border px-1 py-1.5
                          transition-[background-color,border-color,color] duration-300 md:w-[64px]
                          ${
                            on
                              ? "border-ink bg-ink text-cream"
                              : "border-transparent bg-transparent text-ink hover:border-ink/25"
                          }`}
            >
              <span className="font-sans text-12 leading-none">{option.label}</span>
              <span
                className={`font-sans text-8 leading-none tabular-nums
                            ${on ? "text-cream/65" : "text-ink/45"}`}
              >
                {option.cost}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
