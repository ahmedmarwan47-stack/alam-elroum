"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";
import { isNavigating, scrollToHash, setLenis } from "@/lib/lenis";

/**
 * Drives the page with Lenis and hands scroll position to GSAP's ScrollTrigger.
 *
 * ScrollTrigger reads native scroll by default, which desyncs from Lenis'
 * interpolated position and makes pinned sections jitter. Feeding Lenis'
 * scroll events into ScrollTrigger.update and running Lenis off gsap.ticker
 * keeps both on a single clock.
 *
 * The page also has a speed limit. Lenis eases toward a target; each frame
 * the target is held to at most a fraction of a viewport ahead of where the
 * page actually is, so a hard flick cannot rush past the choreography. Input
 * beyond that is dropped, not queued: when the wheel stops, the page settles
 * within a fraction of a viewport instead of running on. Touch scrolling is
 * native and never fought. In-page links are exempt so navigation stays
 * quick.
 *
 * Also owns in-page anchor links: any `<a href="#…">` glides to its target
 * through Lenis instead of jumping.
 */
const LERP = 0.09;
/** How far ahead of the eased position the scroll target may run, in viewports. */
const MAX_LEAD_VH = 0.32;

export default function SmoothScroll() {
  /*
   * One height for the full-screen stages, in pixels, published as
   * `--stage-h`.
   *
   * It is the *large* viewport — the screen with the browser chrome
   * collapsed, what CSS `100lvh` (and, on phones, plain `100vh`) resolves
   * to — not `innerHeight`, which at load on a phone is the short view with
   * the address bar still up. A stage sized to the short view leaves a band
   * of the next section showing beneath it once the bar goes away, which on
   * the 03 → 04 hand-off is a second copy of the same photograph sliding up
   * under the first. Sized to the large view, the stage's bottom edge simply
   * sits under the bar until the bar collapses, as it does on any site.
   *
   * The pinned tracks then measure their own scroll length from this box
   * (`track height − stage height`) rather than letting ScrollTrigger resolve
   * `bottom bottom` against `innerHeight`, so the two never disagree by a
   * bar's height whatever state the chrome is in.
   *
   * Measured once and republished only when the width changes, which mirrors
   * `ignoreMobileResize`: the address bar collapsing must not move the
   * stages, because it does not move ScrollTrigger's measurements either.
   */
  useEffect(() => {
    const root = document.documentElement;
    let width = window.innerWidth;
    const largeViewport = () => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
      document.body.appendChild(probe);
      const h = probe.offsetHeight;
      probe.remove();
      // A browser without `lvh` leaves the probe at zero height.
      return Math.max(h, window.innerHeight);
    };
    const publish = () => {
      root.style.setProperty("--stage-h", `${largeViewport()}px`);
    };
    publish();
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      publish();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      e.preventDefault();
      // Let any overlay that owns this link close first, then travel.
      window.setTimeout(() => scrollToHash(hash), 60);
    };
    document.addEventListener("click", onClick);

    // Respect the OS setting — skip smooth scrolling entirely.
    if (reducedMotion()) return () => document.removeEventListener("click", onClick);

    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    // Trigger positions are measured before the web fonts swap in on a first
    // visit; re-measure once they have, so nothing pins or fires off by a
    // line of text.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // The speed limit. Each frame, if the wheel has pushed Lenis's target
    // further than one lead ahead of the eased position, pull it back to the
    // lead — the excess is simply discarded. A reverse nudge therefore turns
    // the page at once, and nothing keeps travelling after the wheel stops.
    // Hands off while a finger is down or the browser is scrolling natively,
    // otherwise Lenis would re-enter its smooth mode and ignore the touch.
    const tick = (time: number) => {
      if (!isNavigating() && !lenis.isTouching && lenis.isScrolling !== "native") {
        const lead = lenis.targetScroll - lenis.animatedScroll;
        const maxLead = window.innerHeight * MAX_LEAD_VH;
        if (Math.abs(lead) > maxLead) {
          lenis.scrollTo(lenis.animatedScroll + Math.sign(lead) * maxLead, {
            programmatic: false,
            lerp: LERP,
          });
        }
      }
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
