export type LifestyleLayoutId = "stack" | "index" | "rail";

export type LifestyleLayoutOption = {
  id: LifestyleLayoutId;
  /** Shown in the toggle. */
  label: string;
  /** What it costs the reader, in screens of scroll — the whole comparison. */
  cost: string;
  /** One line, shown under the toggle so the trade-off is on screen. */
  note: string;
};

/**
 * The three ways the Lifestyle section can be laid out, in the order the
 * toggle offers them: the build as it stands, then two shorter answers to
 * it. The `cost` figures are measured, not estimated — the stack really is
 * twelve viewports, which on a 29-viewport page is two fifths of the entire
 * scroll, and the reason any of this exists.
 */
export const lifestyleLayouts: LifestyleLayoutOption[] = [
  {
    id: "stack",
    label: "Stack",
    cost: "12 screens",
    note: "Today's build. One card per screen — and you only ever see 1 of 11.",
  },
  {
    id: "index",
    label: "Index",
    cost: "3 screens",
    note: "Four, four and three — list one side, picture the other, mirrored.",
  },
  {
    id: "rail",
    label: "Rail",
    cost: "4 screens",
    note: "One pinned screen, cards travelling sideways, with 11 stops in view.",
  },
];
