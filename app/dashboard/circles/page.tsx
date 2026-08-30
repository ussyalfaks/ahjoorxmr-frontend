"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, LayoutGrid, List, Search, Star, X } from "lucide-react";
import CreateCircleModal from "@/components/modals/CreateCircleModal";
import JoinCircleModal, { type JoinCircleData } from "@/components/modals/JoinCircleModal";
import CircleGridCard from "@/components/circles/CircleGridCard";
import CircleListRow from "@/components/circles/CircleListRow";
import { useCircleViewPreference } from "@/hooks/useCircleViewPreference";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  MOCK_CIRCLES,
  CURRENT_WALLET,
  filterCirclesByQuery,
  type DiscoverCircle,
} from "@/data/circles";

// ---------------------------------------------------------------------------
// View toggle button
// ---------------------------------------------------------------------------
function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] p-0.5 gap-0.5"
      role="group"
      aria-label="Circle display view"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
          view === "grid"
            ? "bg-[var(--ov-14)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        <LayoutGrid size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
          view === "list"
            ? "bg-[var(--ov-14)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        <List size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view column header row
// ---------------------------------------------------------------------------
function ListHeader() {
  return (
    <div
      className="hidden sm:grid items-center gap-x-4 px-4 py-2 rounded-lg bg-[var(--ov-05)] mb-1
        grid-cols-[minmax(180px,2fr)_120px_100px_80px_110px_auto]"
      role="rowgroup"
      aria-label="Circle list column headers"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Circle
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Contribution
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Members
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Round
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Next payout
      </span>
      <span className="sr-only">Action</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({
  tab,
  hasQuery,
}: {
  tab: "my" | "discover" | "bookmarked";
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      {hasQuery ? (
        <>
          <Search size={32} className="text-[var(--muted)]" aria-hidden="true" />
          <p className="text-[var(--muted)] text-base">No circles match your search.</p>
        </>
      ) : tab === "bookmarked" ? (
        <>
          <Star size={32} className="text-[var(--muted)]" aria-hidden="true" />
          <p className="text-[var(--muted)] text-base">
            You haven&apos;t bookmarked any circles yet.
          </p>
        </>
      ) : (
        <p className="text-[var(--muted)] text-base">
          {tab === "my"
            ? "You haven't joined any circles yet."
            : "No open circles available to join right now."}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content (inside Suspense for useSearchParams)
// ---------------------------------------------------------------------------
type Tab = "my" | "discover" | "bookmarked";

function CirclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tab: Tab = (searchParams.get("tab") as Tab) ?? "my";
  const inviteId = searchParams.get("invite");
  const action = searchParams.get("action");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinCircle, setJoinCircle] = useState<JoinCircleData | null>(null);
  const [query, setQuery] = useState("");

  const { view, setView } = useCircleViewPreference();
  const { bookmarkedIds } = useBookmarks();

  // Handle invite / create deep-link params
  useEffect(() => {
    if (!inviteId) return;
    const circle = MOCK_CIRCLES.find((c) => c.id === inviteId);
    if (circle) setJoinCircle(circle);
  }, [inviteId, allCircles]);

  useEffect(() => {
    if (action === "create") {
      setCreateOpen(true);
      router.replace("/dashboard/circles");
    }
  }, [action, router]);

  const setTab = (t: Tab) => {
    setQuery(""); // clear search when switching tabs
    router.push(`/dashboard/circles?tab=${t}`);
  };

  // Derive filtered list — memo keeps it cheap on re-render
  const baseCircles = useMemo<DiscoverCircle[]>(() => {
    if (tab === "my") return MOCK_CIRCLES.filter((c) => c.members.includes(CURRENT_WALLET));
    if (tab === "bookmarked") return MOCK_CIRCLES.filter((c) => bookmarkedIds.includes(c.id));
    return MOCK_CIRCLES.filter((c) => !c.members.includes(CURRENT_WALLET));
  }, [tab, bookmarkedIds]);

  const displayCircles = useMemo(
    () => filterCirclesByQuery(baseCircles, query),
    [baseCircles, query]
  );

  const isDiscover = tab === "discover";
  const isBookmarked = tab === "bookmarked";

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* ---- Page title row ---- */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold font-sora text-[var(--text)] shrink-0">
            Circles
          </h1>
          <div className="h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 shrink-0 px-4 py-2 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <Plus size={16} aria-hidden="true" />
            Create Circle
          </button>
        </div>

        {/* ---- Tabs + search + view toggle ---- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div
            className="flex border-b border-[var(--ov-1a)] sm:border-b-0"
            role="tablist"
            aria-label="Circle views"
          >
            <button
              role="tab"
              aria-selected={tab === "my"}
              aria-controls="circles-panel"
              onClick={() => setTab("my")}
              className={`px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px sm:mb-0 sm:rounded-lg ${
                tab === "my"
                  ? "text-[var(--text)] border-b-2 border-white sm:border-0 sm:bg-[var(--ov-0a)]"
                  : "text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent sm:border-0 sm:hover:bg-[var(--ov-07)]"
              }`}
            >
              My Circles
              <span
                className="ml-2 text-xs text-[var(--muted)] tabular-nums"
                aria-label={`${MOCK_CIRCLES.filter((c) => c.members.includes(CURRENT_WALLET)).length} circles`}
              >
                {MOCK_CIRCLES.filter((c) => c.members.includes(CURRENT_WALLET)).length}
              </span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "discover"}
              aria-controls="circles-panel"
              onClick={() => setTab("discover")}
              className={`px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px sm:mb-0 sm:rounded-lg ${
                tab === "discover"
                  ? "text-[var(--text)] border-b-2 border-white sm:border-0 sm:bg-[var(--ov-0a)]"
                  : "text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent sm:border-0 sm:hover:bg-[var(--ov-07)]"
              }`}
            >
              Discover
              <span
                className="ml-2 text-xs text-[var(--muted)] tabular-nums"
                aria-label={`${MOCK_CIRCLES.filter((c) => !c.members.includes(CURRENT_WALLET)).length} circles`}
              >
                {MOCK_CIRCLES.filter((c) => !c.members.includes(CURRENT_WALLET)).length}
              </span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "bookmarked"}
              aria-controls="circles-panel"
              onClick={() => setTab("bookmarked")}
              className={`flex items-center px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px sm:mb-0 sm:rounded-lg ${
                tab === "bookmarked"
                  ? "text-[var(--text)] border-b-2 border-white sm:border-0 sm:bg-[var(--ov-0a)]"
                  : "text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent sm:border-0 sm:hover:bg-[var(--ov-07)]"
              }`}
            >
              <Star size={13} aria-hidden="true" className="mr-1.5" />
              Bookmarked
              <span
                className="ml-2 text-xs text-[var(--muted)] tabular-nums"
                aria-label={`${MOCK_CIRCLES.filter((c) => bookmarkedIds.includes(c.id)).length} circles`}
              >
                {MOCK_CIRCLES.filter((c) => bookmarkedIds.includes(c.id)).length}
              </span>
            </button>
          </div>

          {/* Search + view toggle */}
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1 sm:flex-none sm:w-52">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search circles…"
                aria-label="Search circles"
                className="w-full h-9 pl-8 pr-8 rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none"
                  aria-label="Clear search"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {/* ---- Results count (when filtering) ---- */}
        {query && (
          <p className="text-xs text-[var(--muted)]" role="status" aria-live="polite">
            {displayCircles.length === 0
              ? "No results"
              : `${displayCircles.length} result${displayCircles.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
        )}

        {/* ---- Panel ---- */}
        <div id="circles-panel" role="tabpanel">
          {displayCircles.length === 0 ? (
            <EmptyState tab={tab} hasQuery={query.length > 0} />
          ) : view === "grid" ? (
            /* Grid view */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayCircles.map((circle) => (
                <CircleGridCard
                  key={circle.id}
                  circle={circle}
                  showJoin={isDiscover || (isBookmarked && !circle.members.includes(CURRENT_WALLET))}
                  onJoin={setJoinCircle}
                />
              ))}
            </div>
          ) : (
            /* List view */
            <div
              className="flex flex-col gap-0.5"
              role="table"
              aria-label={tab === "my" ? "My circles" : tab === "discover" ? "Discover circles" : "Bookmarked circles"}
            >
              <ListHeader />
              {displayCircles.map((circle, i) => (
                <CircleListRow
                  key={circle.id}
                  circle={circle}
                  showJoin={isDiscover || (isBookmarked && !circle.members.includes(CURRENT_WALLET))}
                  onJoin={setJoinCircle}
                  even={i % 2 === 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCircleModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <JoinCircleModal
        open={joinCircle !== null}
        onClose={() => {
          setJoinCircle(null);
          if (inviteId) router.replace("/dashboard/circles");
        }}
        circle={joinCircle}
        currentWallet={CURRENT_WALLET}
      />
    </>
  );
}

export default function CirclesPage() {
  return (
    <Suspense>
      <CirclesContent />
    </Suspense>
  );
}
