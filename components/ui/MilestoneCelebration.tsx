"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PartyPopper, Trophy, Users, X } from "lucide-react";
import {
  CELEBRATE_EVENT,
  attachCelebrationOverlay,
  detachCelebrationOverlay,
  type CelebrationKind,
  type CelebrationMilestone,
} from "@/lib/milestoneCelebrations";

const DISPLAY_MS = 5000;
const CONFETTI_MS = 2800;
const COLORS = ["#4ADE80", "#4B6B76", "#FBBF24", "#60A5FA", "#F472B6", "#A78BFA"];

const ICONS: Record<CelebrationKind, typeof Trophy> = {
  round_completed: PartyPopper,
  circle_fully_funded: Users,
  final_payout_completed: Trophy,
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
}

/** Runs a canvas confetti burst; returns a function that stops it early. */
function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  // Fewer particles on small screens keeps mobile smooth.
  const count = window.innerWidth < 640 ? 80 : 150;
  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.3,
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: -Math.random() * 12 - 4,
    size: Math.random() * 6 + 4,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const startedAt = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const elapsed = now - startedAt;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = Math.max(0, 1 - elapsed / CONFETTI_MS);
    for (const p of particles) {
      p.vy += 0.35; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (elapsed < CONFETTI_MS) frame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };
}

/**
 * Global overlay that plays when a milestone is celebrated. It's fixed and
 * pointer-transparent (except the card), so it never shifts layout or blocks
 * the page. Multiple milestones queue and play one after another.
 */
export default function MilestoneCelebration() {
  const [queue, setQueue] = useState<CelebrationMilestone[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = queue[0] ?? null;

  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReducedMotion(prefersReducedMotion());
    const onChange = () => setReducedMotion(prefersReducedMotion());
    media?.addEventListener?.("change", onChange);

    const onCelebrate = (e: Event) => {
      const milestone = (e as CustomEvent<CelebrationMilestone>).detail;
      if (milestone) setQueue((q) => (q.some((m) => m.key === milestone.key) ? q : [...q, milestone]));
    };
    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    const pending = attachCelebrationOverlay();
    if (pending.length) setQueue((q) => [...q, ...pending.filter((m) => !q.some((x) => x.key === m.key))]);
    return () => {
      detachCelebrationOverlay();
      media?.removeEventListener?.("change", onChange);
      window.removeEventListener(CELEBRATE_EVENT, onCelebrate);
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    const stopConfetti = !reducedMotion && canvasRef.current ? runConfetti(canvasRef.current) : () => {};
    const timer = window.setTimeout(dismiss, DISPLAY_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      stopConfetti();
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [current, reducedMotion, dismiss]);

  if (!current) return null;
  const Icon = ICONS[current.kind];

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-live="polite">
      {!reducedMotion && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />}

      <div
        role="status"
        className={`pointer-events-auto absolute inset-x-4 bottom-24 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-[var(--ov-14)] bg-[var(--modal)] p-4 shadow-2xl sm:bottom-auto sm:top-6 ${
          reducedMotion ? "" : "animate-[celebrate-pop_300ms_ease-out]"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4ADE80]/15 text-[#4ADE80]">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">{current.title}</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{current.message}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full p-1 text-[var(--muted)] transition-colors hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Dismiss celebration"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
