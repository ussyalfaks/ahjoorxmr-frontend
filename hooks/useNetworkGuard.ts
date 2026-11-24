"use client";

import { useWallet } from "@/contexts/WalletContext";
import { APP_NETWORK } from "@/config/network";

// #220: the one comparison the whole guard is built on. Called both right
// after connect (to decide whether to show the blocking modal at all) and
// again immediately before any signing flow starts (in case the wallet's
// network changed in the meantime — not possible with this mock wallet
// layer, but it is with a real extension the user can switch at any time).
export function useNetworkGuard() {
  const { activeWalletAddress, linkedWallets } = useWallet();
  const activeWallet = linkedWallets.find((w) => w.address === activeWalletAddress) ?? null;
  const walletNetwork = activeWallet?.network ?? null;
  const isMismatched = walletNetwork !== null && walletNetwork !== APP_NETWORK;

  return {
    appNetwork: APP_NETWORK,
    walletNetwork,
    isMismatched,
  };
}
