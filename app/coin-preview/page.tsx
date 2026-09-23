"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { jumpTo } from "@/lib/scroller";
import { restingPose, type CoinPose } from "@/components/coin/CoinScene";
import SweepLink from "@/components/SweepLink";

const CoinScene = dynamic(() => import("@/components/coin/CoinScene"), { ssr: false });

type Concept = "marker" | "handover" | "tilt";

const CONCEPTS: { id: Concept; n: string; title: string; blurb: string }[] = [
  {
    id: "marker",
    n: "03",
    title: "Section marker",
    blurb: "Scroll down. The coin rises out of the panel and turns to face you while the headline types in.",
  },
  {
    id: "handover",
    n: "04",
    title: "Hand-over coin",
    blurb: "Scroll down. The coin lands beside the form as the card settles, then flips once when you submit.",
  },
  {
    id: "tilt",
    n: "05",
    title: "Cursor-aware tilt",
    blurb: "Move the pointer. The coin tips a few degrees toward it and settles back when you leave.",
  },
];

/* ── 03 Section marker ─────────────────────────────────────────────────── */
function Marker() {
  const root = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), spin: 0, bob: 0 });
  const [typed, setTyped] = useState(0);
  const text = "For centuries, this headland guided sailors home.";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap.current,
        { y: 260, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.5,
            onUpdate: (s) => {
              pose.current.rotY = (1 - s.progress) * Math.PI * 2.5;
              pose.current.rotX = (1 - s.progress) * 0.6;
              pose.current.spin = s.progress > 0.98 ? 0.12 : 0;
              pose.current.bob = s.progress > 0.98 ? 0.03 : 0;
            },
          },
        },
      );
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 40%",
        once: true,
        onEnter: () => {
          let i = 0;
          const iv = setInterval(() => {
            i += 1;
            setTyped(i);
            if (i >= text.length) clearInterval(iv);
          }, 45);
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-cream">
      <div className="flex h-[70vh] items-end px-10 pb-10 font-sans text-16 tracking-[0.18em] text-ink/40 uppercase">
        Scroll
      </div>
      <div ref={root} className="grid min-h-screen grid-cols-1 items-center gap-10 px-10 md:grid-cols-2">
        <div>
          <p className="font-sans text-16 italic tracking-[0.18em] text-ink/40">( About )</p>
          <h2 className="type-caret mt-6 min-h-[2.2em] font-sans text-[clamp(28px,3.4vw,48px)] leading-[1.1] font-bold text-ink uppercase">
            {text.slice(0, typed)}
          </h2>
        </div>
        <div ref={wrap} className="mx-auto h-[360px] w-[360px]">
          <CoinScene pose={pose} className="h-full w-full" />
        </div>
      </div>
      <div className="h-[60vh]" />
    </div>
  );
}

/* ── 04 Hand-over coin ─────────────────────────────────────────────────── */
function Handover() {
  const root = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), spin: 0, bob: 0 });
  const flipping = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap.current,
        { x: -420, y: -140, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            end: "top 10%",
            scrub: 0.5,
            onUpdate: (s) => {
              if (flipping.current) return;
              pose.current.rotY = s.progress * Math.PI * 2;
              pose.current.spin = s.progress > 0.98 ? 0.14 : 0;
              pose.current.bob = s.progress > 0.98 ? 0.03 : 0;
            },
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const flip = () => {
    if (flipping.current) return;
    flipping.current = true;
    const from = { v: pose.current.rotY };
    gsap.to(from, {
      v: pose.current.rotY + Math.PI * 2,
      duration: 1.4,
      ease: "power3.inOut",
      onUpdate: () => {
        pose.current.rotY = from.v;
      },
      onComplete: () => {
        flipping.current = false;
      },
    });
    gsap.fromTo(wrap.current, { y: 0 }, { y: -60, yoyo: true, repeat: 1, duration: 0.7, ease: "power2.out" });
  };

  return (
    <div className="bg-cream">
      <div className="flex h-[70vh] items-end px-10 pb-10 font-sans text-16 tracking-[0.18em] text-ink/40 uppercase">
        Scroll
      </div>
      <div ref={root} className="flex min-h-screen items-center px-10">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 md:grid-cols-[1fr_300px]">
          <div data-dark className="grid gap-8 rounded-[2px] bg-ink p-12 text-cream md:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="font-sans text-16 italic tracking-[0.18em] text-cream/50">( Register Interest )</p>
              <h2 className="mt-6 font-serif text-[clamp(28px,3vw,40px)] leading-[1.1]">Be among the first to discover Alam Al Roum</h2>
            </div>
            <form
              className="grid grid-cols-2 gap-x-8 gap-y-7"
              onSubmit={(e) => {
                e.preventDefault();
                flip();
              }}
            >
              {["Full name", "Email", "Phone number", "Nationality"].map((l) => (
                <label key={l} className="flex flex-col gap-2 font-sans text-16 text-cream/60">
                  {l}
                  <input className="border-0 border-b border-cream/30 bg-transparent pb-3 text-cream outline-none focus:border-cream" />
                </label>
              ))}
              <div className="col-span-2">
                <SweepLink type="submit" label="Register Interest" className="border-cream/80 text-cream" fill="bg-cream" hoverText="group-hover:text-ink" />
              </div>
            </form>
          </div>
          <div ref={wrap} className="mx-auto h-[280px] w-[280px]">
            <CoinScene pose={pose} className="h-full w-full" />
          </div>
        </div>
      </div>
      <div className="h-[60vh]" />
    </div>
  );
}

/* ── 05 Cursor-aware tilt ─────────────────────────────────────────────── */
function Tilt() {
  const area = useRef<HTMLDivElement>(null);
  const pose = useRef<CoinPose>({ ...restingPose(), spin: 0.04 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    let raf = 0;
    const loop = () => {
      pose.current.rotX += (target.current.y - pose.current.rotX) * 0.08;
      pose.current.rotZ += (target.current.x * 0.4 - pose.current.rotZ) * 0.08;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      target.current = { x: nx * 0.35, y: ny * 0.35 };
    };
    const onLeave = () => (target.current = { x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={area} className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-[420px] w-[420px]">
        <CoinScene pose={pose} className="h-full w-full" />
      </div>
    </div>
  );
}

export default function CoinPreview() {
  const [concept, setConcept] = useState<Concept>("marker");
  const active = CONCEPTS.find((c) => c.id === concept)!;

  useEffect(() => {
    jumpTo(0);
    ScrollTrigger.refresh();
  }, [concept]);

  return (
    <main className="bg-cream text-ink">
      <header className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center gap-4 border-b border-ink/12 bg-cream/90 px-6 py-4 backdrop-blur">
        <span className="font-serif text-24">Coin concepts</span>
        <div className="flex gap-2">
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setConcept(c.id)}
              className={`rounded-[2px] border px-4 py-2 font-serif text-16 uppercase tracking-[0.02em] transition-colors
                          ${concept === c.id ? "border-ink bg-ink text-cream" : "border-ink/30 text-ink hover:border-ink"}`}
            >
              {c.n} {c.title}
            </button>
          ))}
        </div>
        <p className="w-full font-sans text-16 text-ink/60 md:w-auto md:flex-1">{active.blurb}</p>
      </header>
      <div className="pt-24">
        {concept === "marker" && <Marker key="marker" />}
        {concept === "handover" && <Handover key="handover" />}
        {concept === "tilt" && <Tilt key="tilt" />}
      </div>
    </main>
  );
}
