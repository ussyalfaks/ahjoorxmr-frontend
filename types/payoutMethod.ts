export type PayoutMethodId = "wallet" | "offramp";

export interface PayoutMethodPreference {
  circleId: string;
  method: PayoutMethodId;
  updatedAt: string; // ISO-8601
}

export interface PayoutMethodOption {
  id: PayoutMethodId;
  label: string;
  description: string;
  /** False when the method can't be used for this circle/currency. */
  available: boolean;
  /** Shown to the user when `available` is false. */
  unavailableReason?: string;
}
