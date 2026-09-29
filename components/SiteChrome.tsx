"use client";

import { useEffect, useState } from "react";
import Nav from "./Nav";
import MenuOverlay from "./MenuOverlay";
import Preloader from "./Preloader";

/**
 * Everything that floats above the page: the entrance preloader, the header
 * and the menu. Owns the menu open/closed state so the header button and the
 * overlay stay in step, and mirrors it onto <html>.
 */
export default function SiteChrome() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  return (
    <>
      <Preloader />
      <Nav menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
