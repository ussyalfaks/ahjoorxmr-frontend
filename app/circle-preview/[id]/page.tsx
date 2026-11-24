"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Users, Shield, TrendingUp, Lock } from "lucide-react";
import CircleImage from "@/components/circles/CircleImage";

// Mock circle data - replace with actual API call
const MOCK_CIRCLES: Record<string, {
  id: string;
  name: string;
  description: string;
  totalSlots: number;
  filledSlots: number;
  contribution: string;
  duration: string;
  category: string;
  organizer: string;
  organizerReputation: number;
  isPublic: boolean;
  completedRounds: number;
  totalRounds: number;
  participants: Array<{ slot: number; address: string }>;
}> = {
  "1": {
    id: "1",
    name: "Family savings",
    description: "A trusted circle for family members to save together and support each other's financial goals. Perfect for building emergency funds and achieving shared family milestones.",
    totalSlots: 5,
    filledSlots: 3,
    contribution: "50 USDT",
    duration: "2 Days",
    category: "Family",
    organizer: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    organizerReputation: 95,
    isPublic: true,
    completedRounds: 1,
    totalRounds: 5,
    participants: [
      { slot: 1, address: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b" },
      { slot: 2, address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f" },
      { slot: 3, address: "0x111abc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8" },
    ],
  },
  "3": {
    id: "3",
    name: "Community Fund",
    description: "Supporting local community projects and initiatives through collective savings. Open to all community members who want to make a positive impact.",
    totalSlots: 10,
    filledSlots: 3,
    contribution: "25 USDT",
    duration: "5 Days",
    category: "Community",
    organizer: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b",
    organizerReputation: 88,
    isPublic: true,
    completedRounds: 0,
    totalRounds: 10,
    participants: [
      { slot: 1, address: "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b" },
      { slot: 2, address: "0x333abc1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7" },
      { slot: 3, address: "0x444def2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8" },
    ],
  },
};

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CirclePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const circle = MOCK_CIRCLES[id];
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (!circle) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Circle not found</h1>
          <p className="text-[var(--muted)] mb-6">This circle doesn't exist or is private.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4B6B76] text-white rounded-lg font-medium hover:bg-[#3d5660] transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  if (!circle.isPublic) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ov-0a)] flex items-center justify-center">
            <Lock size={32} className="text-[var(--muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Private Circle</h1>
          <p className="text-[var(--muted)] mb-6">
            This circle is invite-only. You need a direct invitation from the organizer to view details or join.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4B6B76] text-white rounded-lg font-medium hover:bg-[#3d5660] transition-colors"
          >
            Sign in to continue
          </Link>
        </div>
      </main>
    );
  }

  const availableSlots = circle.totalSlots - circle.filledSlots;
  const progressPercentage = (circle.filledSlots / circle.totalSlots) * 100;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <div className="relative">
        <CircleImage
          circleId={circle.id}
          circleName={circle.name}
          kind="cover"
          alt={`${circle.name} cover`}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        {/* Circle Header Card */}
        <div className="bg-[var(--content)] rounded-3xl p-6 md:p-8 shadow-xl border border-[var(--ov-14)] mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold font-sora text-[var(--text)]">
                  {circle.name}
                </h1>
                <span className="px-3 py-1 bg-[var(--ov-0a)] text-[var(--muted)] text-xs font-medium rounded-full">
                  {circle.category}
                </span>
              </div>
              <p className="text-[var(--muted)] leading-relaxed">{circle.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">
                {circle.filledSlots} of {circle.totalSlots} slots filled
              </span>
              <span className="text-sm font-medium text-[var(--text)]">
                {availableSlots} slot{availableSlots !== 1 ? "s" : ""} available
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--ov-0a)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4B6B76] to-[#5d8491] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowLoginPrompt(true)}
            className="w-full py-4 bg-[#4B6B76] hover:bg-[#3d5660] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 group"
          >
            Join This Circle
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Key Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4B6B76]/10 flex items-center justify-center">
                <Users size={20} className="text-[#4B6B76]" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Contribution</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--text)] mb-1">{circle.contribution}</p>
            <p className="text-sm text-[var(--muted)]">Per round per member</p>
          </div>

          <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4B6B76]/10 flex items-center justify-center">
                <Clock size={20} className="text-[#4B6B76]" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Round Duration</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--text)] mb-1">{circle.duration}</p>
            <p className="text-sm text-[var(--muted)]">Time between payouts</p>
          </div>

          <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4B6B76]/10 flex items-center justify-center">
                <Calendar size={20} className="text-[#4B6B76]" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Progress</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--text)] mb-1">
              {circle.completedRounds} / {circle.totalRounds}
            </p>
            <p className="text-sm text-[var(--muted)]">Rounds completed</p>
          </div>

          <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4B6B76]/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#4B6B76]" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Expected Payout</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--text)] mb-1">
              {parseInt(circle.contribution) * circle.totalSlots} USDT
            </p>
            <p className="text-sm text-[var(--muted)]">When it's your turn</p>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)] mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#4B6B76]/10 flex items-center justify-center">
              <Shield size={20} className="text-[#4B6B76]" />
            </div>
            <h3 className="font-semibold text-[var(--text)]">Organizer</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-[var(--text)] mb-1">{formatAddress(circle.organizer)}</p>
              <p className="text-xs text-[var(--muted)]">Managing this circle</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text)]">{circle.organizerReputation}%</p>
              <p className="text-xs text-[var(--muted)]">Reputation</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[var(--content)] rounded-2xl p-6 md:p-8 border border-[var(--ov-0f)]">
          <h2 className="text-xl font-bold text-[var(--text)] mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4B6B76] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text)] mb-1">Join the Circle</h4>
                <p className="text-sm text-[var(--muted)]">
                  Reserve your slot and agree to contribute {circle.contribution} every {circle.duration.toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4B6B76] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text)] mb-1">Make Regular Contributions</h4>
                <p className="text-sm text-[var(--muted)]">
                  Every round, all members contribute to create a pool that one member receives.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4B6B76] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text)] mb-1">Receive Your Payout</h4>
                <p className="text-sm text-[var(--muted)]">
                  When it's your turn, you'll receive the full pool amount to use for your goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-[var(--content)] rounded-2xl p-8 max-w-md w-full border border-[var(--ov-14)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-[var(--text)] mb-3">Sign in to join</h3>
            <p className="text-[var(--muted)] mb-6">
              You need an account to join {circle.name}. Sign in or create a free account to get started.
            </p>
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/dashboard/circles/${circle.id}`}
                className="block w-full py-3 bg-[#4B6B76] hover:bg-[#3d5660] text-white font-semibold rounded-xl transition-colors text-center"
              >
                Sign In
              </Link>
              <Link
                href={`/login?signup=true&redirect=/dashboard/circles/${circle.id}`}
                className="block w-full py-3 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] font-semibold rounded-xl transition-colors text-center"
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 text-[var(--muted)] hover:text-[var(--text)] text-sm transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
