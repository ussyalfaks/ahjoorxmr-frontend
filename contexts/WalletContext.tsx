"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type WalletId = "argent" | "braavos";

export interface WalletInfo {
  id: WalletId;
  name: string;
}

export const AVAILABLE_WALLETS: WalletInfo[] = [
  { id: "argent", name: "Argent X" },
  { id: "braavos", name: "Braavos" },
];

interface WalletContextValue {
  address: string | null;
  walletName: string | null;
  isConnected: boolean;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "ahjoor_wallet";

interface StoredWallet {
  address: string;
  walletId: WalletId;
}

function mockAddressForWallet(walletId: WalletId): string {
  if (walletId === "argent") return "0xAb12f4e8c3d9a7b2e5f1c4d8a9b3e6f2c7d4cD34";
  return "0xBc34e9f7d2a8c1b5e4f3d7a2c6b9e1f5d3a7eF56";
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<WalletId | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { address: addr, walletId: wid } = JSON.parse(stored) as StoredWallet;
        setAddress(addr);
        setWalletId(wid);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const connect = useCallback(async (wid: WalletId) => {
    const addr = mockAddressForWallet(wid);
    setAddress(addr);
    setWalletId(wid);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: addr, walletId: wid }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const walletName = walletId
    ? (AVAILABLE_WALLETS.find((w) => w.id === walletId)?.name ?? null)
    : null;

  return (
    <WalletContext.Provider
      value={{ address, walletName, isConnected: !!address, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
