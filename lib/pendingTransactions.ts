"use client";

export type PendingTransactionStatus = "submitted" | "confirming" | "confirmed" | "failed";
export type TransactionNetwork = "starknet" | "ethereum" | "polygon";

export interface PendingTransaction {
  id: string;
  hash: string;
  network: TransactionNetwork;
  label: string;
  amount?: string;
  status: PendingTransactionStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ahjoor:pending-transactions";
const UPDATE_EVENT = "ahjoor:pending-transactions-updated";
const STATUS_TIMERS: Partial<Record<PendingTransactionStatus, number>> = {
  submitted: 2000,
  confirming: 5000,
};

const EXPLORER_URLS: Record<TransactionNetwork, string> = {
  starknet: "https://starkscan.co/tx/",
  ethereum: "https://etherscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
};

function readTransactions(): PendingTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingTransaction[]) : [];
  } catch {
    return [];
  }
}

function publish(transactions: PendingTransaction[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // Keep the current session usable when storage is unavailable.
  }
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getPendingTransactions(): PendingTransaction[] {
  return readTransactions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTransactionExplorerUrl(transaction: Pick<PendingTransaction, "hash" | "network">): string {
  return `${EXPLORER_URLS[transaction.network]}${transaction.hash}`;
}

export function addPendingTransaction(
  transaction: Pick<PendingTransaction, "hash" | "network" | "label" | "amount">
): PendingTransaction {
  const now = new Date().toISOString();
  const saved: PendingTransaction = {
    ...transaction,
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };
  publish([saved, ...readTransactions()]);
  return saved;
}

export function updatePendingTransactionStatus(id: string, status: PendingTransactionStatus) {
  publish(readTransactions().map((transaction) =>
    transaction.id === id ? { ...transaction, status, updatedAt: new Date().toISOString() } : transaction
  ));
}

export function dismissPendingTransaction(id: string) {
  publish(readTransactions().filter((transaction) => transaction.id !== id));
}

export function subscribeToPendingTransactions(listener: () => void): () => void {
  const handleUpdate = () => listener();
  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener("storage", handleUpdate);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

export function advancePendingTransactions(now = Date.now()) {
  const transactions = readTransactions();
  let changed = false;
  const updated = transactions.map((transaction) => {
    if (transaction.status !== "submitted" && transaction.status !== "confirming") return transaction;
    const elapsed = now - new Date(transaction.updatedAt).getTime();
    const timer = STATUS_TIMERS[transaction.status] ?? 0;
    if (elapsed < timer) return transaction;
    changed = true;
    const nextStatus: PendingTransactionStatus = transaction.status === "submitted" ? "confirming" : "confirmed";
    return { ...transaction, status: nextStatus, updatedAt: new Date(now).toISOString() };
  });
  if (changed) publish(updated);
}

export { UPDATE_EVENT };
