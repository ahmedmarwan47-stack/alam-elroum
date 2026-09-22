import RailLayout from "./RailLayout";

/**
 * The Lifestyle section, carrying the anchor (`#ls-outer`) the menu links to.
 *
 * This used to own a live choice between three layouts with a floating
 * toggle, review-tool style. The rail won that argument on every width — one
 * pinned screen on desktop, an ordinary swipeable rail on phones — so it is
 * simply what ships. <StackLayout> is kept in the tree, unreferenced, as the
 * record of what it replaced.
 */
export default function LifestyleSwitcher() {
  return (
    <div id="ls-outer">
      <RailLayout />
    </div>
  );
}
