export interface SettlementMemberInput {
  address: string;
  totalContributed: number;
  payoutReceived: number;
  penalties: number;
}

export interface SettlementMember {
  address: string;
  totalContributed: number;
  payoutReceived: number;
  penalties: number;
  /** Positive means net credit received; negative means a refund owed to the circle. */
  creditOrRefund: number;
}

export interface SettlementTotals {
  totalContributed: number;
  payoutReceived: number;
  penalties: number;
  creditOrRefund: number;
}

export interface SettlementReport {
  currency: string;
  members: SettlementMember[];
  totals: SettlementTotals;
  reconciled: boolean;
}

function roundAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function buildSettlementReport(
  members: SettlementMemberInput[],
  currency: string
): SettlementReport {
  const rows = members.map((member): SettlementMember => {
    for (const [label, amount] of Object.entries({
      totalContributed: member.totalContributed,
      payoutReceived: member.payoutReceived,
      penalties: member.penalties,
    })) {
      if (!Number.isFinite(amount) || amount < 0) {
        throw new RangeError(`${label} must be a finite, non-negative amount.`);
      }
    }

    const totalContributed = roundAmount(member.totalContributed);
    const payoutReceived = roundAmount(member.payoutReceived);
    const penalties = roundAmount(member.penalties);
    return {
      address: member.address,
      totalContributed,
      payoutReceived,
      penalties,
      creditOrRefund: roundAmount(payoutReceived - totalContributed - penalties),
    };
  });

  const totals = rows.reduce<SettlementTotals>(
    (sum, member) => ({
      totalContributed: roundAmount(sum.totalContributed + member.totalContributed),
      payoutReceived: roundAmount(sum.payoutReceived + member.payoutReceived),
      penalties: roundAmount(sum.penalties + member.penalties),
      creditOrRefund: roundAmount(sum.creditOrRefund + member.creditOrRefund),
    }),
    { totalContributed: 0, payoutReceived: 0, penalties: 0, creditOrRefund: 0 }
  );

  return {
    currency,
    members: rows,
    totals,
    reconciled: Math.abs(totals.creditOrRefund) < 0.01,
  };
}
