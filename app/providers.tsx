"use client";

import { WalletProvider } from "@/contexts/WalletContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
