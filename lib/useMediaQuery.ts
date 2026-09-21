"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` rather than state-plus-effect: the server has no
 * viewport, so the honest shape is "external system React reads from", and it
 * keeps the first client render from being a second render.
 *
 * `fallback` is what the server renders. Default true — these layouts are
 * authored desktop-first and the presentation they exist for happens on one,
 * so a phone takes the one-frame correction rather than a laptop.
 */
export function useMediaQuery(query: string, fallback = true) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** The site's one breakpoint, as used by every layout here. */
export const DESKTOP = "(min-width: 768px)";
