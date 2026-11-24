export type ContributionStatus = "on-time" | "late" | "missed";
export type ContributionType = "on-chain" | "off-chain";
export type ProofStatus = "pending" | "verified" | "rejected";

export interface ContributionProof {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: ProofStatus;
  rejectionReason?: string;
}

export interface ContributionRecord {
  id: string;
  circleId: string;
  circleName: string;
  date: string;
  dueDate: string;
  round: number;
  amount: number;
  status: ContributionStatus;
  transactionHash?: string;
  type?: ContributionType;
  proof?: ContributionProof;
}
