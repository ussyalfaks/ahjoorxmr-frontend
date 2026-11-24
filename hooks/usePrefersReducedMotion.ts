"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * True when the user has asked the OS to minimise motion. Use it to skip
 * JS-driven animations (confetti, ticking counters, etc.); CSS animations are
 * already handled globally in app/global.css. Starts `false` on the server and
 * updates live if the preference changes.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return;
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}
