"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Users, DollarSign, Clock, Plus } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import CreateCircleModal from "@/components/modals/CreateCircleModal";
import JoinCircleModal, { type JoinCircleData } from "@/components/modals/JoinCircleModal";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

interface Circle {
  id: string;
  name: string;
  creator: string;
  members: string[];
  totalSlots: number;
  contribution: string;
  duration: string;
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
  },
  {
    id: "2",
    name: "School fees",
    creator: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    members: [CURRENT_WALLET, "0x222def3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
    totalSlots: 6,
    contribution: "40 USDT",
    duration: "12 Days",
  },
  {
    id: "3",
    name: "Community Fund",
    creator: "0xjohn1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
    members: ["0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"],
    totalSlots: 10,
    contribution: "25 USDT",
    duration: "5 Days",
  },
  {
    id: "4",
    name: "Holiday Savings",
    creator: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    members: ["0x555ghi3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"],
    totalSlots: 12,
    contribution: "200 USDT",
    duration: "30 Days",
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
  },
];

type Tab = "my" | "discover";

function CirclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: Tab = (searchParams.get("tab") as Tab) ?? "my";
  const inviteId = searchParams.get("invite");

  const [createOpen, setCreateOpen] = useState(false);
  const [joinCircle, setJoinCircle] = useState<JoinCircleData | null>(null);

  useEffect(() => {
    if (!inviteId) return;
    const circle = mockCircles.find((c) => c.id === inviteId);
    if (circle) setJoinCircle(circle);
  }, [inviteId]);

  const [joiningCircle, setJoiningCircle] = useState<Circle | null>(null);

  const myCircles = mockCircles.filter((c) => c.members.includes(CURRENT_WALLET));
  const discoverCircles = mockCircles.filter((c) => !c.members.includes(CURRENT_WALLET));
  const displayCircles = tab === "my" ? myCircles : discoverCircles;

  const setTab = (t: Tab) => {
    router.push(`/dashboard/circles?tab=${t}`);
  };

  const handleJoinClose = useCallback(() => setJoiningCircle(null), []);

  return (
    <>
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Page Title + Create button */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold font-sora text-white shrink-0">Circles</h1>
        <div className="h-px bg-[#ffffff1a] w-full" />
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 shrink-0 px-4 py-2 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          <Plus size={16} aria-hidden="true" />
          Create Circle
        </button>
      </div>

      {/* Tab Toggle */}
      <div
        className="flex border-b border-[#ffffff1a]"
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
              ? "text-white border-b-2 border-white"
              : "text-[#9A9A9A] hover:text-white border-b-2 border-transparent"
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
              ? "text-white border-b-2 border-white"
              : "text-[#9A9A9A] hover:text-white border-b-2 border-transparent"
          }`}
        >
          Discover
        </button>
      </div>

      {/* Panel */}
      <div id="circles-panel" role="tabpanel">
        {displayCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#A1A1AA] text-base">
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
                className="bg-[#212124] rounded-2xl p-6 flex flex-col gap-4 hover:bg-[#26262a] transition-colors"
              >
                <Link href={`/dashboard/circles/${circle.id}`} className="hover:underline">
                  <h2 className="text-lg font-bold font-sora text-white">{circle.name}</h2>
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                  <span>by</span>
                  <span className="font-mono truncate max-w-[140px]">{circle.creator}</span>
                  <CopyButton value={circle.creator} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[#A1A1AA] text-xs mb-1.5">Members</p>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#A1A1AA] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">
                        {circle.members.length}/{circle.totalSlots}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs mb-1.5">Contribution</p>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-[#A1A1AA] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">{circle.contribution}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs mb-1.5">Duration</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#A1A1AA] shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">{circle.duration}</span>
                    </div>
                  </div>
                </div>

                {tab === "discover" && (
                  <button
                    onClick={() => setJoinCircle(circle)}
                    className="mt-auto px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#212124]"
                  >
                    Join Circle
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <CreateCircleModal open={createOpen} onClose={() => setCreateOpen(false)} />
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

    {joiningCircle && (
      <JoinCircleModal circle={joiningCircle} onClose={handleJoinClose} />
    )}
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
