"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight } from "lucide-react";
import { useWallet, AVAILABLE_WALLETS } from "@/contexts/WalletContext";

export default function LoginPage() {
  const { connect, authenticateWallet, signInWithPasskey } = useWallet();
  const router = useRouter();
  const [signingWalletId, setSigningWalletId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInWithWallet = async (walletId: (typeof AVAILABLE_WALLETS)[number]["id"]) => {
    setSigningWalletId(walletId);
    setError(null);
    try {
      const address = await connect(walletId);
      if (!address) {
        setError("Could not connect to the selected wallet. Install or enable it and try again.");
        return;
      }
      await authenticateWallet(address, walletId);
      router.push("/dashboard");
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Wallet sign-in failed.");
    } finally {
      setSigningWalletId(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Welcome Back</h1>
          <p className="text-[var(--muted)]">Sign in to continue to your circles</p>
        </div>

        <div className="space-y-4">
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          {AVAILABLE_WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => void signInWithWallet(wallet.id)}
              disabled={signingWalletId !== null}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] transition-colors"
            >
              <span className="font-medium text-[var(--text)]">
                {signingWalletId === wallet.id ? "Waiting for wallet signature..." : wallet.name}
              </span>
              <Wallet className="h-5 w-5 text-[var(--muted)]" />
            </button>
          ))}

          <button
            onClick={() => void signInWithPasskey()}
            disabled={signingWalletId !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)] transition-colors"
          >
            <span className="font-medium text-[var(--text)]">Sign in with Passkey</span>
            <ArrowRight className="h-5 w-5 text-[var(--muted)]" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-center text-sm text-[var(--muted)] mb-3">
            Using email/password?
          </p>
          <Link
            href="/forgot-password"
            className="block text-center text-sm text-[var(--primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}