import { formatCurrency as formatCurrencyUtil } from "@/lib/currencyFormat";

/**
 * Utility functions for calculating contribution breakdowns and fees
 */

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

export interface FeeConfig {
  organizerFeePercentage: number;
  platformFeePercentage?: number;
  gasFeeEstimate?: number;
}

const DEFAULT_PLATFORM_FEE = 0.5; // 0.5%
const DEFAULT_GAS_FEE = 0.25; // $0.25 USDT

/**
 * Parse contribution string (e.g., "50 USDT") into amount and currency
 */
export function parseContribution(contributionStr: string): { amount: number; currency: string } {
  const match = contributionStr.trim().match(/^([\d.]+)\s*(\w+)$/);
  if (!match) {
    throw new Error(`Invalid contribution format: ${contributionStr}`);
  }

  const amount = parseFloat(match[1]);
  const currency = match[2];

  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid contribution amount: ${amount}`);
  }

  return { amount, currency };
}

/**
 * Calculate complete breakdown of a contribution including all fees
 */
export function calculateContributionBreakdown(
  contributionStr: string,
  totalSlots: number,
  feeConfig: FeeConfig
): ContributionBreakdown {
  const { amount: contributionAmount, currency } = parseContribution(contributionStr);

  const {
    organizerFeePercentage,
    platformFeePercentage = DEFAULT_PLATFORM_FEE,
    gasFeeEstimate = DEFAULT_GAS_FEE,
  } = feeConfig;

  // Calculate fees
  const organizerFee = (contributionAmount * organizerFeePercentage) / 100;
  const platformFee = (contributionAmount * platformFeePercentage) / 100;

  // Calculate net amount going to pool
  const netToPool = contributionAmount - organizerFee - platformFee - gasFeeEstimate;

  // Calculate total pool amount (all members' contributions)
  const poolAmount = netToPool * totalSlots;

  return {
    contributionAmount,
    currency,
    poolAmount,
    organizerFee,
    feePercentage: organizerFeePercentage,
    platformFee,
    platformFeePercentage,
    gasFeeEstimate,
    netToPool,
  };
}

/**
 * Calculate organizer's total earnings from a circle
 */
export function calculateOrganizerEarnings(
  contributionAmount: number,
  memberCount: number,
  completedRounds: number,
  feePercentage: number
): number {
  const feePerContribution = (contributionAmount * feePercentage) / 100;
  const totalContributions = memberCount * completedRounds;
  return feePerContribution * totalContributions;
}

/**
 * Calculate expected payout amount for a member (what they receive when it's their turn)
 */
export function calculateExpectedPayout(
  contributionStr: string,
  totalSlots: number,
  feeConfig: FeeConfig
): { amount: number; currency: string } {
  const breakdown = calculateContributionBreakdown(contributionStr, totalSlots, feeConfig);
  return {
    amount: breakdown.poolAmount,
    currency: breakdown.currency,
  };
}

/**
 * Calculate total amount a member will contribute over all rounds
 */
export function calculateTotalMemberContribution(
  contributionStr: string,
  totalRounds: number
): { amount: number; currency: string } {
  const { amount, currency } = parseContribution(contributionStr);
  return {
    amount: amount * totalRounds,
    currency,
  };
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currency: string, decimals: number = 2): string {
  return formatCurrencyUtil(amount, currency, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Calculate percentage of contribution that goes to pool
 */
export function calculatePoolPercentage(breakdown: ContributionBreakdown): number {
  return (breakdown.netToPool / breakdown.contributionAmount) * 100;
}

/**
 * Calculate total fees as a percentage
 */
export function calculateTotalFeePercentage(breakdown: ContributionBreakdown): number {
  const totalFees = breakdown.organizerFee + (breakdown.platformFee || 0) + breakdown.gasFeeEstimate;
  return (totalFees / breakdown.contributionAmount) * 100;
}

/**
 * Estimate gas fee based on network conditions (mock implementation)
 * In production, this would query current gas prices
 */
export function estimateGasFee(network: string = "ethereum"): number {
  const estimates: Record<string, number> = {
    ethereum: 0.50,
    polygon: 0.05,
    bsc: 0.10,
    arbitrum: 0.15,
  };
  return estimates[network.toLowerCase()] || DEFAULT_GAS_FEE;
}
