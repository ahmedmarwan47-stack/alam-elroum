"use client";

import type { ReactNode } from "react";

type Props = {
  label: ReactNode;
  /** Border and resting text colour, e.g. "border-ink text-ink". */
  className?: string;
  /** Background of the fill that rises on hover, e.g. "bg-ink". */
  fill: string;
  /**
   * Resting background for the solid variant, e.g. "bg-ink". Leave unset for
   * the outlined button. The border should match it so the two variants
   * stay the same height and weight side by side.
   */
  bg?: string;
  /** Opens in a new tab, for links off the site. */
  external?: boolean;
  /** Saves the target as a file with this name instead of navigating to it. */
  download?: string;
  /** Text colour once the fill is up, as a group-hover class, e.g. "group-hover:text-cream". */
  hoverText: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  style?: React.CSSProperties;
};

/**
 * The site's one button: 44px tall, outlined or — with `bg` — solid. The
 * label matches the live site's CTAs: Neue Haas Grotesk, 12px uppercase,
 * semibold (the live site's 600 resolves to the Bold file, as it does here),
 * 0.16em tracking. On hover a fill rises from the bottom edge and the label changes
 * colour a beat later, once the fill is most of the way up. Fills the width
 * on phones; content-width from md up.
 */
export default function SweepLink({
  label,
  className = "",
  fill,
  hoverText,
  bg = "",
  external = false,
  download,
  href,
  type = "button",
  onClick,
  style,
}: Props) {
  const classes = `group relative inline-flex h-11 w-full cursor-pointer items-center justify-center
                   overflow-hidden rounded-[2px] border px-5 font-sans text-12 leading-none
                   font-semibold tracking-nav uppercase
                   whitespace-nowrap md:w-auto
                   transition-[border-color,background-color,opacity,transform] duration-500
                   ${bg} ${className}`;
  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full transition-transform duration-500
                    ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 ${fill}`}
      />
      <span
        className={`relative transition-colors delay-150 duration-300 ease-out ${hoverText}`}
      >
        {label}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={classes}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(download ? { download } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} style={style}>
      {inner}
    </button>
  );
}
