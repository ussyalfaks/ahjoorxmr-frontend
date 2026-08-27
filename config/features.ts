export interface Feature {
  id: string;
  title: string;
  description: string;
  active: boolean; // Set to false to disable this feature spotlight globally
}

export const SHIPPED_FEATURES: Feature[] = [
  {
    id: "multi-wallet",
    title: "Linked Wallets",
    description: "You can now connect and manage multiple wallets from your settings.",
    active: true,
  },
  {
    id: "dashboard-customize",
    title: "Customize Layout",
    description: "Rearrange and hide widgets to tailor the dashboard to your needs.",
    active: true,
  },
];
