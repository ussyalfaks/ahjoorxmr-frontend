"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Users, DollarSign, Clock, Plus } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import CreateCircleModal, { type CreateCircleData } from "@/components/modals/CreateCircleModal";
import JoinCircleModal, { type JoinCircleData } from "@/components/modals/JoinCircleModal";
import LiveActivityTicker from "@/components/ui/LiveActivityTicker";
import { CIRCLE_CATEGORIES, CATEGORY_LABELS, type CircleCategory } from "@/lib/circles";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

interface Circle {
  id: string;
  name: string;
  creator: string;
  members: string[];
  totalSlots: number;
  contribution: string;
  duration: string;
  category: CircleCategory;
  status: "active" | "completed" | "pending";
}

const mockCircles: Circle[] = [
  {
    id: "1",
    name: "Family savings",
    creator: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    members: [CURRENT_WALLET, "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"],
    totalSlots: 5,
    contribution: "50 USDT",
    duration: "2 Days",
    category: "family",
    status: "active",
  },
  {
    id: "2",
    name: "School fees",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    members: [CURRENT_WALLET, "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
    totalSlots: 6,
    contribution: "40 USDT",
    duration: "12 Days",
    category: "students",
    status: "active",
  },
  {
    id: "3",
    name: "Community Fund",
    creator: "0xjohn1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    members: ["0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"],
    totalSlots: 10,
    contribution: "25 USDT",
    duration: "5 Days",
    category: "community",
    status: "active",
  },
  {
    id: "4",
    name: "Holiday Savings",
    creator: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    members: ["0x555ghi3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"],
    totalSlots: 12,
    contribution: "200 USDT",
    duration: "30 Days",
    category: "friends",
    status: "active",
  },
  {
    id: "5",
    name: "Emergency Pool",
    creator: "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    members: [
      "0x666jkl4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
      "0x777mno5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    ],
    totalSlots: 6,
    contribution: "75 USDT",
    duration: "10 Days",
    category: "family",
    status: "active",
  },
];

type Tab = "my" | "discover";

function CirclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: Tab = (searchParams.get("tab") as Tab) ?? "my";
  const inviteId = searchParams.get("invite");
  const action = searchParams.get("action");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinCircle, setJoinCircle] = useState<JoinCircleData | null>(null);
  const [createdCircles, setCreatedCircles] = useState<Circle[]>([]);
  const allCircles = useMemo(() => [...mockCircles, ...createdCircles], [createdCircles]);

  useEffect(() => {
    if (!inviteId) return;
    const circle = allCircles.find((c) => c.id === inviteId);
    if (circle) setJoinCircle(circle);
  }, [inviteId, allCircles]);

  useEffect(() => {
    if (action === "create") {
      setCreateOpen(true);
      router.replace("/dashboard/circles");
    }
  }, [action, router]);

  const myCircles = allCircles.filter((c) => c.members.includes(CURRENT_WALLET));
  const discoverCircles = allCircles.filter((c) => !c.members.includes(CURRENT_WALLET));

  function handleCreate(data: CreateCircleData) {
    setCreatedCircles((current) => [
      ...current,
      {
        id: `created-${Date.now()}`,
        name: data.name,
        creator: CURRENT_WALLET,
        members: [CURRENT_WALLET],
        totalSlots: Number(data.maxMembers),
        contribution: `${data.contribution} USDT`,
        duration: `${data.roundDuration} Days`,
        category: data.category,
        status: "active",
      },
    ]);
  }
  const displayCircles = tab === "my" ? myCircles : discoverCircles;

  const setTab = (t: Tab) => {
    router.push(`/dashboard/circles?tab=${t}`);
  };

  return (
    <>
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page Title + Create button */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold font-sora text-[var(--text)] shrink-0">Circles</h1>
        <div className="h-px bg-[var(--ov-1a)] w-full" />
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 shrink-0 px-4 py-2 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          <Plus size={16} aria-hidden="true" />
          Create Circle
        </button>
        <Link
          href="/dashboard/circles/archive"
          className="shrink-0 rounded-lg bg-[var(--ov-0a)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--ov-14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          Circle History
        </Link>
      </div>

      {/* Tab Toggle */}
      <div
        className="flex border-b border-[var(--ov-1a)]"
        role="tablist"
        aria-label="Circle views"
      >
        <button
          role="tab"
          aria-selected={tab === "my"}
          aria-controls="circles-panel"
          onClick={() => setTab("my")}
          className={`px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px ${
            tab === "my"
              ? "text-[var(--text)] border-b-2 border-white"
              : "text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent"
          }`}
        >
          My Circles
        </button>
        <button
          role="tab"
          aria-selected={tab === "discover"}
          aria-controls="circles-panel"
          onClick={() => setTab("discover")}
          className={`px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px ${
            tab === "discover"
              ? "text-[var(--text)] border-b-2 border-white"
              : "text-[var(--muted)] hover:text-[var(--text)] border-b-2 border-transparent"
          }`}
        >
          Discover
        </button>
      </div>

      <LiveActivityTicker />

      <section aria-labelledby="category-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="category-heading" className="text-lg font-bold font-sora text-[var(--text)]">Browse by category</h2>
          <span className="text-xs text-[var(--muted)]">Find a circle that fits your goal</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {CIRCLE_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/dashboard/circles/categories/${category}`}
              className="rounded-xl border border-[var(--ov-14)] bg-[var(--content)] px-4 py-4 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[#4B6B76] hover:bg-[var(--content-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              {CATEGORY_LABELS[category]}
              <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                {allCircles.filter((circle) => circle.category === category && circle.status === "active").length} active circles
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Panel */}
      <div id="circles-panel" role="tabpanel">
        {displayCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[var(--muted)] text-base">
              {tab === "my"
                ? "You haven't joined any circles yet."
                : "No open circles available to join right now."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayCircles.map((circle) => (
              <article
                key={circle.id}
                className="bg-[var(--content)] rounded-2xl p-6 flex flex-col gap-4 hover:bg-[var(--content-hover)] transition-colors"
              >
                <Link href={`/dashboard/circles/${circle.id}`} className="hover:underline">
                  <h2 className="text-lg font-bold font-sora text-[var(--text)]">{circle.name}</h2>
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <span>by</span>
                  <span className="font-mono truncate max-w-[140px]">{circle.creator}</span>
                  <CopyButton value={circle.creator} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[var(--muted)] text-xs mb-1.5">Members</p>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {circle.members.length}/{circle.totalSlots}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[var(--muted)] text-xs mb-1.5">Contribution</p>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[var(--text)]">{circle.contribution}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[var(--muted)] text-xs mb-1.5">Duration</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[var(--text)]">{circle.duration}</span>
                    </div>
                  </div>
                </div>

                {tab === "discover" && (
                  <button
                    onClick={() => setJoinCircle(circle)}
                    className="mt-auto px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--content)]"
                  >
                    Join Circle
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
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
    </div>
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
