export type ContributionStatus = "on-time" | "late" | "missed";

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
}
