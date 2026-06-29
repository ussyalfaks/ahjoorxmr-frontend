"use client";

import { use } from "react";
import { Users, DollarSign, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ActivityFeed from "@/components/circles/ActivityFeed";
import type { CircleEvent } from "@/types/circle";

const now = Date.now();

const MOCK_EVENTS: CircleEvent[] = [
  {
    id: "1",
    type: "round_started",
    actor: "system",
    timestamp: new Date(now - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    type: "member_joined",
    actor: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    timestamp: new Date(now - 1.5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "contribution_made",
    actor: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
    timestamp: new Date(now - 45 * 60 * 1000),
    meta: { amount: "50 USDT" },
  },
  {
    id: "4",
    type: "contribution_made",
    actor: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    timestamp: new Date(now - 30 * 60 * 1000),
    meta: { amount: "50 USDT" },
  },
  {
    id: "5",
    type: "payout_sent",
    actor: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
    timestamp: new Date(now - 10 * 60 * 1000),
    meta: { amount: "100 USDT" },
  },
];

const MOCK_PARTICIPANTS = [
  { address: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b", slot: 1 },
  { address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f", slot: 2 },
];

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/circles"
          className="text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Circles"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold font-sora text-white">
          Circle #{id}
        </h1>
        <div className="h-px bg-[#ffffff1a] w-full" />
      </div>

      {/* Circle Info */}
      <div className="bg-[#212124] p-6 md:p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white font-sora mb-6">Family savings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Members</p>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-[#A1A1AA]" aria-hidden="true" />
              <span className="text-lg font-semibold text-white">2/5</span>
            </div>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Contribution</p>
            <div className="flex items-center gap-2">
              <DollarSign size={15} className="text-[#A1A1AA]" aria-hidden="true" />
              <span className="text-lg font-semibold text-white">50 USDT</span>
            </div>
          </div>
          <div>
            <p className="text-[#A1A1AA] text-xs mb-2">Duration</p>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#A1A1AA]" aria-hidden="true" />
              <span className="text-lg font-semibold text-white">2 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">Participants</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          {MOCK_PARTICIPANTS.map((p) => (
            <div
              key={p.address}
              className="flex items-center justify-between bg-[#212124] px-5 py-3 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#ffffff0a] flex items-center justify-center text-xs font-bold text-[#A1A1AA]">
                  {p.slot}
                </div>
                <span className="font-mono text-sm text-[#EBEBEB]">
                  {p.address.slice(0, 8)}…{p.address.slice(-6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-bold font-sora text-white shrink-0">Activity</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>
        <ActivityFeed events={MOCK_EVENTS} pageSize={5} />
      </div>
    </div>
  );
}
