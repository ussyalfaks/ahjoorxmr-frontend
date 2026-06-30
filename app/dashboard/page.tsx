"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Users, CheckCircle2, DollarSign } from "lucide-react";
import SavingsCard from "@/components/cards/SavingsCard";
import TxConfirmModal, { TxType } from "@/components/modals/TxConfirmModal";
import type { Circle } from "@/types/circle";

interface PendingTx {
  type: TxType;
  circle: Circle;
  amount: number;
}

/**
 * contributionButtonLabel looks like "Make Contribution (50 USDT)".
 * Pulls the numeric amount out so the modal can display/use a clean number.
 * Falls back to parsing `circle.contribution` (e.g. "40 USDT") if that fails.
 */
function getContributionAmount(circle: Circle): number {
  const fromLabel = circle.contributionButtonLabel.match(/([\d.]+)\s*USDT/i);
  if (fromLabel) return parseFloat(fromLabel[1]);

  const fromContribution = circle.contribution.match(/([\d.]+)/);
  return fromContribution ? parseFloat(fromContribution[1]) : 0;
}

export default function DashboardOverviewPage() {
  const [pendingTx, setPendingTx] = useState<PendingTx | null>(null);

  const deadlines = useMemo(
    () => ({
      card1: new Date(Date.now() + 25 * 60 * 1000),
      card2: new Date(Date.now() + 18 * 60 * 60 * 1000),
      card3: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      card4: null,
    }),
    []
  );

  const circles: Circle[] = useMemo(
    () => [
      {
        id: "1",
        name: "Family savings",
        creator: "Emeka",
        members: 2,
        contribution: "3 USDT",
        duration: "2 Days",
        currentRound: 1,
        totalRounds: 3,
        status: "active",
        isYourTurn: true,
        deadline: deadlines.card1,
        contributionButtonLabel: "Make Contribution (50 USDT)",
        claimButtonVariant: "secondary",
      },
      {
        id: "2",
        name: "School fees",
        creator: "Emmanuel",
        members: 6,
        contribution: "40 USDT",
        duration: "12 Days",
        currentRound: 3,
        totalRounds: 4,
        status: "active",
        isYourTurn: false,
        deadline: deadlines.card2,
        contributionButtonLabel: "Make Contribution (2 USDT)",
        claimButtonVariant: "disabled",
      },
      {
        id: "3",
        name: "Family savings",
        creator: "Emeka",
        members: 2,
        contribution: "30 USDT",
        duration: "2 Days",
        currentRound: 1,
        totalRounds: 3,
        status: "active",
        isYourTurn: true,
        deadline: deadlines.card3,
        contributionButtonLabel: "Make Contribution (5 USDT)",
        claimButtonVariant: "primary",
      },
      {
        id: "4",
        name: "School fees",
        creator: "Emmanuel",
        members: 4,
        contribution: "40 USDT",
        duration: "12 Days",
        currentRound: 2,
        totalRounds: 5,
        status: "active",
        isYourTurn: false,
        deadline: deadlines.card4,
        contributionButtonLabel: "Make Contribution (10 USDT)",
        claimButtonVariant: "disabled",
      },
    ],
    [deadlines]
  );

  const handleContributeClick = (circle: Circle) => {
    setPendingTx({
      type: "contribute",
      circle,
      amount: getContributionAmount(circle),
    });
  };

  const handleClaimClick = (circle: Circle) => {
    // TODO: replace with the real claimable amount once available on Circle
    setPendingTx({
      type: "claim",
      circle,
      amount: getContributionAmount(circle),
    });
  };

  // Replace these stubs with real contract/service calls (e.g. starknet.js)
  const submitContribution = async (circle: Circle, amount: number): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // const tx = await contract.contribute(circle.id, amount);
    // return tx.transaction_hash;
    return "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";
  };

  const submitClaim = async (circle: Circle): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // const tx = await contract.claim(circle.id);
    // return tx.transaction_hash;
    return "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567";
  };

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C1C1E] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[#222224] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center mb-6">
            <DollarSign size={20} className="text-white" aria-hidden="true" />
          </div>
          <p className="text-[#A1A1AA] text-sm font-medium mb-2">Total Saved</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-semibold font-sora tracking-tight text-white">$1000</h3>
            <div className="flex items-center gap-1 text-[#4ADE80] text-xs font-semibold" aria-label="200% increase">
              <span>+200%</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C1C1E] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[#222224] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center mb-6">
            <Users size={20} className="text-white" aria-hidden="true" />
          </div>
          <p className="text-[#A1A1AA] text-sm font-medium mb-2">Active Pools</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-semibold font-sora tracking-tight text-white">8</h3>
            <div className="flex items-center gap-1 text-[#4ADE80] text-xs font-semibold" aria-label="200% increase">
              <span>+200%</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C1C1E] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[#222224] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center mb-6">
            <div className="relative" aria-hidden="true">
              <DollarSign size={16} className="text-white absolute -top-1 -right-1" />
              <div className="w-5 h-4 border-2 border-white rounded-sm mt-1" />
            </div>
          </div>
          <p className="text-[#A1A1AA] text-sm font-medium mb-2">Next Payout</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-semibold font-sora tracking-tight text-white">$50</h3>
            <div className="flex items-center gap-1 text-[#4ADE80] text-xs font-semibold" aria-label="200% increase">
              <span>+200%</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C1C1E] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[#222224] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center mb-6">
            <CheckCircle2 size={20} className="text-white" aria-hidden="true" />
          </div>
          <p className="text-[#A1A1AA] text-sm font-medium mb-2">Completed Circles</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-semibold font-sora tracking-tight text-white">12</h3>
            <div className="flex items-center gap-1 text-[#4ADE80] text-xs font-semibold" aria-label="200% increase">
              <span>+200%</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Savings Section */}
      <div>
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold font-sora text-white shrink-0">Active savings</h2>
          <div className="ml-4 h-px bg-[#ffffff1a] w-full" aria-hidden="true" />
        </div>

        <div className="space-y-4">
          {circles.map((circle) => (
            <SavingsCard
              key={circle.id}
              circle={circle}
              onContribute={handleContributeClick}
              onClaim={handleClaimClick}
            />
          ))}
        </div>
      </div>

      {pendingTx && (
        <TxConfirmModal
          isOpen={!!pendingTx}
          onClose={() => setPendingTx(null)}
          type={pendingTx.type}
          circleName={pendingTx.circle.name}
          amount={pendingTx.amount}
          onConfirm={() =>
            pendingTx.type === "contribute"
              ? submitContribution(pendingTx.circle, pendingTx.amount)
              : submitClaim(pendingTx.circle)
          }
        />
      )}
    </div>
  );
}