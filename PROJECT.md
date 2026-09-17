# Alam Al Roum — Project Context

> Manually maintained. Updated **only** when explicitly asked — never automatically.
> Last updated: 2026-09-16

---

## 1. What this project is

A rebuild of the Alam Al Roum landing page (`alamalroumegypt.com`) on a modern
stack, plus a Figma reconstruction of the same page.

Three artefacts exist:

| Artefact | Where | Status |
|---|---|---|
| **Next.js rebuild** | repo root | 11/11 sections built |
| **Original site** | `reference/` | Untouched mirror, kept for comparison |
| **Figma file** | `figma.com/design/tzCB8XbXPjzpCvmtj6x8gn` | Page "Landing Page", complete |

---

## 2. Stack

- **Next.js 16.3.5** (App Router) · **React 19.2** · **TypeScript**
- **Tailwind v4** — CSS-based `@theme`, *no* `tailwind.config.ts`; tokens live in `app/globals.css`
- **GSAP 3.15 + ScrollTrigger** — all scroll animation
- **Lenis 1.3.26** — smooth scroll, driven off `gsap.ticker` so both share one clock
- Fonts self-hosted via `next/font/local`

Run: `npm run dev` → **http://localhost:3000** (the only server; the old 4173
reference server was retired).

---

## 3. Structure

```
app/
  fonts.ts          next/font/local — Haas (6 weights) + Immortel (2)
  globals.css       design tokens as Tailwind v4 @theme
  layout.tsx        fonts, metadata, SmoothScroll mount
  page.tsx          section composition
components/
  SiteChrome.tsx    owns menu open/closed state
  Nav.tsx           presentational header
  MenuOverlay.tsx   full-screen menu
  SmoothScroll.tsx  Lenis ⇄ ScrollTrigger bridge
  FloatingSeals.tsx fixed brand seals + dark-background detection
  sections/
    Hero · About · PinnedReveal · Sequence · Statement
    Feature · LifestyleStack · Connect · Legacy · Footer
lib/
  lifestyle.ts      the 11 lifestyle cards as data
reference/          original site, for comparison
```

**Two components cover eleven-plus sections:** `PinnedReveal` serves both 03 and
05 (identical mechanic), and `LifestyleStack` renders all 11 cards from
`lib/lifestyle.ts`.

---

## 4. Design system

Derived from the original, with the agreed deviations below.

### Type scale (4px grid; 14 and 18 permitted exceptions)
`8 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48`

### Minimums (client rule — overrides pixel-matching)
- **Mobile: 12px** minimum
- **Desktop: 16px** minimum

This is the single biggest visual departure. The original uses 10–15px for every
small label; all of those step up to 16px.

### Leading
Px values, rounded to the 4px grid: `12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · 52 · 56`

### Tracking
Kept at the original's literal px values — sub-pixel typographic tracking, not
layout spacing, so the 4px grid deliberately does **not** apply:

`stat −0.8 · display −0.46 · heading −0.34 · label 0.8 · sub 1.1 · link 1.32 ·
section 1.54 · unit 1.8 · nav 1.92 · tag 1.98 · wide 2.2 · menu 2.24`

### Palette
```
--color-ink        #1C2B3A
--color-cream      #F0EDE6
--color-rust       #8B2A1A
--color-dark-rust  #6B1F0E
--color-teal       #1A6B72
```

### Spacing
Tailwind's default ramp is already 4px-based (`--spacing: 0.25rem`), so
`p-19` = 76px, `p-20` = 80px, `p-30` = 120px. No custom scale needed.

---

## 5. Match against the original (1512×950)

| Section | Original | Rebuild |
|---|---|---|
| 01 Hero | 950 | **950** ✓ |
| 02 About | 950 | **950** ✓ |
| 03 Vision | 1900 | **1900** ✓ |
| 04 Sequence | 2375 | **2375** ✓ |
| 05 Masterplan | 1900 | **1900** ✓ |
| 06 Statement | 1106 | 1231 |
| 07 Feature | 1344 | 1200 |
| 08 Lifestyle | 11400 | **11400** ✓ |
| 09 Connect | 915 | 979 |
| 10 Legacy | 790 | 678 |
| 11 Footer | 644 | 577 |
| **Total** | **24,274** | **24,140** |

Key element checks: hero headline `x:76 y:423` (original `76/423`), hero location
`left:75.6px` (original `75.6px`), Sequence panel slides to `x:877` (original
`877`).

The five sections that differ are all text-heavy — they reflow because of the
16px desktop minimum. Not errors.

---

## 6. Deliberate deviations from the original

1. **16px desktop / 12px mobile type minimums** — client rule. Reflows five sections.
2. **4px grid** — e.g. headline 46 → 48px. That pushed the hero headline past its
   580px max-width onto three lines, so the max-width widened to **608px** to
   hold two.
3. **Mobile header CTA removed** — the original sets it to `font-size: 5px`, which
   is unreadable. Slated to move into the nav menu.
4. **Figma file uses a different system** — 60px padding and percentage
   leading/tracking. Deliberately *not* a pixel match; the code is. The two are
   knowingly out of sync.
5. **Hero intro animation exists here but not on the live site.** Built at the
   client's request as new work, not a copy — see §7. The *settled* state is
   unaffected (headline still `x:76 y:423 h:105`), so the intro plays and then
   gets out of the way. If the rebuild and the live site are compared side by
   side, this is the one thing that will look unfamiliar.

---

## 7. Things worth knowing

- **The original's JS is obfuscated** (`javascript-obfuscator`, ~1,016 encoded
  string lookups). Nothing in `reference/` can be read or ported — all animation
  in the rebuild was written from scratch.
- **The hero intro animation does not exist on the live site — but does here.**
  The circles are in the original markup, killed by
  `.hero-image-wrap { display: none !important; }` (reference/index.html:346) —
  the only `display` declaration for them, so they never render at any width.
  The author's comment: *"Hero circles removed — the full-screen picture shows
  immediately."* Rebuilt in `components/sections/Hero.tsx` from that dead CSS:
  820×600 container at `left:66%`, blobs 500×500 and 480×480 offset
  `top:80px / left:300px`, radius `60% 40% 55% 45% / 45% 55% 40% 60%`, using the
  previously-unused `hero-c1.png` / `hero-c2.png`. Sequence: blobs drift up on
  cream with ink type → blobs scale away → photograph fades in → type flips to
  white. Honours `prefers-reduced-motion` by jumping to the settled state.
- **The lifestyle band is a card stack**, not 11 sequential sections — absolutely
  positioned, ascending z-index, one sticky viewport, ~12× viewport scroll track.
- **The menu's right panel is rust**, not navy.
- **Tracking analytics were stripped** from the original (GTM `GTM-NBLN7QG5`,
  GA4 `G-YVC82ND8MR`, Meta Pixel `987264647647585`).

### Gotchas that cost time

- **ScrollTrigger offsets belong on the trigger side.** `"top+=N top"`, not
  `"top top+=N"` — the latter offsets the viewport edge and silently resolves
  every trigger past its end.
- **Use element refs, not selector strings**, inside `gsap.context` timelines.
  Selector strings silently did nothing in `Sequence`; the fix was refs.
- **Converting a frame to auto-layout in Figma inflates its width** if a bleeding
  child is still in flow. Reset size explicitly afterwards.
- **`data-dark` must wrap only dark elements**, never a container that also holds
  light ones — the Sequence's cream panel inherited it and flipped the seals white.
- Measurements taken immediately after `navigate` can be stale. Wait for layout.

---

## 8. Fonts

| Family | Registered as | Note |
|---|---|---|
| Immortel | `Immortel Infra Trial VAR` (styles `Roman`, `Italic`) | **Trial licence** |
| Neue Haas Grotesk | `NeueHaasGroteskText W02` / `W02 Md` / `W02 Bd` (+italics) | Monotype W02 web-service files |
| Adobe Arabic | `Adobe Arabic` | Adobe CC font |

Family names differ from the CSS names — `Immortel` is `Immortel Infra Trial VAR`
with style **`Roman`** (not `Regular`), and each Haas weight is its own family.

**Licensing is the client's responsibility, to be resolved before launch.**

---

## 9. Not built / open

- Contact form has **no endpoint** — submit is inert (`preventDefault`).
- Mobile nav CTA — to move into the menu.
- Figma file not re-synced to the code's token system.
- Figma file does not include the hero intro animation (added to the code after
  the Figma build).

---

## 10. Figma file

`figma.com/design/tzCB8XbXPjzpCvmtj6x8gn` — page **"Landing Page"**.

- One vertical auto-layout frame, 1512 × 20,146, 21 sections
- 25 nav instances from one `⟡ Nav / Sticky Header` component
- 3 component sets with ON_DRAG Smart Animate: Vision (2 variants), Sequence (3,
  chained), Masterplan (2)
- Parked off-canvas at x:2200 — component sets, `⟡ Menu Overlay`, `⟡ Floating Seals`

Known gaps vs the code: missing `.lifestyle-divider`; menu right panel built navy
instead of rust; lifestyle modelled as sequential sections rather than a card stack.
