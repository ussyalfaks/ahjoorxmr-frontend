"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CHANGELOG, markChangelogSeen, type ChangelogCategory } from "@/data/changelog";

const CATEGORIES: ChangelogCategory[] = ["New", "Improved", "Fixed"];

const TAG_STYLES: Record<ChangelogCategory, string> = {
  New: "bg-[#6c5ce715] text-[#8b7cf8]",
  Improved: "bg-[#34D39915] text-[#34D399]",
  Fixed: "bg-[#FBBF2415] text-[#FBBF24]",
};

export default function ChangelogPage() {
  const [filter, setFilter] = useState<ChangelogCategory | "All">("All");

  useEffect(() => {
    markChangelogSeen();
  }, []);

  const entries = [...CHANGELOG]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((e) => filter === "All" || e.categories.includes(filter));

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-[var(--text)]">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6">
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </Link>
      <h1 className="text-3xl font-bold font-sora mb-2">Changelog</h1>
      <p className="text-[var(--muted)] mb-8">What we&apos;ve shipped, improved and fixed.</p>

      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter by category">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === c ? "bg-[#6c5ce7] text-white" : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-[var(--muted)]">No entries in this category yet.</p>
      ) : (
        <ol className="space-y-10 border-l border-[var(--ov-14)] pl-6">
          {entries.map((e) => (
            <li key={e.id} id={e.id}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)] mb-1">
                <span className="font-mono">v{e.version}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={e.date}>
                  {new Date(e.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </div>
              <h2 className="text-xl font-semibold font-sora mb-2">{e.title}</h2>
              <div className="flex gap-2 mb-3">
                {e.categories.map((c) => (
                  <span key={c} className={`text-xs font-medium px-2 py-0.5 rounded-full ${TAG_STYLES[c]}`}>{c}</span>
                ))}
              </div>
              <p className="text-[var(--muted)] leading-relaxed">{e.description}</p>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
