import type { Metadata } from "next";
import { haas, immortel } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
import { SCROLLER_ID } from "@/lib/scroller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alam Al Roum — A Coastline Shaped for Greatness",
  description:
    "Alam Al Roum unfolds across 7.2 kilometres of Mediterranean shoreline and 22 kilometres of lagoon. A city where coastal living, open water, and urban life meet.",
  openGraph: {
    title: "Alam Al Roum — A Coastline Shaped for Greatness",
    type: "website",
  },
  twitter: {
    title: "Alam Al Roum — A Coastline Shaped for Greatness",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${haas.variable} ${immortel.variable}`}>
      <body>
        <SmoothScroll />
        {/* The page scrolls in here, not as the document — see lib/scroller.ts.
            Lenis wants a separate content element to measure. */}
        <div id={SCROLLER_ID} className="fixed inset-0 overflow-x-hidden overflow-y-auto">
          <div id={`${SCROLLER_ID}-content`}>{children}</div>
        </div>
      </body>
    </html>
  );
}
