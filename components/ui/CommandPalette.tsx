"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Plus,
  UserPlus,
  Wallet,
  Lock,
  LayoutGrid,
  Settings,
  Award,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const OPEN_COMMAND_PALETTE_EVENT = "ahjoor:open-command-palette";

type Group = "Circles" | "Actions" | "Pages";

interface PaletteItem {
  id: string;
  group: Group;
  label: string;
  sublabel?: string;
  keywords?: string;
  icon: LucideIcon;
  href: string;
}

// Static/mock data sources. Swap for real queries once circle search/actions
// have an API to back them.
const MOCK_CIRCLES: PaletteItem[] = [
  { id: "circle-1", group: "Circles", label: "Family savings", sublabel: "50 USDT · 2 Days", icon: Users, href: "/dashboard/circles/1" },
  { id: "circle-2", group: "Circles", label: "School fees", sublabel: "40 USDT · 12 Days", icon: Users, href: "/dashboard/circles/2" },
  { id: "circle-3", group: "Circles", label: "Community Fund", sublabel: "25 USDT · 5 Days", icon: Users, href: "/dashboard/circles/3" },
  { id: "circle-4", group: "Circles", label: "Holiday Savings", sublabel: "200 USDT · 30 Days", icon: Users, href: "/dashboard/circles/4" },
  { id: "circle-5", group: "Circles", label: "Emergency Pool", sublabel: "75 USDT · 10 Days", icon: Users, href: "/dashboard/circles/5" },
];

const ACTIONS: PaletteItem[] = [
  { id: "action-create", group: "Actions", label: "Create Circle", keywords: "new start", icon: Plus, href: "/dashboard/circles?action=create" },
  { id: "action-join", group: "Actions", label: "Join Circle", keywords: "discover browse", icon: UserPlus, href: "/dashboard/circles?tab=discover" },
  { id: "action-payouts", group: "Actions", label: "View Payouts", keywords: "money withdraw", icon: Wallet, href: "/dashboard/payouts" },
];

const PAGES: PaletteItem[] = [
  { id: "page-overview", group: "Pages", label: "Dashboard Overview", icon: LayoutGrid, href: "/dashboard" },
  { id: "page-circles", group: "Pages", label: "Circles", icon: Users, href: "/dashboard/circles" },
  { id: "page-achievements", group: "Pages", label: "Achievements & Badges", keywords: "trophies medals rewards", icon: Award, href: "/dashboard/achievements" },
  { id: "page-locked-funds", group: "Pages", label: "Locked Funds", icon: Lock, href: "/dashboard/locked-funds" },
  { id: "page-payouts", group: "Pages", label: "Payouts", icon: Wallet, href: "/dashboard/payouts" },
  { id: "page-settings", group: "Pages", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const ALL_ITEMS: PaletteItem[] = [...MOCK_CIRCLES, ...ACTIONS, ...PAGES];
const GROUP_ORDER: Group[] = ["Circles", "Actions", "Pages"];

/** Substring matches rank above ordered-subsequence fuzzy matches; -1 means no match. */
function matchScore(query: string, item: PaletteItem): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const haystack = `${item.label} ${item.sublabel ?? ""} ${item.keywords ?? ""}`.toLowerCase();
  const idx = haystack.indexOf(q);
  if (idx !== -1) return 100 - idx;

  let qi = 0;
  for (let hi = 0; hi < haystack.length && qi < q.length; hi++) {
    if (haystack[hi] === q[qi]) qi++;
  }
  return qi === q.length ? 10 : -1;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  const results = useMemo(() => {
    const scored = ALL_ITEMS
      .map((item) => ({ item, score: matchScore(query, item) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score);
    return scored.map(({ item }) => item);
  }, [query]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: results.filter((item) => item.group === group),
    })).filter((g) => g.items.length > 0);
  }, [results]);

  useEffect(() => {
    setActiveId(results[0]?.id ?? null);
  }, [results]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    document.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent);
    };
  }, []);

  useFocusTrap(containerRef, open, close);

  const selectItem = useCallback(
    (item: PaletteItem) => {
      router.push(item.href);
      setOpen(false);
    },
    [router]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length === 0) return;
      const currentIndex = results.findIndex((r) => r.id === activeId);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = results[(currentIndex + 1) % results.length];
        setActiveId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = results[(currentIndex - 1 + results.length) % results.length];
        setActiveId(prev.id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const active = results.find((r) => r.id === activeId);
        if (active) selectItem(active);
      }
    },
    [results, activeId, selectItem]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--ov-14)] shadow-2xl overflow-hidden"
        style={{ background: "var(--modal)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--ov-0f)]">
          <Search size={18} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={activeId ?? undefined}
            autoComplete="off"
            autoFocus
            placeholder="Search circles, actions, pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-[var(--muted)] px-1.5 py-0.5 rounded border border-[var(--ov-14)] shrink-0">
            Esc
          </kbd>
        </div>

        <div
          id="command-palette-listbox"
          role="listbox"
          aria-label="Search results"
          className="max-h-[360px] overflow-y-auto py-2"
        >
          {grouped.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                  {group}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveId(item.id)}
                      onClick={() => selectItem(item)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive ? "bg-[var(--ov-0f)]" : "hover:bg-[var(--ov-0a)]"
                      }`}
                    >
                      <Icon size={16} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-[var(--text)] truncate">{item.label}</span>
                        {item.sublabel && (
                          <span className="block text-xs text-[var(--muted)] truncate">{item.sublabel}</span>
                        )}
                      </span>
                      {isActive && (
                        <CornerDownLeft size={14} className="text-[var(--faint)] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
