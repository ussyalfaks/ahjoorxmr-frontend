// #220: the network this app is configured to operate on. A real wallet
// integration (Freighter et al.) exposes something like
// `getNetworkDetails()` returning the wallet's own passphrase/network —
// comparing that against this value is the whole guard. This app's wallet
// layer is currently fully mocked (see contexts/WalletContext.tsx), so the
// "detected" network lives on the mock `LinkedWallet` record instead of
// coming from a real extension call; the comparison and guard logic below
// are written the same way they would be against a real one.
import { publicEnv } from "@/lib/env";

export type StellarNetwork = "testnet" | "mainnet";

export const APP_NETWORK: StellarNetwork = publicEnv.stellarNetwork;

export const NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet",
};
