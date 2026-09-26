"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, LayoutGrid, List, Search, Star } from "lucide-react";
import CreateCircleModal, { type CreateCircleData } from "@/components/modals/CreateCircleModal";
import JoinCircleModal, { type JoinCircleData } from "@/components/modals/JoinCircleModal";
import CircleGridCard from "@/components/circles/CircleGridCard";
import CircleSearchAutocomplete from "@/components/circles/CircleSearchAutocomplete";
import CircleListRow from "@/components/circles/CircleListRow";
import ComparisonFloatingBar from "@/components/circles/ComparisonFloatingBar";
import CircleComparison from "@/components/circles/CircleComparison";
import { CircleComparisonProvider } from "@/contexts/CircleComparisonContext";
 import { useCircleViewPreference } from "@/hooks/useCircleViewPreference";
 import { useBookmarks } from "@/hooks/useBookmarks";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useToast } from "@/components/ui/Toast";
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
        grid-cols-[28px_minmax(160px,2fr)_110px_100px_80px_100px_auto]"
      role="rowgroup"
      aria-label="Circle list column headers"
    >
      <span className="sr-only">Compare</span>
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
  const [duplicateValues, setDuplicateValues] = useState<Partial<CreateCircleData> | undefined>();
  const [circles, setCircles] = useState(MOCK_CIRCLES);
  const [joinCircle, setJoinCircle] = useState<JoinCircleData | null>(null);
  const [query, setQuery] = useState("");

   const { view, setView } = useCircleViewPreference();
   const { bookmarkedIds } = useBookmarks();
  const { isVerified } = useEmailVerification();
  const { showToast } = useToast();

  function requireVerified(): boolean {
    if (isVerified) return true;
    showToast({
      title: "Verify your email to continue",
      message: "Creating and joining circles requires a verified email address.",
      variant: "warning",
    });
    return false;
  }

  function requestJoinCircle(circle: JoinCircleData) {
    if (!requireVerified()) return;
    setJoinCircle(circle);
  }

   // Handle invite / create deep-link params
   useEffect(() => {
     if (!inviteId) return;
     const circle = circles.find((c) => c.id === inviteId);
    if (circle) setJoinCircle(circle);
    if (circle) requestJoinCircle(circle);
   }, [circles, inviteId]);

   useEffect(() => {
     if (action === "create") {
      setCreateOpen(true);
      if (requireVerified()) setCreateOpen(true);
       router.replace("/dashboard/circles");
     }
   }, [action, router]);

   function openCreateCircle() {
    if (!requireVerified()) return;
     setDuplicateValues(undefined);
     setCreateOpen(true);
   }

   function duplicateCircle(circle: (typeof MOCK_CIRCLES)[number]) {
    if (!requireVerified()) return;
     const contribution = circle.contribution.replace(/[^\d.]/g, "");
    const roundDuration = circle.duration.replace(/[^\d.]/g, "");
    setDuplicateValues({
      name: `${circle.name} (Copy)`,
      description: circle.description ?? "",
      contribution,
      maxMembers: String(circle.totalSlots),
      roundDuration,
      category: circle.category ?? "family",
      isPrivate: circle.isPrivate ?? false,
      penaltyEnabled: circle.penaltyEnabled ?? false,
      penaltyType: circle.penaltyType ?? "percentage",
      penaltyValue: circle.penaltyValue ?? "",
    });
    setCreateOpen(true);
  }

  function handleCreateCircle(data: CreateCircleData) {
    const newCircle = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `circle-${Date.now()}`,
      name: data.name,
      creator: CURRENT_WALLET,
      members: [CURRENT_WALLET],
      totalSlots: Number(data.maxMembers),
      contribution: `${data.contribution} USDT`,
      duration: `${data.roundDuration} Days`,
      description: data.description,
      category: data.category,
      isPrivate: data.isPrivate,
      penaltyEnabled: data.penaltyEnabled,
      penaltyType: data.penaltyType,
      penaltyValue: data.penaltyValue,
    };
    setCircles((current) => [newCircle, ...current]);
    setDuplicateValues(undefined);
  }

  const setTab = (t: Tab) => {
    setQuery(""); // clear search when switching tabs
    router.push(`/dashboard/circles?tab=${t}`);
  };

  // Derive filtered list — memo keeps it cheap on re-render
  const baseCircles = useMemo<DiscoverCircle[]>(() => {
    if (tab === "my") return circles.filter((c) => c.members.includes(CURRENT_WALLET));
    if (tab === "bookmarked") return circles.filter((c) => bookmarkedIds.includes(c.id));
    return circles.filter((c) => !c.members.includes(CURRENT_WALLET));
  }, [circles, tab, bookmarkedIds]);

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
            onClick={openCreateCircle}
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
                aria-label={`${circles.filter((c) => c.members.includes(CURRENT_WALLET)).length} circles`}
              >
                {circles.filter((c) => c.members.includes(CURRENT_WALLET)).length}
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
                aria-label={`${circles.filter((c) => !c.members.includes(CURRENT_WALLET)).length} circles`}
              >
                {circles.filter((c) => !c.members.includes(CURRENT_WALLET)).length}
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
                aria-label={`${circles.filter((c) => bookmarkedIds.includes(c.id)).length} circles`}
              >
                {circles.filter((c) => bookmarkedIds.includes(c.id)).length}
              </span>
            </button>
          </div>

          {/* Search + view toggle */}
          <div className="flex items-center gap-2">
            {/* Search input */}
            <CircleSearchAutocomplete
              key={tab}
              circles={baseCircles}
              onQueryChange={setQuery}
              className="flex-1 sm:flex-none sm:w-52"
            />

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
                 onJoin={requestJoinCircle}
                  onDuplicate={tab === "my" && circle.creator.toLowerCase() === CURRENT_WALLET.toLowerCase() ? duplicateCircle : undefined}
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
                  onDuplicate={tab === "my" && circle.creator.toLowerCase() === CURRENT_WALLET.toLowerCase() ? duplicateCircle : undefined}
                  even={i % 2 === 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCircleModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setDuplicateValues(undefined);
        }}
        initialValues={duplicateValues}
        onCreate={handleCreateCircle}
      />
      <JoinCircleModal
        open={joinCircle !== null}
        onClose={() => {
          setJoinCircle(null);
          if (inviteId) router.replace("/dashboard/circles");
        }}
        circle={joinCircle}
        currentWallet={CURRENT_WALLET}
      />
      <ComparisonFloatingBar allCircles={MOCK_CIRCLES} />
      <CircleComparison
        allCircles={MOCK_CIRCLES}
        onJoinCircle={(circle) => requestJoinCircle(circle)}
      />
    </>
  );
}

export default function CirclesPage() {
  return (
    <Suspense>
      <CircleComparisonProvider>
        <CirclesContent />
      </CircleComparisonProvider>
    </Suspense>
  );
}
