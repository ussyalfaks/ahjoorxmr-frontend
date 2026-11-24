import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WalletProvider, useWallet, type WalletId } from "../WalletContext";
import * as freighterApi from "@stellar/freighter-api";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";

// Mock @stellar/freighter-api
vi.mock("@stellar/freighter-api", () => {
  return {
    isConnected: vi.fn(),
    requestAccess: vi.fn(),
    signTransaction: vi.fn(),
  };
});

// Mock @creit.tech/stellar-wallets-kit
vi.mock("@creit.tech/stellar-wallets-kit", () => {
  const mockKit = {
    init: vi.fn(),
    setNetwork: vi.fn(),
    setWallet: vi.fn(),
    getAddress: vi.fn(),
    signTransaction: vi.fn(),
  };
  return {
    StellarWalletsKit: mockKit,
    Networks: {
      PUBLIC: "PUBLIC",
      TESTNET: "TESTNET",
    },
  };
});

// Mock @creit.tech/stellar-wallets-kit/modules/utils
vi.mock("@creit.tech/stellar-wallets-kit/modules/utils", () => {
  return {
    defaultModules: vi.fn(() => []),
  };
});

const FREIGHTER_TEST_ADDR = "GBZXN7PIRZGNMHGA728RGRFZAPPWN9G8K375UOW98327U7V38P172837";
const SECOND_TEST_ADDR = "GCLWGQPMKXQSPF776IU33AH4PZNOOWNAWGGCD6TFEC3AXTCWBTOWDY24";
const THIRD_TEST_ADDR = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

describe("WalletContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    delete (window as unknown as Record<string, unknown>).freighter;
    delete (window as unknown as Record<string, unknown>).xBullSDK;

    // Default mock fetch for Horizon account balance
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          balances: [{ asset_type: "native", balance: "100.5" }],
        }),
      })
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  describe("Connect with Freighter (mocked) sets the active wallet", () => {
    it("successfully connects with Freighter and sets it as the active wallet", async () => {
      // Simulate Freighter extension installed on window
      (window as unknown as Record<string, unknown>).freighter = {};

      vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: FREIGHTER_TEST_ADDR,
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      let returnedAddr: string | null = null;
      await act(async () => {
        returnedAddr = await result.current.connect("freighter");
      });

      expect(returnedAddr).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.activeWalletAddress).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.address).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.walletName).toBe("Freighter");
      expect(result.current.error).toBeNull();
      expect(result.current.isExtensionMissing).toBe(false);

      expect(result.current.linkedWallets).toHaveLength(1);
      expect(result.current.linkedWallets[0]).toMatchObject({
        address: FREIGHTER_TEST_ADDR,
        walletId: "freighter",
        balance: 100.5,
      });

      // Verify persistence to storage
      const storedWallets = JSON.parse(
        localStorage.getItem("ahjoor_linked_wallets") || "[]"
      );
      expect(storedWallets).toHaveLength(1);
      expect(storedWallets[0].address).toBe(FREIGHTER_TEST_ADDR);
      expect(localStorage.getItem("ahjoor_active_wallet")).toBe(FREIGHTER_TEST_ADDR);
      expect(localStorage.getItem("ahjoor_last_wallet_id")).toBe("freighter");
    });

    it("updates existing wallet balance and avoids duplicate entries in linkedWallets", async () => {
      (window as unknown as Record<string, unknown>).freighter = {};
      vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        address: FREIGHTER_TEST_ADDR,
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      await act(async () => {
        await result.current.connect("freighter");
      });
      expect(result.current.linkedWallets).toHaveLength(1);

      // Connect again with updated balance mock
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            balances: [{ asset_type: "native", balance: "250.75" }],
          }),
        })
      );

      await act(async () => {
        await result.current.connect("freighter");
      });

      expect(result.current.linkedWallets).toHaveLength(1);
      expect(result.current.linkedWallets[0].balance).toBe(250.75);
      expect(result.current.activeWalletAddress).toBe(FREIGHTER_TEST_ADDR);
    });
  });

  describe("Errors from the wallet are surfaced (not installed, access denied)", () => {
    it("surfaces error when Freighter extension is not installed (window.freighter missing)", async () => {
      delete (window as unknown as Record<string, unknown>).freighter;

      const { result } = renderHook(() => useWallet(), { wrapper });

      let returnedAddr: string | null = null;
      await act(async () => {
        returnedAddr = await result.current.connect("freighter");
      });

      expect(returnedAddr).toBeNull();
      expect(result.current.isExtensionMissing).toBe(true);
      expect(result.current.error).toMatch(/freighter not installed or not enabled/i);
      expect(result.current.activeWalletAddress).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(freighterApi.isConnected).not.toHaveBeenCalled();
    });

    it("surfaces error when Freighter extension check fails via isConnected()", async () => {
      (window as unknown as Record<string, unknown>).freighter = {};
      vi.mocked(freighterApi.isConnected).mockResolvedValue({
        isConnected: false,
        error: "Extension disabled",
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      let returnedAddr: string | null = null;
      await act(async () => {
        returnedAddr = await result.current.connect("freighter");
      });

      expect(returnedAddr).toBeNull();
      expect(result.current.isExtensionMissing).toBe(true);
      expect(result.current.error).toBe("Freighter not installed or not enabled");
      expect(result.current.activeWalletAddress).toBeNull();
      expect(freighterApi.requestAccess).not.toHaveBeenCalled();
    });

    it("surfaces error when user denies access in Freighter", async () => {
      (window as unknown as Record<string, unknown>).freighter = {};
      vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
      vi.mocked(freighterApi.requestAccess).mockResolvedValue({
        error: "User rejected connection request",
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      let returnedAddr: string | null = null;
      await act(async () => {
        returnedAddr = await result.current.connect("freighter");
      });

      expect(returnedAddr).toBeNull();
      expect(result.current.isExtensionMissing).toBe(false);
      expect(result.current.error).toBe("Freighter access denied by user");
      expect(result.current.activeWalletAddress).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });

    it("surfaces unexpected error during connectFreighter", async () => {
      (window as unknown as Record<string, unknown>).freighter = {};
      vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true });
      vi.mocked(freighterApi.requestAccess).mockRejectedValue(
        new Error("Freighter internal communication error")
      );

      const { result } = renderHook(() => useWallet(), { wrapper });

      let returnedAddr: string | null = null;
      await act(async () => {
        returnedAddr = await result.current.connect("freighter");
      });

      expect(returnedAddr).toBeNull();
      expect(result.current.error).toBe("Freighter internal communication error");
      expect(result.current.activeWalletAddress).toBeNull();
    });
  });

  describe("Linked wallets and the active wallet persist and restore after reload", () => {
    it("restores linked wallets and the active wallet from localStorage on mount", () => {
      const persistedWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 75.0,
          network: "testnet",
          hasUsdcTrustline: true,
        },
        {
          address: SECOND_TEST_ADDR,
          walletId: "albedo" as WalletId,
          balance: 120.0,
          network: "testnet",
          hasUsdcTrustline: false,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(persistedWallets));
      localStorage.setItem("ahjoor_active_wallet", SECOND_TEST_ADDR);
      localStorage.setItem("ahjoor_network", "mainnet");

      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(result.current.linkedWallets).toHaveLength(2);
      expect(result.current.linkedWallets[0].address).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.linkedWallets[1].address).toBe(SECOND_TEST_ADDR);
      expect(result.current.activeWalletAddress).toBe(SECOND_TEST_ADDR);
      expect(result.current.address).toBe(SECOND_TEST_ADDR);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.walletName).toBe("Albedo");
      expect(result.current.network).toBe("mainnet");
    });

    it("falls back to the first linked wallet if stored active wallet is invalid", () => {
      const persistedWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
        },
        {
          address: SECOND_TEST_ADDR,
          walletId: "xbull" as WalletId,
          balance: 10.0,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(persistedWallets));
      localStorage.setItem("ahjoor_active_wallet", "G_UNKNOWN_ADDRESS");

      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(result.current.linkedWallets).toHaveLength(2);
      expect(result.current.activeWalletAddress).toBe(FREIGHTER_TEST_ADDR);
    });

    it("handles corrupted or empty storage gracefully without throwing", () => {
      localStorage.setItem("ahjoor_linked_wallets", "invalid-json-string{");

      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(result.current.linkedWallets).toEqual([]);
      expect(result.current.activeWalletAddress).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Disconnect removes the wallet and picks a new active one", () => {
    it("removes active wallet and automatically picks the next linked wallet as active", async () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
        {
          address: SECOND_TEST_ADDR,
          walletId: "albedo" as WalletId,
          balance: 30.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
        {
          address: THIRD_TEST_ADDR,
          walletId: "lobstr" as WalletId,
          balance: 15.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));
      localStorage.setItem("ahjoor_active_wallet", FREIGHTER_TEST_ADDR);

      const { result } = renderHook(() => useWallet(), { wrapper });

      expect(result.current.activeWalletAddress).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.linkedWallets).toHaveLength(3);

      // Disconnect current active wallet without argument
      act(() => {
        result.current.disconnect();
      });

      expect(result.current.linkedWallets).toHaveLength(2);
      expect(result.current.linkedWallets.some((w) => w.address === FREIGHTER_TEST_ADDR)).toBe(
        false
      );
      // Next remaining wallet should become active
      expect(result.current.activeWalletAddress).toBe(SECOND_TEST_ADDR);
      expect(result.current.walletName).toBe("Albedo");

      // Verify localStorage was updated
      expect(localStorage.getItem("ahjoor_active_wallet")).toBe(SECOND_TEST_ADDR);
      const updatedStorageWallets = JSON.parse(
        localStorage.getItem("ahjoor_linked_wallets") || "[]"
      );
      expect(updatedStorageWallets).toHaveLength(2);
      expect(updatedStorageWallets[0].address).toBe(SECOND_TEST_ADDR);
    });

    it("removes a specific non-active wallet without changing current active wallet", () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
        {
          address: SECOND_TEST_ADDR,
          walletId: "albedo" as WalletId,
          balance: 30.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));
      localStorage.setItem("ahjoor_active_wallet", FREIGHTER_TEST_ADDR);

      const { result } = renderHook(() => useWallet(), { wrapper });

      act(() => {
        result.current.disconnect(SECOND_TEST_ADDR);
      });

      expect(result.current.linkedWallets).toHaveLength(1);
      expect(result.current.linkedWallets[0].address).toBe(FREIGHTER_TEST_ADDR);
      expect(result.current.activeWalletAddress).toBe(FREIGHTER_TEST_ADDR);
      expect(localStorage.getItem("ahjoor_active_wallet")).toBe(FREIGHTER_TEST_ADDR);
    });

    it("resets active wallet and storage when the sole remaining wallet is disconnected", () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));
      localStorage.setItem("ahjoor_active_wallet", FREIGHTER_TEST_ADDR);

      const { result } = renderHook(() => useWallet(), { wrapper });

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.linkedWallets).toHaveLength(0);
      expect(result.current.activeWalletAddress).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.walletName).toBeNull();
      expect(localStorage.getItem("ahjoor_active_wallet")).toBeNull();
    });
  });

  describe("Stellar Wallets Kit integration (mocked)", () => {
    it("connects with a kit-supported wallet (e.g. Albedo)", async () => {
      vi.mocked(StellarWalletsKit.getAddress).mockResolvedValue({
        address: SECOND_TEST_ADDR,
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      let addr: string | null = null;
      await act(async () => {
        addr = await result.current.connect("albedo");
      });

      expect(addr).toBe(SECOND_TEST_ADDR);
      expect(result.current.activeWalletAddress).toBe(SECOND_TEST_ADDR);
      expect(result.current.walletName).toBe("Albedo");
      expect(StellarWalletsKit.setWallet).toHaveBeenCalledWith("albedo");
    });

    it("surfaces error when kit fails to retrieve address", async () => {
      vi.mocked(StellarWalletsKit.getAddress).mockResolvedValue({
        address: "",
      });

      const { result } = renderHook(() => useWallet(), { wrapper });

      let addr: string | null = null;
      await act(async () => {
        addr = await result.current.connect("albedo");
      });

      expect(addr).toBeNull();
      expect(result.current.error).toBe("Could not retrieve address from albedo");
      expect(result.current.activeWalletAddress).toBeNull();
    });
  });

  describe("Context utility helpers", () => {
    it("setActiveWallet updates the active wallet and persists to storage", () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
        {
          address: SECOND_TEST_ADDR,
          walletId: "albedo" as WalletId,
          balance: 30.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];

      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));
      localStorage.setItem("ahjoor_active_wallet", FREIGHTER_TEST_ADDR);

      const { result } = renderHook(() => useWallet(), { wrapper });

      act(() => {
        result.current.setActiveWallet(SECOND_TEST_ADDR);
      });

      expect(result.current.activeWalletAddress).toBe(SECOND_TEST_ADDR);
      expect(localStorage.getItem("ahjoor_active_wallet")).toBe(SECOND_TEST_ADDR);
    });

    it("setWalletNetwork updates network for a specific wallet", () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];
      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));

      const { result } = renderHook(() => useWallet(), { wrapper });

      act(() => {
        result.current.setWalletNetwork(FREIGHTER_TEST_ADDR, "mainnet");
      });

      expect(result.current.linkedWallets[0].network).toBe("mainnet");
    });

    it("addUsdcTrustline marks hasUsdcTrustline as true", () => {
      const initialWallets = [
        {
          address: FREIGHTER_TEST_ADDR,
          walletId: "freighter" as WalletId,
          balance: 50.0,
          network: "testnet" as const,
          hasUsdcTrustline: false,
        },
      ];
      localStorage.setItem("ahjoor_linked_wallets", JSON.stringify(initialWallets));

      const { result } = renderHook(() => useWallet(), { wrapper });

      act(() => {
        result.current.addUsdcTrustline(FREIGHTER_TEST_ADDR);
      });

      expect(result.current.linkedWallets[0].hasUsdcTrustline).toBe(true);
    });
  });
});
