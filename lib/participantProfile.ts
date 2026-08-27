export interface ParticipantProfile {
  address: string;
  displayName: string;
  onTimeContributions: number;
  totalContributions: number;
  circlesCompleted: number;
  disputes: number;
  memberSince: string;
}

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

const MOCK_PROFILES: Record<string, ParticipantProfile> = {
  "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f": {
    address: "0xemeka4b2c8f1d9e0a7b3c5d6e8f2a1b4c7d9e0f",
    displayName: "Emeka",
    onTimeContributions: 17,
    totalContributions: 18,
    circlesCompleted: 4,
    disputes: 1,
    memberSince: "January 2024",
  },
  "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b": {
    address: "0xamina5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    displayName: "Amina",
    onTimeContributions: 23,
    totalContributions: 24,
    circlesCompleted: 3,
    disputes: 0,
    memberSince: "March 2024",
  },
  [CURRENT_WALLET]: {
    address: CURRENT_WALLET,
    displayName: "You",
    onTimeContributions: 11,
    totalContributions: 12,
    circlesCompleted: 2,
    disputes: 0,
    memberSince: "June 2024",
  },
  "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1": {
    address: "0xemmanuel9c3d5e7f1a2b4c6d8e0f2a3b5c7d9e1",
    displayName: "Emmanuel",
    onTimeContributions: 19,
    totalContributions: 21,
    circlesCompleted: 3,
    disputes: 1,
    memberSince: "February 2024",
  },
  "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4": {
    address: "0xkola7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    displayName: "Kola",
    onTimeContributions: 8,
    totalContributions: 9,
    circlesCompleted: 1,
    disputes: 1,
    memberSince: "July 2024",
  },
};

export function getParticipantProfile(address: string): ParticipantProfile {
  return MOCK_PROFILES[address] ?? {
    address,
    displayName: "Participant",
    onTimeContributions: 0,
    totalContributions: 0,
    circlesCompleted: 0,
    disputes: 0,
    memberSince: "Recently",
  };
}

export function getTrustScore(profile: ParticipantProfile) {
  const onTimeRate = profile.totalContributions > 0
    ? profile.onTimeContributions / profile.totalContributions
    : 0;
  const score = Math.max(0, Math.min(100, Math.round(onTimeRate * 85 + Math.min(profile.circlesCompleted, 3) * 5 - Math.min(profile.disputes, 2) * 5)));
  return {
    score,
    onTimeRate,
    label: profile.totalContributions === 0
      ? "New participant"
      : score >= 85 ? "Highly trusted" : score >= 65 ? "Reliable" : "Building trust",
  };
}
