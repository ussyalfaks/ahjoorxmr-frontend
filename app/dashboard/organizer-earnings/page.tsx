"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, DollarSign, Users, Calendar, Eye, ExternalLink } from "lucide-react";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportRow } from "@/lib/export";

interface CircleEarnings {
  circleId: string;
  circleName: string;
  members: number;
  completedRounds: number;
  totalRounds: number;
  contributionAmount: number;
  feePercentage: number;
  totalFees: number;
  lastPayoutDate: string;
  status: "active" | "completed";
}

interface EarningTransaction {
  id: string;
  circleId: string;
  circleName: string;
  round: number;
  date: string;
  poolAmount: number;
  feeAmount: number;
  transactionHash: string;
}

// Mock data - replace with actual API calls
const MOCK_CIRCLES: CircleEarnings[] = [
  {
    circleId: "1",
    circleName: "Family savings",
    members: 5,
    completedRounds: 3,
    totalRounds: 5,
    contributionAmount: 50,
    feePercentage: 2,
    totalFees: 15,
    lastPayoutDate: "2025-10-15",
    status: "active",
  },
  {
    circleId: "3",
    circleName: "Community Fund",
    members: 10,
    completedRounds: 5,
    totalRounds: 10,
    contributionAmount: 25,
    feePercentage: 2,
    totalFees: 25,
    lastPayoutDate: "2025-10-14",
    status: "active",
  },
  {
    circleId: "7",
    circleName: "Business Networking Circle",
    members: 8,
    completedRounds: 8,
    totalRounds: 8,
    contributionAmount: 100,
    feePercentage: 2.5,
    totalFees: 160,
    lastPayoutDate: "2025-09-30",
    status: "completed",
  },
];

const MOCK_TRANSACTIONS: EarningTransaction[] = [
  {
    id: "1",
    circleId: "1",
    circleName: "Family savings",
    round: 3,
    date: "2025-10-15",
    poolAmount: 250,
    feeAmount: 5,
    transactionHash: "0xabc123def456789",
  },
  {
    id: "2",
    circleId: "3",
    circleName: "Community Fund",
    round: 5,
    date: "2025-10-14",
    poolAmount: 250,
    feeAmount: 5,
    transactionHash: "0xdef456abc789123",
  },
  {
    id: "3",
    circleId: "1",
    circleName: "Family savings",
    round: 2,
    date: "2025-10-10",
    poolAmount: 250,
    feeAmount: 5,
    transactionHash: "0x789abc123def456",
  },
  {
    id: "4",
    circleId: "3",
    circleName: "Community Fund",
    round: 4,
    date: "2025-10-09",
    poolAmount: 250,
    feeAmount: 5,
    transactionHash: "0x123def456abc789",
  },
];

type TimeFilter = "all" | "30d" | "90d" | "year";

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} USDT`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAddress(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function OrganizerEarningsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedCircle, setSelectedCircle] = useState<string>("all");

  // Filter transactions based on time and circle
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    if (selectedCircle !== "all" && tx.circleId !== selectedCircle) return false;

    if (timeFilter !== "all") {
      const txDate = new Date(tx.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));

      if (timeFilter === "30d" && daysDiff > 30) return false;
      if (timeFilter === "90d" && daysDiff > 90) return false;
      if (timeFilter === "year" && daysDiff > 365) return false;
    }

    return true;
  });

  // Calculate totals
  const totalEarnings = MOCK_CIRCLES.reduce((sum, circle) => sum + circle.totalFees, 0);
  const activeCircles = MOCK_CIRCLES.filter((c) => c.status === "active").length;
  const totalMembers = MOCK_CIRCLES.reduce((sum, circle) => sum + circle.members, 0);
  const filteredEarnings = filteredTransactions.reduce((sum, tx) => sum + tx.feeAmount, 0);

  // Export data preparation
  const getExportRows = (): ExportRow[] => {
    return filteredTransactions.map((tx) => ({
      date: tx.date,
      circleName: tx.circleName,
      round: tx.round,
      amount: formatCurrency(tx.feeAmount),
      type: "Organizer Fee",
      transactionHash: tx.transactionHash,
    }));
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold font-sora text-[var(--text)]">Organizer Earnings</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Track fees earned from circles you organize</p>
        </div>
        <ExportButton
          getRows={getExportRows}
          scope="organizer-earnings"
          prefix="earnings"
          title="Organizer earnings"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm text-[var(--muted)]">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{formatCurrency(totalEarnings)}</p>
        </div>

        <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <p className="text-sm text-[var(--muted)]">Active Circles</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{activeCircles}</p>
        </div>

        <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Users size={20} className="text-purple-500" />
            </div>
            <p className="text-sm text-[var(--muted)]">Total Members</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{totalMembers}</p>
        </div>

        <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Calendar size={20} className="text-amber-500" />
            </div>
            <p className="text-sm text-[var(--muted)]">Filtered Period</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text)]">{formatCurrency(filteredEarnings)}</p>
        </div>
      </div>

      {/* Circles Overview */}
      <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
        <h2 className="text-xl font-bold text-[var(--text)] mb-6">Your Circles</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--ov-0f)]">
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Circle</th>
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Members</th>
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Progress</th>
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Fee Rate</th>
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Total Fees</th>
                <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Status</th>
                <th className="text-right text-xs uppercase text-[var(--muted)] font-medium pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CIRCLES.map((circle) => (
                <tr key={circle.circleId} className="border-b border-[var(--ov-05)] last:border-0">
                  <td className="py-4 pr-4">
                    <p className="font-medium text-[var(--text)]">{circle.circleName}</p>
                    <p className="text-xs text-[var(--muted)]">Last payout: {formatDate(circle.lastPayoutDate)}</p>
                  </td>
                  <td className="py-4 pr-4 text-[var(--text)]">{circle.members}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--text)]">
                        {circle.completedRounds}/{circle.totalRounds}
                      </span>
                      <div className="w-16 h-1.5 bg-[var(--ov-0a)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4B6B76]"
                          style={{ width: `${(circle.completedRounds / circle.totalRounds) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-[var(--text)]">{circle.feePercentage}%</td>
                  <td className="py-4 pr-4">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(circle.totalFees)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        circle.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-[var(--ov-0a)] text-[var(--muted)]"
                      }`}
                    >
                      {circle.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/dashboard/circles/${circle.circleId}`}
                      className="inline-flex items-center gap-1 text-sm text-[#4B6B76] hover:underline"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <label className="text-sm text-[var(--muted)] block mb-2">Time Period</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="bg-[var(--bg)] text-[var(--text)] border border-[var(--ov-14)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-[var(--muted)] block mb-2">Circle</label>
            <select
              value={selectedCircle}
              onChange={(e) => setSelectedCircle(e.target.value)}
              className="bg-[var(--bg)] text-[var(--text)] border border-[var(--ov-14)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
            >
              <option value="all">All Circles</option>
              {MOCK_CIRCLES.map((circle) => (
                <option key={circle.circleId} value={circle.circleId}>
                  {circle.circleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction History */}
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Fee History</h3>
        {filteredTransactions.length === 0 ? (
          <p className="text-[var(--muted)] text-sm py-8 text-center">No transactions found for this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--ov-0f)]">
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Date</th>
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Circle</th>
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Round</th>
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Pool Amount</th>
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3 pr-4">Fee Earned</th>
                  <th className="text-left text-xs uppercase text-[var(--muted)] font-medium pb-3">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[var(--ov-05)] last:border-0">
                    <td className="py-4 pr-4 text-sm text-[var(--text)]">{formatDate(tx.date)}</td>
                    <td className="py-4 pr-4 text-sm text-[var(--text)]">{tx.circleName}</td>
                    <td className="py-4 pr-4 text-sm text-[var(--muted)]">Round {tx.round}</td>
                    <td className="py-4 pr-4 text-sm text-[var(--text)]">{formatCurrency(tx.poolAmount)}</td>
                    <td className="py-4 pr-4">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(tx.feeAmount)}
                      </span>
                    </td>
                    <td className="py-4">
                      <a
                        href={`https://etherscan.io/tx/${tx.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#4B6B76] hover:underline font-mono"
                      >
                        {formatAddress(tx.transactionHash)}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
