import { useEffect } from "react";
import { sanitizeCircleRules, type CircleRulesRecord } from "@/lib/circleRules";

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <span key={index}>{part}</span>
  );
}

export default function CircleRulesView({
  rules,
  onViewed,
}: {
  rules: CircleRulesRecord;
  onViewed?: () => void;
}) {
  const lines = sanitizeCircleRules(rules.markdown).split("\n");

  useEffect(() => {
    onViewed?.();
  }, [onViewed]);

  return (
    <div className="space-y-2 text-sm leading-6 text-[var(--muted)]">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" aria-hidden="true" />;
        if (trimmed.startsWith("### ")) return <h4 key={index} className="pt-2 font-semibold text-[var(--text)]">{renderInline(trimmed.slice(4))}</h4>;
        if (trimmed.startsWith("## ")) return <h3 key={index} className="pt-2 font-semibold text-[var(--text)]">{renderInline(trimmed.slice(3))}</h3>;
        if (trimmed.startsWith("# ")) return <h2 key={index} className="pt-2 font-bold text-[var(--text)]">{renderInline(trimmed.slice(2))}</h2>;
        if (/^[-*] /.test(trimmed)) return <li key={index} className="ml-5 list-disc pl-1">{renderInline(trimmed.slice(2))}</li>;
        if (/^\d+\. /.test(trimmed)) return <li key={index} className="ml-5 list-decimal pl-1">{renderInline(trimmed.replace(/^\d+\. /, ""))}</li>;
        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}