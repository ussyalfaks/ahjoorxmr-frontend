"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Flame, PiggyBank, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

type View = "savers" | "reliable";

/**
 * Shape mirrors the aggregate a future `/api/leaderboard` would return per
 * participant, so swapping mock data for real on-chain stats is a drop-in.
 */
interface LeaderboardEntry {
  address: string;
  alias?: string;
  totalSaved: number;
  tokenSymbol: string;
  onTimeStreak: number;
  circlesJoined: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", alias: "Emeka", totalSaved: 4820, tokenSymbol: "USDT", onTimeStreak: 18, circlesJoined: 6 },
  { address: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b", alias: "Amina", totalSaved: 4310, tokenSymbol: "USDT", onTimeStreak: 24, circlesJoined: 5 },
  { address: CURRENT_WALLET, alias: "You", totalSaved: 3960, tokenSymbol: "USDT", onTimeStreak: 12, circlesJoined: 4 },
  { address: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1", alias: "Emmanuel", totalSaved: 3540, tokenSymbol: "USDT", onTimeStreak: 21, circlesJoined: 5 },
  { address: "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4", alias: "Kola", totalSaved: 2870, tokenSymbol: "USDT", onTimeStreak: 9, circlesJoined: 3 },
  { address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7", totalSaved: 2450, tokenSymbol: "USDT", onTimeStreak: 15, circlesJoined: 4 },
  { address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8", totalSaved: 1980, tokenSymbol: "USDT", onTimeStreak: 7, circlesJoined: 2 },
  { address: "0x555ghi3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", totalSaved: 1620, tokenSymbol: "USDT", onTimeStreak: 11, circlesJoined: 3 },
];

const VIEWS: { value: View; label: string; icon: typeof Trophy }[] = [
  { value: "savers", label: "Top Savers", icon: PiggyBank },
  { value: "reliable", label: "Most Reliable", icon: Flame },
];

const RANK_ACCENT: Record<number, string> = {
  1: "bg-[#FBBF2420] text-[#FBBF24] border-[#FBBF2440]",
  2: "bg-[#C7C7C720] text-[#C7C7C7] border-[#C7C7C740]",
  3: "bg-[#CD7F3220] text-[#E0A472] border-[#CD7F3240]",
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function RankBadge({ rank }: { rank: number }) {
  const accent = RANK_ACCENT[rank];
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
        accent ?? "bg-[#ffffff0a] text-[#A1A1AA] border-[#ffffff14]"
      }`}
      aria-hidden="true"
    >
      {rank <= 3 ? <Medal size={14} /> : rank}
    </span>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl bg-[#212124] px-5 py-4"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1 max-w-[180px]" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [view, setView] = useState<View>("savers");
  const [loading, setLoading] = useState(true);

  // Stands in for the fetch that will replace MOCK_LEADERBOARD.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const ranked = useMemo(() => {
    const sorted = [...MOCK_LEADERBOARD].sort((a, b) =>
      view === "savers"
        ? b.totalSaved - a.totalSaved
        : b.onTimeStreak - a.onTimeStreak
    );
    return sorted.map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [view]);

  const currentUser = ranked.find((e) => e.address === CURRENT_WALLET);
  const isEmpty = ranked.length === 0;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9A9A9A]">
            Community
          </p>
          <h1 className="mt-2 flex items-center gap-2.5 text-3xl font-bold font-sora text-white">
            <Trophy size={26} className="text-[#FBBF24]" aria-hidden="true" />
            Leaderboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#C7C7C7]">
            Top savers and the most reliable contributors across every circle on
            Ahjoor. Rankings update as contributions settle on-chain.
          </p>
        </div>

        {currentUser && !loading && (
          <div className="rounded-2xl border border-[#4B6B7640] bg-[#4B6B7615] px-4 py-3 text-sm text-[#C7C7C7]">
            Your rank:{" "}
            <span className="font-semibold text-white">#{currentUser.rank}</span>{" "}
            of {ranked.length}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div
        className="flex border-b border-[#ffffff1a]"
        role="tablist"
        aria-label="Leaderboard views"
      >
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            aria-selected={view === value}
            aria-controls="leaderboard-panel"
            onClick={() => setView(value)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-inset -mb-px ${
              view === value
                ? "text-white border-b-2 border-white"
                : "text-[#9A9A9A] hover:text-white border-b-2 border-transparent"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div id="leaderboard-panel" role="tabpanel">
        {loading ? (
          <LeaderboardSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#ffffff12] bg-[#18181A] px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#ffffff14] bg-[#ffffff08] text-[#A1A1AA]">
              <Trophy size={24} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Not enough data yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#A1A1AA]">
              Once circles complete their first rounds, top savers and the most
              reliable contributors will be ranked here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-3xl border border-[#ffffff12] bg-[#18181A] md:block">
              <table className="min-w-full divide-y divide-[#ffffff0f]">
                <caption className="sr-only">
                  {view === "savers"
                    ? "Participants ranked by total amount saved"
                    : "Participants ranked by on-time contribution streak"}
                </caption>
                <thead className="bg-[#ffffff05] text-left text-xs uppercase tracking-[0.18em] text-[#9A9A9A]">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Rank</th>
                    <th scope="col" className="px-6 py-4 font-medium">Participant</th>
                    <th scope="col" className="px-6 py-4 font-medium">Total Saved</th>
                    <th scope="col" className="px-6 py-4 font-medium">On-Time Streak</th>
                    <th scope="col" className="px-6 py-4 font-medium">Circles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff0f]">
                  {ranked.map((entry) => {
                    const isYou = entry.address === CURRENT_WALLET;
                    return (
                      <tr
                        key={entry.address}
                        aria-current={isYou ? "true" : undefined}
                        className={
                          isYou
                            ? "bg-[#4B6B7620] outline outline-1 -outline-offset-1 outline-[#4B6B7655]"
                            : "transition-colors hover:bg-[#ffffff06]"
                        }
                      >
                        <td className="px-6 py-4">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {entry.alias ?? shortAddress(entry.address)}
                            </span>
                            {isYou && (
                              <span className="rounded-full bg-[#4B6B76] px-2 py-0.5 text-[10px] font-semibold text-white">
                                You
                              </span>
                            )}
                          </div>
                          {entry.alias && (
                            <span className="font-mono text-xs text-[#9A9A9A]">
                              {shortAddress(entry.address)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {entry.totalSaved.toLocaleString()} {entry.tokenSymbol}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-[#C7C7C7]">
                            <Flame size={14} className="text-[#FBBF24]" aria-hidden="true" />
                            {entry.onTimeStreak} rounds
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#C7C7C7]">
                          {entry.circlesJoined}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-2 md:hidden list-none p-0">
              {ranked.map((entry) => {
                const isYou = entry.address === CURRENT_WALLET;
                return (
                  <li
                    key={entry.address}
                    aria-current={isYou ? "true" : undefined}
                    className={`rounded-2xl p-4 ${
                      isYou
                        ? "bg-[#4B6B7620] outline outline-1 -outline-offset-1 outline-[#4B6B7655]"
                        : "bg-[#212124]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RankBadge rank={entry.rank} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-white">
                            {entry.alias ?? shortAddress(entry.address)}
                          </span>
                          {isYou && (
                            <span className="shrink-0 rounded-full bg-[#4B6B76] px-2 py-0.5 text-[10px] font-semibold text-white">
                              You
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#9A9A9A]">
                          {shortAddress(entry.address)}
                        </span>
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-[#ffffff0f] pt-3">
                      <div>
                        <dt className="text-[11px] text-[#9A9A9A]">Saved</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white">
                          {entry.totalSaved.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[#9A9A9A]">Streak</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white">
                          {entry.onTimeStreak}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-[#9A9A9A]">Circles</dt>
                        <dd className="mt-0.5 text-sm font-semibold text-white">
                          {entry.circlesJoined}
                        </dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
