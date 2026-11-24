"use client";

import { useState } from "react";
import { Info, PieChart, DollarSign, Percent, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/currencyFormat";

export interface ContributionBreakdown {
  contributionAmount: number;
  currency: string;
  poolAmount: number;
  organizerFee: number;
  feePercentage: number;
  platformFee?: number;
  platformFeePercentage?: number;
  gasFeeEstimate: number;
  netToPool: number;
}

interface ContributionSplitPreviewProps {
  breakdown: ContributionBreakdown;
  circleName: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}


export default function ContributionSplitPreview({
  breakdown,
  circleName,
  onConfirm,
  onCancel,
  showActions = true,
}: ContributionSplitPreviewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    contributionAmount,
    currency,
    poolAmount,
    organizerFee,
    feePercentage,
    platformFee = 0,
    platformFeePercentage = 0,
    gasFeeEstimate,
    netToPool,
  } = breakdown;

  const totalFees = organizerFee + platformFee + gasFeeEstimate;
  const poolPercentage = ((netToPool / contributionAmount) * 100).toFixed(1);

  return (
    <div className="bg-[var(--content)] rounded-2xl p-6 md:p-8 border border-[var(--ov-14)] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-1">Contribution Breakdown</h3>
          <p className="text-sm text-[var(--muted)]">
            Review where your contribution goes in <span className="font-medium">{circleName}</span>
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Toggle details"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Main Visual */}
      <div className="bg-[var(--bg)] rounded-xl p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-[#4B6B76] flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--text)]">{poolPercentage}%</p>
                <p className="text-xs text-[var(--muted)]">to pool</p>
              </div>
            </div>
            {totalFees > 0 && (
              <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full bg-amber-500/20 border-4 border-amber-500 flex items-center justify-center">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {((totalFees / contributionAmount) * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-[var(--muted)] mb-1">Your contribution</p>
          <p className="text-3xl font-bold text-[var(--text)]">{formatCurrency(contributionAmount, currency)}</p>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--content)] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PieChart size={16} className="text-[#4B6B76]" />
              <p className="text-xs text-[var(--muted)]">Goes to Pool</p>
            </div>
            <p className="text-lg font-bold text-[#4B6B76]">{formatCurrency(netToPool, currency)}</p>
          </div>
          <div className="bg-[var(--content)] rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent size={16} className="text-amber-500" />
              <p className="text-xs text-[var(--muted)]">Total Fees</p>
            </div>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalFees, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-3 pt-4 border-t border-[var(--ov-0f)]">
          <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Detailed Breakdown</h4>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-[var(--muted)]" />
              <span className="text-sm text-[var(--text)]">Contribution Amount</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">
              {formatCurrency(contributionAmount, currency)}
            </span>
          </div>

          <div className="ml-6 space-y-2 py-2 border-l-2 border-[var(--ov-0f)] pl-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text)]">Pool Contribution</p>
                <p className="text-xs text-[var(--muted)]">Shared among members</p>
              </div>
              <span className="text-sm font-medium text-[#4B6B76]">
                {formatCurrency(netToPool, currency)}
              </span>
            </div>

            {organizerFee > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text)]">Organizer Fee</p>
                  <p className="text-xs text-[var(--muted)]">{feePercentage}% of contribution</p>
                </div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  -{formatCurrency(organizerFee, currency)}
                </span>
              </div>
            )}

            {platformFee > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text)]">Platform Fee</p>
                  <p className="text-xs text-[var(--muted)]">{platformFeePercentage}% of contribution</p>
                </div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  -{formatCurrency(platformFee, currency)}
                </span>
              </div>
            )}

            {gasFeeEstimate > 0 && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text)]">Est. Gas Fee</p>
                  <p className="text-xs text-[var(--muted)]">Network transaction cost</p>
                </div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  ~{formatCurrency(gasFeeEstimate, currency)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[var(--ov-0f)] font-semibold">
            <span className="text-sm text-[var(--text)]">Total Going to Pool</span>
            <span className="text-base text-[#4B6B76]">{formatCurrency(netToPool, currency)}</span>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-[var(--text)] mb-1 font-medium">What you'll receive</p>
            <p className="text-[var(--muted)]">
              When it's your turn, you'll receive the full pool amount from all {" "}
              members' contributions: <span className="font-semibold text-[var(--text)]">
                {formatCurrency(poolAmount, currency)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4B6B76] hover:bg-[#3d5660] text-white font-semibold rounded-xl transition-colors group"
          >
            Confirm & Join
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Modal Version for use in dialogs
export function ContributionSplitModal({
  breakdown,
  circleName,
  onConfirm,
  onClose,
  isOpen,
}: ContributionSplitPreviewProps & { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[var(--content)] border border-[var(--ov-14)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--ov-1a)] transition-colors shadow-lg z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <ContributionSplitPreview
            breakdown={breakdown}
            circleName={circleName}
            onConfirm={onConfirm}
            onCancel={onClose}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
}
