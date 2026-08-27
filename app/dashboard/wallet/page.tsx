"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Filter,
  LogOut,
  Plus,
  Wallet,
  LogIn,
  Send,
  Hand,
  Users,
  Zap,
} from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import { useWallet, truncateAddress, AVAILABLE_WALLETS } from "@/contexts/WalletContext";

type TransactionType = "contribution" | "payout" | "join";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  token_symbol: string;
  circle_name: string;
  date: string;
  tx_hash: string;
}

// Mock transaction data shaped for future on-chain integration
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "contribution",
    amount: 50,
    token_symbol: "USDT",
    circle_name: "Family Growth",
    date: "2026-07-28T14:30:00Z",
    tx_hash: "0x8f41a8dd0a13cc9c5f8d25c8e2f2f2a34e1d0b4f0a5a9d6c7b8c9d0e1f2a3b4c",
  },
  {
    id: "2",
    type: "payout",
    amount: 120,
    token_symbol: "USDC",
    circle_name: "School Fees",
    date: "2026-07-27T10:15:00Z",
    tx_hash: "0x4c2f19ab31d8f4e5c9b0d7a23e1f4a8b6c5d4e3f2a1b09876543210fedcba98",
  },
  {
    id: "3",
    type: "join",
    amount: 0,
    token_symbol: "",
    circle_name: "Car Repairs",
    date: "2026-07-26T08:45:00Z",
    tx_hash: "0x19d3b7f5a8c1e2d4f6b7a9c0d1e3f4a5b6c7d8e9f0a1234567890abcdef1234",
  },
  {
    id: "4",
    type: "payout",
    amount: 75,
    token_symbol: "STRK",
    circle_name: "Wedding Fund",
    date: "2026-07-25T14:00:00Z",
    tx_hash: "0x7b6a5d4c3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3210ab9cd8ef7654",
  },
  {
    id: "5",
    type: "contribution",
    amount: 200,
    token_symbol: "USDT",
    circle_name: "Community Project",
    date: "2026-07-24T11:30:00Z",
    tx_hash: "0x2d4f6b8a1c3e5f7a9d0b2c4e6f8a1d3c5e7f9b0a2c4e6f8a1d3c5e7f9b0a2c4",
  },
  {
    id: "6",
    type: "contribution",
    amount: 35,
    token_symbol: "USDC",
    circle_name: "Savings Challenge",
    date: "2026-07-23T09:15:00Z",
    tx_hash: "0x6e5d4c3b2a1908f7e6d5c4b3a291807f6e5d4c3b2a1908f7e6d5c4b3a291807",
  },
  {
    id: "7",
    type: "join",
    amount: 0,
    token_symbol: "",
    circle_name: "Travel Fund",
    date: "2026-07-22T15:45:00Z",
    tx_hash: "0x9a8b7c6d5e4f3210ab9cd8ef7654c3b2a1908f7e6d5c4b3a291807f6e5d4c3b",
  },
  {
    id: "8",
    type: "payout",
    amount: 90,
    token_symbol: "USDT",
    circle_name: "Family Growth",
    date: "2026-07-21T12:00:00Z",
    tx_hash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567890",
  },
];

const TRANSACTION_ICONS: Record<TransactionType, React.ReactNode> = {
  contribution: <Send size={16} />,
  payout: <Hand size={16} />,
  join: <Users size={16} />,
};

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  contribution: "Contribution",
  payout: "Payout",
  join: "Joined Circle",
};

const TRANSACTION_COLORS: Record<TransactionType, string> = {
  contribution: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  payout: "bg-green-500/10 text-green-600 dark:text-green-400",
  join: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getExplorerUrl(txHash: string, network = "starknet"): string {
  const baseUrls: Record<string, string> = {
    starknet: "https://starkscan.co/tx/",
    ethereum: "https://etherscan.io/tx/",
    polygon: "https://polygonscan.com/tx/",
  };
  return `${baseUrls[network] || baseUrls.starknet}${txHash}`;
}

export default function WalletPage() {
  const { linkedWallets, activeWalletAddress, setActiveWallet, isConnected, disconnect, connect } = useWallet();
  const [selectedFilter, setSelectedFilter] = useState<TransactionType | "all">("all");
  const [walletToRemove, setWalletToRemove] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "all") return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter((tx) => tx.type === selectedFilter);
  }, [selectedFilter]);

  const stats = useMemo(() => {
    return {
      totalContributions: MOCK_TRANSACTIONS.filter((tx) => tx.type === "contribution").reduce(
        (sum, tx) => sum + tx.amount,
        0
      ),
      totalPayouts: MOCK_TRANSACTIONS.filter((tx) => tx.type === "payout").reduce(
        (sum, tx) => sum + tx.amount,
        0
      ),
      circlesJoined: MOCK_TRANSACTIONS.filter((tx) => tx.type === "join").length,
      totalTransactions: MOCK_TRANSACTIONS.length,
    };
  }, []);

  const handleDisconnect = useCallback(() => {
    if (walletToRemove) {
      disconnect(walletToRemove);
      setWalletToRemove(null);
    }
  }, [disconnect, walletToRemove]);

  if (!isConnected) {
    return (
      <div className="space-y-8 pb-20 md:pb-0">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold font-sora text-[var(--text)] shrink-0">Wallet</h1>
          <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
        </div>

        {/* Empty State */}
        <div className="bg-[var(--content)] p-12 rounded-3xl flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
            <Wallet size={40} className="text-[var(--muted)]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold font-sora text-[var(--text)] mb-3">
            No wallet connected
          </h2>
          <p className="text-[var(--muted)] mb-8 max-w-md">
            Connect your wallet to view your on-chain activity across all circles, including
            contributions, payouts, and memberships.
          </p>
          <button
            onClick={() => connect("argent")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <LogIn size={18} aria-hidden="true" />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold font-sora text-[var(--text)]">Wallet</h1>
          <div className="h-px bg-[var(--ov-1a)] w-40" aria-hidden="true" />
        </div>
      </div>

      {/* Linked Wallets Card */}
      <div className="bg-[var(--content)] p-6 md:p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[var(--text)] text-lg font-bold font-sora">Linked Wallets</p>
            <p className="text-[var(--muted)] text-sm">Manage your connected accounts</p>
          </div>
          <button
            onClick={() => connect("argent")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white hover:bg-gray-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            <Plus size={16} aria-hidden="true" />
            Link New Wallet
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {linkedWallets.map((wallet) => (
            <div key={wallet.address} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 ${activeWalletAddress === wallet.address ? 'border-[#4B6B76] bg-[#4B6B76]/5' : 'border-[var(--ov-1a)] bg-[var(--ov-05)]'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ov-0a)] flex items-center justify-center shrink-0">
                  <Wallet size={20} className={activeWalletAddress === wallet.address ? 'text-[#4B6B76]' : 'text-[var(--text)]'} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold font-sora text-[var(--text)] flex items-center gap-2">
                      {truncateAddress(wallet.address)}
                      <CopyButton value={wallet.address} />
                    </p>
                    {activeWalletAddress === wallet.address && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#4B6B76] text-white">Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
                    <span>{AVAILABLE_WALLETS.find(w => w.id === wallet.walletId)?.name || wallet.walletId}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--ov-1a)]"></span>
                    <span>${wallet.balance?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {activeWalletAddress !== wallet.address && (
                  <button
                    onClick={() => setActiveWallet(wallet.address)}
                    className="px-3 py-1.5 text-xs font-medium text-[#4B6B76] hover:bg-[#4B6B76]/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                  >
                    Make Active
                  </button>
                )}
                <button
                  onClick={() => setWalletToRemove(wallet.address)}
                  className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Remove wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--modal)] p-4 rounded-xl">
            <p className="text-[var(--muted)] text-xs font-medium mb-2">Total Contributed</p>
            <p className="text-xl font-semibold text-[var(--text)]">${stats.totalContributions}</p>
          </div>
          <div className="bg-[var(--modal)] p-4 rounded-xl">
            <p className="text-[var(--muted)] text-xs font-medium mb-2">Total Payouts</p>
            <p className="text-xl font-semibold text-[var(--text)]">${stats.totalPayouts}</p>
          </div>
          <div className="bg-[var(--modal)] p-4 rounded-xl">
            <p className="text-[var(--muted)] text-xs font-medium mb-2">Circles Joined</p>
            <p className="text-xl font-semibold text-[var(--text)]">{stats.circlesJoined}</p>
          </div>
          <div className="bg-[var(--modal)] p-4 rounded-xl">
            <p className="text-[var(--muted)] text-xs font-medium mb-2">Total Transactions</p>
            <p className="text-xl font-semibold text-[var(--text)]">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-sora text-[var(--text)]">Transaction History</h2>
            <div className="h-px bg-[var(--ov-1a)] w-40" aria-hidden="true" />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "contribution", "payout", "join"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                selectedFilter === type
                  ? "bg-white text-black"
                  : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {type === "all" ? "All Transactions" : TRANSACTION_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-[var(--content)] p-8 rounded-3xl text-center">
            <Zap size={32} className="text-[var(--muted)] mx-auto mb-3" aria-hidden="true" />
            <p className="text-[var(--muted)]">No transactions found</p>
          </div>
        ) : (
          <div className="bg-[var(--content)] rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--ov-0f)] bg-[var(--modal)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      Circle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ov-0f)]">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-[var(--modal)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-fit inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${TRANSACTION_COLORS[tx.type]}`}
                        >
                          {TRANSACTION_ICONS[tx.type]}
                          {TRANSACTION_LABELS[tx.type]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[var(--text)] font-medium">{tx.circle_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[var(--text)] font-semibold">
                          {tx.type === "join" ? "—" : `${tx.amount} ${tx.token_symbol}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[var(--muted)] text-sm">{formatDate(tx.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={getExplorerUrl(tx.tx_hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                          aria-label={`View transaction ${tx.tx_hash} on block explorer`}
                        >
                          <ExternalLink size={18} aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
      {walletToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--content)] p-8 rounded-2xl max-w-sm mx-4 shadow-lg">
            <h3 className="text-xl font-bold font-sora text-[var(--text)] mb-3">
              Disconnect Wallet?
            </h3>
            <p className="text-[var(--muted)] mb-8">
              Are you sure you want to disconnect {truncateAddress(walletToRemove)}? You can reconnect it later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setWalletToRemove(null)}
                className="flex-1 px-4 py-3 bg-[var(--ov-0a)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--ov-1a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-3 bg-red-600/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-600/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
