import { AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import type { CircleHealthScore } from "@/lib/circleHealth";

const styles = {
  healthy: {
    icon: ShieldCheck,
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  attention: {
    icon: HeartPulse,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  risk: {
    icon: AlertTriangle,
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
} as const;

export default function CircleHealthIndicator({ health }: { health: CircleHealthScore }) {
  const { icon: Icon, className } = styles[health.level];
  const tooltip = `Health score ${health.score}%. Driven by ${Math.round(health.onTimeRate * 100)}% on-time contributions, ${health.missedContributions} missed contribution${health.missedContributions === 1 ? "" : "s"}, ${Math.round(health.payoutReliability * 100)}% payout reliability, and ${health.disputes} recorded dispute${health.disputes === 1 ? "" : "s"}.`;

  return (
    <span className="group relative inline-flex max-w-full" tabIndex={0} title={tooltip} aria-label={tooltip}>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
        <Icon size={14} aria-hidden="true" />
        <span>{health.label}</span>
        <span className="font-mono">{health.score}</span>
      </span>
      <span role="tooltip" className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-64 rounded-lg bg-[var(--text)] px-3 py-2 text-left text-xs font-normal leading-5 text-[var(--bg)] shadow-lg group-hover:block group-focus:block">
        {tooltip}
      </span>
    </span>
  );
}