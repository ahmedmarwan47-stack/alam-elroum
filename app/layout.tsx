import type { Metadata } from "next";
import { haas, immortel } from "./fonts";
import SmoothScroll from "@/components/SmoothScroll";
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
        {children}
      </body>
    </html>
  );
}
