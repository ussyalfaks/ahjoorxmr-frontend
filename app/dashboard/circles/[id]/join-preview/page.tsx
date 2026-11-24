"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ContributionSplitPreview, { type ContributionBreakdown } from "@/components/circles/ContributionSplitPreview";
import CircleImage from "@/components/circles/CircleImage";
import { useToast } from "@/components/ui/Toast";

// Mock circle data - replace with actual API call
const MOCK_CIRCLES: Record<string, {
  id: string;
  name: string;
  description: string;
  totalSlots: number;
  filledSlots: number;
  contribution: string;
  duration: string;
  organizerFeePercentage: number;
}> = {
  "1": {
    id: "1",
    name: "Family savings",
    description: "A trusted circle for family members to save together",
    totalSlots: 5,
    filledSlots: 3,
    contribution: "50 USDT",
    duration: "2 Days",
    organizerFeePercentage: 2,
  },
  "3": {
    id: "3",
    name: "Community Fund",
    description: "Supporting local community projects",
    totalSlots: 10,
    filledSlots: 3,
    contribution: "25 USDT",
    duration: "5 Days",
    organizerFeePercentage: 2,
  },
};

function calculateBreakdown(contributionStr: string, totalSlots: number, feePercentage: number): ContributionBreakdown {
  // Parse contribution amount and currency
  const match = contributionStr.match(/^([\d.]+)\s*(\w+)$/);
  if (!match) {
    throw new Error("Invalid contribution format");
  }

  const contributionAmount = parseFloat(match[1]);
  const currency = match[2];

  // Calculate fees
  const organizerFee = (contributionAmount * feePercentage) / 100;
  const platformFee = (contributionAmount * 0.5) / 100; // 0.5% platform fee
  const gasFeeEstimate = 0.25; // Estimated gas fee in USDT

  // Calculate net amount going to pool
  const netToPool = contributionAmount - organizerFee - platformFee - gasFeeEstimate;

  // Calculate total pool amount (all members' contributions)
  const poolAmount = netToPool * totalSlots;

  return {
    contributionAmount,
    currency,
    poolAmount,
    organizerFee,
    feePercentage,
    platformFee,
    platformFeePercentage: 0.5,
    gasFeeEstimate,
    netToPool,
  };
}

export default function JoinPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const circle = MOCK_CIRCLES[id];
  const router = useRouter();
  const { showToast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <p className="text-[var(--muted)]">Circle not found.</p>
        <Link href="/dashboard/circles" className="text-[#4B6B76] hover:underline text-sm">
          Back to Circles
        </Link>
      </div>
    );
  }

  const breakdown = calculateBreakdown(circle.contribution, circle.totalSlots, circle.organizerFeePercentage);

  const handleJoin = async () => {
    setIsJoining(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    showToast({
      title: "Successfully joined!",
      message: `You are now a member of ${circle.name}`,
      variant: "success",
    });

    // Redirect to circle details
    router.push(`/dashboard/circles/${circle.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/circles/${circle.id}`}
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Back to Circle"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-sora text-[var(--text)]">Join Circle</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Review contribution details before joining</p>
        </div>
      </div>

      {/* Circle Preview Card */}
      <div className="bg-[var(--content)] rounded-2xl p-6 border border-[var(--ov-0f)]">
        <div className="flex items-start gap-4">
          <CircleImage
            circleId={circle.id}
            circleName={circle.name}
            kind="icon"
            alt={circle.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">{circle.name}</h2>
            <p className="text-sm text-[var(--muted)] mb-3">{circle.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-[var(--muted)]">Members: </span>
                <span className="font-medium text-[var(--text)]">
                  {circle.filledSlots}/{circle.totalSlots}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Duration: </span>
                <span className="font-medium text-[var(--text)]">{circle.duration}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Contribution: </span>
                <span className="font-medium text-[var(--text)]">{circle.contribution}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Breakdown */}
      <ContributionSplitPreview
        breakdown={breakdown}
        circleName={circle.name}
        onConfirm={handleJoin}
        onCancel={handleCancel}
        showActions={true}
      />

      {/* Additional Info */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <p className="text-sm text-[var(--text)] font-medium mb-2">Before you join:</p>
        <ul className="text-sm text-[var(--muted)] space-y-1 ml-4 list-disc">
          <li>Ensure you can commit to contributing {circle.contribution} every {circle.duration.toLowerCase()}</li>
          <li>Late or missed contributions may result in penalties</li>
          <li>Your payout position will be assigned when the round starts</li>
          <li>You can leave the circle before receiving your payout (conditions apply)</li>
        </ul>
      </div>

      {isJoining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--content)] rounded-2xl p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#4B6B76] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text)] font-medium">Joining circle...</p>
          </div>
        </div>
      )}
    </div>
  );
}
