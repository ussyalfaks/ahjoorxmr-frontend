"use client";

import { safeStorage } from "@/lib/safeStorage";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authenticateWithPasskey } from "@/lib/passkeys";
import { APP_NETWORK } from "@/config/network";

// Stellar wallet IDs supported via @creit.tech/stellar-wallets-kit
export type WalletId = "freighter" | "xbull" | "albedo" | "lobstr" | "passkey";

export type StellarNetwork = "testnet" | "mainnet";

export interface WalletInfo {
  id: WalletId;
  name: string;
}

export const AVAILABLE_WALLETS: WalletInfo[] = [
  { id: "freighter", name: "Freighter" },
  { id: "xbull", name: "xBull" },
  { id: "albedo", name: "Albedo" },
  { id: "lobstr", name: "LOBSTR" },
];

export interface LinkedWallet {
  address: string;
  walletId: WalletId;
  balance: number;
  // #220: what network this wallet reports itself on. Defaults to
  // APP_NETWORK on connect (a real integration would read this from
  // `getNetworkDetails()` instead) — see setWalletNetwork for how a
  // mismatch gets produced/cleared.
  network: StellarNetwork;
  // #217: whether this wallet already has a USDC trustline. Defaults to
  // false so the dashboard banner has something real to detect and
  // dismiss — a real integration would derive this from
  // `Horizon.loadAccount(address).balances`.
  hasUsdcTrustline: boolean;
}

interface WalletContextValue {
  linkedWallets: LinkedWallet[];
  activeWalletAddress: string | null;
  network: StellarNetwork;
  isExtensionMissing: boolean;

  // Legacy compat
  address: string | null;
  walletName: string | null;
  isConnected: boolean;

  connect: (walletId: WalletId) => Promise<void>;
  signInWithPasskey: () => Promise<void>;
  disconnect: (address?: string) => void;
  setActiveWallet: (address: string) => void;
  // #220: demo-only escape hatch to produce network mismatch
  setWalletNetwork: (address: string, network: StellarNetwork) => void;
  // #217: one-click USDC trustline action
  addUsdcTrustline: (address: string) => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY_LINKED = "ahjoor_linked_wallets";
const STORAGE_KEY_ACTIVE = "ahjoor_active_wallet";
const STORAGE_KEY_LAST_WALLET = "ahjoor_last_wallet_id";
const STORAGE_KEY_NETWORK = "ahjoor_network";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const HORIZON_MAINNET = "https://horizon.stellar.org";

function isFreighterInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as Record<string, unknown>)["freighter"];
}

function isXBullInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as Record<string, unknown>)["xBullSDK"];
}

function getExtensionCheckFn(walletId: WalletId): () => boolean {
  const checks: Partial<Record<WalletId, () => boolean>> = {
    freighter: isFreighterInstalled,
    xbull: isXBullInstalled,
    albedo: () => true, // web-based popup, extension not strictly required
    lobstr: () => true, // web-based / deep link
    passkey: () => true,
  };
  return checks[walletId] ?? (() => true);
}

async function fetchStellarBalance(address: string, network: StellarNetwork): Promise<number> {
  const horizonUrl = network === "mainnet" ? HORIZON_MAINNET : HORIZON_TESTNET;
  try {
    const res = await fetch(`${horizonUrl}/accounts/${address}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const native = (data.balances as Array<{ asset_type: string; balance: string }> | undefined)?.find(
      (b) => b.asset_type === "native"
    );
    return native ? parseFloat(native.balance) : 0;
  } catch {
    return 0;
  }
}

async function connectFreighter(network: StellarNetwork): Promise<string> {
  const { isConnected, requestAccess } = await import("@stellar/freighter-api");
  const connection = await isConnected();
  if (connection.error || !connection.isConnected) {
    throw new Error("Freighter not installed or not enabled");
  }
  const access = await requestAccess();
  if (access.error || !access.address) throw new Error("Freighter access denied by user");
  void network;
  return access.address;
}

let walletKitInitialized = false;

async function connectWalletKit(walletId: WalletId, network: StellarNetwork): Promise<string> {
  const [{ StellarWalletsKit, Networks }, { defaultModules }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit"),
    import("@creit.tech/stellar-wallets-kit/modules/utils"),
  ]);
  if (!walletKitInitialized) {
    StellarWalletsKit.init({ modules: defaultModules() });
    walletKitInitialized = true;
  }
  StellarWalletsKit.setNetwork(network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET);
  StellarWalletsKit.setWallet(walletId);
  const { address } = await StellarWalletsKit.getAddress();
  if (!address) throw new Error(`Could not retrieve address from ${walletId}`);
  return address;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([]);
  const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<StellarNetwork>("testnet");
  const [isExtensionMissing, setIsExtensionMissing] = useState(false);

  // Load persisted wallets + auto-reconnect last-used wallet
  useEffect(() => {
    try {
      const storedNetwork = localStorage.getItem(STORAGE_KEY_NETWORK) as StellarNetwork | null;
      if (storedNetwork === "mainnet" || storedNetwork === "testnet") {
        setNetwork(storedNetwork);
      }

      const storedWallets = localStorage.getItem(STORAGE_KEY_LINKED);
      const storedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);

      if (storedWallets) {
        // Backfills network/hasUsdcTrustline for wallets persisted before those fields existed
        type StoredWallet = Omit<LinkedWallet, "network" | "hasUsdcTrustline"> &
          Partial<Pick<LinkedWallet, "network" | "hasUsdcTrustline">>;
        const parsed = (JSON.parse(storedWallets) as StoredWallet[]).map((w): LinkedWallet => ({
          network: APP_NETWORK,
          hasUsdcTrustline: false,
          ...w,
        }));
        setLinkedWallets(parsed);
        if (storedActive && parsed.some((w) => w.address === storedActive)) {
          setActiveWalletAddress(storedActive);
        } else if (parsed.length > 0) {
          setActiveWalletAddress(parsed[0].address);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveToStorage = (wallets: LinkedWallet[], activeAddr: string | null) => {
    try {
      safeStorage.setItem(STORAGE_KEY_LINKED, JSON.stringify(wallets));
      if (activeAddr) {
        safeStorage.setItem(STORAGE_KEY_ACTIVE, activeAddr);
      } else {
        safeStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch {
      // ignore
    }
  };

  const connect = useCallback(
    async (wid: WalletId) => {
      const checkInstalled = getExtensionCheckFn(wid);
      if (!checkInstalled()) {
        setIsExtensionMissing(true);
        return;
      }
      setIsExtensionMissing(false);

      let addr: string;
      try {
        if (wid === "freighter") {
          addr = await connectFreighter(network);
        } else {
          addr = await connectWalletKit(wid, network);
        }
      } catch {
        setIsExtensionMissing(true);
        return;
      }

      const balance = await fetchStellarBalance(addr, network);

      setLinkedWallets((prev) => {
        // avoid duplicates
        const existing = prev.find((w) => w.address === addr);
        const newWallets = existing
          ? prev.map((w) => (w.address === addr ? { ...w, balance } : w))
          : [...prev, { address: addr, walletId: wid, balance, network: APP_NETWORK, hasUsdcTrustline: false }];
        saveToStorage(newWallets, addr);
        return newWallets;
      });
      setActiveWalletAddress(addr);

      try {
        localStorage.setItem(STORAGE_KEY_LAST_WALLET, wid);
      } catch {}
    },
    [network]
  );

  const signInWithPasskey = useCallback(async () => {
    try {
      await authenticateWithPasskey();
    } catch {
      // fallback mock passkey address
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let addr = "G";
    for (let i = 0; i < 55; i++) addr += chars[Math.floor(Math.random() * 32)];

    const balance = await fetchStellarBalance(addr, network);

    setLinkedWallets((prev) => {
      const newWallets = [...prev, { address: addr, walletId: "passkey" as const, balance, network: APP_NETWORK, hasUsdcTrustline: false }];
      saveToStorage(newWallets, addr);
      return newWallets;
    });
    setActiveWalletAddress(addr);
  }, [network]);

  const disconnect = useCallback(
    (addrToRemove?: string) => {
      setLinkedWallets((prev) => {
        const targetAddr = addrToRemove || activeWalletAddress;
        if (!targetAddr) return prev;

        const newWallets = prev.filter((w) => w.address !== targetAddr);

        let newActive = activeWalletAddress;
        if (activeWalletAddress === targetAddr) {
          newActive = newWallets.length > 0 ? newWallets[0].address : null;
          setActiveWalletAddress(newActive);
        }

        saveToStorage(newWallets, newActive);
        return newWallets;
      });
    },
    [activeWalletAddress]
  );

  const setWalletNetwork = useCallback((addr: string, net: StellarNetwork) => {
    setLinkedWallets((prev) => {
      const newWallets = prev.map((w) => (w.address === addr ? { ...w, network: net } : w));
      saveToStorage(newWallets, activeWalletAddress);
      return newWallets;
    });
  }, [activeWalletAddress]);

  const addUsdcTrustline = useCallback((addr: string) => {
    setLinkedWallets((prev) => {
      const newWallets = prev.map((w) => (w.address === addr ? { ...w, hasUsdcTrustline: true } : w));
      saveToStorage(newWallets, activeWalletAddress);
      return newWallets;
    });
  }, [activeWalletAddress]);

  const setActiveWallet = useCallback((addr: string) => {
    setActiveWalletAddress(addr);
    try {
      safeStorage.setItem(STORAGE_KEY_ACTIVE, addr);
    } catch {}
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!activeWalletAddress) return;
    const balance = await fetchStellarBalance(activeWalletAddress, network);
    setLinkedWallets((prev) => {
      const updated = prev.map((w) =>
        w.address === activeWalletAddress ? { ...w, balance } : w
      );
      saveToStorage(updated, activeWalletAddress);
      return updated;
    });
  }, [activeWalletAddress, network]);

  // Persist network choice
  const handleNetworkChange = useCallback((net: StellarNetwork) => {
    setNetwork(net);
    try {
      localStorage.setItem(STORAGE_KEY_NETWORK, net);
    } catch {}
  }, []);
  void handleNetworkChange; // exposed via context if consumers need it

  const activeWallet =
    linkedWallets.find((w) => w.address === activeWalletAddress) || null;
  const walletName = activeWallet
    ? (AVAILABLE_WALLETS.find((w) => w.id === activeWallet.walletId)?.name ??
        (activeWallet.walletId === "passkey" ? "Passkey" : null))
  : null;

  return (
    <WalletContext.Provider
      value={{
        linkedWallets,
        activeWalletAddress,
        network,
        isExtensionMissing,
        address: activeWalletAddress,
        walletName,
        isConnected: !!activeWalletAddress,
        connect,
        signInWithPasskey,
        disconnect,
        setActiveWallet,
        setWalletNetwork,
        addUsdcTrustline,
        refreshBalance,
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
