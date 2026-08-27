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

export interface LinkedWallet {
  address: string;
  walletId: WalletId;
  balance: number;
}

interface WalletContextValue {
  linkedWallets: LinkedWallet[];
  activeWalletAddress: string | null;
  
  // Legacy compat
  address: string | null;
  walletName: string | null;
  isConnected: boolean;
  
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: (address?: string) => void;
  setActiveWallet: (address: string) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY_LINKED = "ahjoor_linked_wallets";
const STORAGE_KEY_ACTIVE = "ahjoor_active_wallet";

function generateMockAddress(walletId: WalletId): string {
  const prefix = walletId === "argent" ? "0x01a" : "0x02b";
  const hex = Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
  return `${prefix}${hex.slice(0, 37)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([]);
  const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedWallets = localStorage.getItem(STORAGE_KEY_LINKED);
      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      const legacyStored = localStorage.getItem("ahjoor_wallet");
      
      if (storedWallets) {
        const parsed = JSON.parse(storedWallets) as LinkedWallet[];
        setLinkedWallets(parsed);
        if (storedActive && parsed.some(w => w.address === storedActive)) {
          setActiveWalletAddress(storedActive);
        } else if (parsed.length > 0) {
          setActiveWalletAddress(parsed[0].address);
        }
      } else if (legacyStored) {
        const { address: addr, walletId: wid } = JSON.parse(legacyStored);
        const legacyWallet: LinkedWallet = { address: addr, walletId: wid, balance: 1500.50 };
        setLinkedWallets([legacyWallet]);
        setActiveWalletAddress(addr);
        localStorage.setItem(STORAGE_KEY_LINKED, JSON.stringify([legacyWallet]));
        localStorage.setItem(STORAGE_KEY_ACTIVE, addr);
        localStorage.removeItem("ahjoor_wallet");
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveToStorage = (wallets: LinkedWallet[], activeAddr: string | null) => {
    try {
      localStorage.setItem(STORAGE_KEY_LINKED, JSON.stringify(wallets));
      if (activeAddr) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeAddr);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch {
      // ignore
    }
  };

  const connect = useCallback(async (wid: WalletId) => {
    const addr = generateMockAddress(wid);
    const mockBalance = Number((Math.random() * 5000).toFixed(2));
    
    setLinkedWallets(prev => {
      const newWallets = [...prev, { address: addr, walletId: wid, balance: mockBalance }];
      saveToStorage(newWallets, addr);
      return newWallets;
    });
    setActiveWalletAddress(addr);
  }, []);

  const disconnect = useCallback((addrToRemove?: string) => {
    setLinkedWallets(prev => {
      const targetAddr = addrToRemove || activeWalletAddress;
      if (!targetAddr) return prev;
      
      const newWallets = prev.filter(w => w.address !== targetAddr);
      
      let newActive = activeWalletAddress;
      if (activeWalletAddress === targetAddr) {
        newActive = newWallets.length > 0 ? newWallets[0].address : null;
        setActiveWalletAddress(newActive);
      }
      
      saveToStorage(newWallets, newActive);
      return newWallets;
    });
  }, [activeWalletAddress]);

  const setActiveWallet = useCallback((addr: string) => {
    setActiveWalletAddress(addr);
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, addr);
    } catch {}
  }, []);

  const activeWallet = linkedWallets.find(w => w.address === activeWalletAddress) || null;
  const walletName = activeWallet 
    ? (AVAILABLE_WALLETS.find((w) => w.id === activeWallet.walletId)?.name ?? null)
    : null;

  return (
    <WalletContext.Provider
      value={{ 
        linkedWallets,
        activeWalletAddress,
        address: activeWalletAddress, 
        walletName, 
        isConnected: !!activeWalletAddress, 
        connect, 
        disconnect,
        setActiveWallet
      }}
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
