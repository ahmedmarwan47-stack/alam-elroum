/**
 * The page scrolls inside one full-screen container rather than as a
 * document, and this is the only place that knows its name.
 *
 * Why: iOS Safari collapses and expands its toolbar as the document scrolls,
 * and every transition moves the layout viewport under the page for a few
 * frames. Pinned stages, sticky boxes and fixed elements all jump with it —
 * about 75px, both ways, every time the reader reverses direction. A page
 * that scrolls in an element instead of the document never triggers the
 * toolbar, so the viewport, `--stage-h` and every pin stay exactly still.
 * The price is the bar staying at its full height, which on a phone is a
 * few dozen pixels of screen.
 *
 * Everything that used to read `window.scrollY` or listen to the window's
 * `scroll` goes through here instead; ScrollTrigger and Lenis are pointed
 * at the same element in `lib/gsap.ts` and <SmoothScroll>.
 */
export const SCROLLER_ID = "scroller";
export const SCROLLER_SELECTOR = `#${SCROLLER_ID}`;

export const getScroller = (): HTMLElement | null =>
  typeof document === "undefined" ? null : document.getElementById(SCROLLER_ID);

/** Current scroll offset of the page. */
export const scrollTop = (): number => getScroller()?.scrollTop ?? 0;

/** Height of the visible page area — the stage height on every width. */
export const viewportHeight = (): number =>
  getScroller()?.clientHeight ?? window.innerHeight;

/** Jump the page to an offset. */
export const jumpTo = (top: number) => {
  const el = getScroller();
  if (el) el.scrollTop = top;
};
