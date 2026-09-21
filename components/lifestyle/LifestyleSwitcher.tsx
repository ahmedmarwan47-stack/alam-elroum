"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { lifestyleLayouts, type LifestyleLayoutId } from "@/lib/lifestyleLayouts";
import LayoutToggle from "./LayoutToggle";
import StackLayout from "./StackLayout";
import IndexLayout from "./IndexLayout";
import RailLayout from "./RailLayout";

const STORE_KEY = "alam:lifestyle-layout";

const LAYOUTS: Record<LifestyleLayoutId, ComponentType> = {
  stack: StackLayout,
  index: IndexLayout,
  rail: RailLayout,
};

const isLayoutId = (v: string | null): v is LifestyleLayoutId =>
  !!v && lifestyleLayouts.some((l) => l.id === v);

/* ---------------------------------------------------------------------------
   The chosen layout, as an external store rather than component state.

   It has to survive a reload — a refresh mid-presentation dropping back to
   the layout you were arguing against would be a bad look — and the server
   cannot know what is in localStorage. `useSyncExternalStore` is the honest
   way to say that: render the default on the server, read the real value on
   the client, with no effect writing state behind React's back.
--------------------------------------------------------------------------- */
let chosen: LifestyleLayoutId | null = null;
let listeners: Array<() => void> = [];

const readStored = (): LifestyleLayoutId => {
  if (chosen) return chosen;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (isLayoutId(saved)) chosen = saved;
  } catch {
    /* private mode, blocked storage — the default is fine */
  }
  return chosen ?? "stack";
};

const subscribe = (notify: () => void) => {
  listeners.push(notify);
  return () => {
    listeners = listeners.filter((l) => l !== notify);
  };
};

const store = {
  subscribe,
  get: readStored,
  server: (): LifestyleLayoutId => "stack",
  set(next: LifestyleLayoutId) {
    chosen = next;
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      /* the choice just won't survive a reload */
    }
    listeners.forEach((l) => l());
  },
};

/**
 * Owns which Lifestyle layout is on the page, and carries the anchor
 * (`#ls-outer`) the menu links to, so every layout answers to the same link.
 *
 * Switching is the delicate part. The stack is twelve viewports and the index
 * is one, so changing layout moves the bottom of the document by the better
 * part of ten thousand pixels. Everything below — the pinned press sections,
 * the coin's whole flight path — is positioned from scroll offsets measured
 * at layout time, so the swap has to hand ScrollTrigger a fresh measurement
 * and put the reader back at the top of the section, or they land somewhere
 * unrelated and the coin animates against a page that no longer exists.
 */
export default function LifestyleSwitcher() {
  const layout = useSyncExternalStore(store.subscribe, store.get, store.server);

  const choose = (next: LifestyleLayoutId) => {
    if (next === layout) return;
    store.set(next);

    // Two frames: one for React to commit the new layout, one for the browser
    // to lay it out. Measuring inside the first would get the old height.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const el = document.getElementById("ls-outer");
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          getLenis()?.scrollTo(top, { immediate: true });
          window.scrollTo({ top, behavior: "auto" });
        }
        // Again, now that scroll has landed — pinned sections resolve their
        // start and end against the position they are refreshed at.
        ScrollTrigger.refresh();
      });
    });
  };

  const Layout = LAYOUTS[layout];

  return (
    <>
      <div id="ls-outer">
        <Layout />
      </div>
      <LayoutToggle value={layout} onChange={choose} />
    </>
  );
}
