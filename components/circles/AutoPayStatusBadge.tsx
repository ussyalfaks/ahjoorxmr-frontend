"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { isAutoPayActive } from "@/lib/autoPay";

export default function AutoPayStatusBadge({ circleId }: { circleId: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isAutoPayActive(circleId));
  }, [circleId]);

  if (!active) return null;

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
      title="Auto-pay is active for this circle"
    >
      <Zap size={10} aria-hidden="true" />
      Auto-Pay
    </span>
  );
}
