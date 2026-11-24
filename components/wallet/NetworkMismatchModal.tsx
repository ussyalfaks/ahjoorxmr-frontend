"use client";

import { AlertTriangle } from "lucide-react";
import { useNetworkGuard } from "@/hooks/useNetworkGuard";
import { NETWORK_LABELS } from "@/config/network";

// #220: a blocking modal — not a dismissible banner — because the failure
// mode this prevents (a signed transaction going to the wrong network)
// isn't something a toast-and-move-on warning adequately stops. Rendered
// wherever a mismatch could lead directly into a signing flow; mounting
// it is itself the "disable until networks match" behavior, since it
// covers the whole screen and the only action available is "how to fix
// this."
export default function NetworkMismatchModal() {
  const { isMismatched, appNetwork, walletNetwork } = useNetworkGuard();

  if (!isMismatched || !walletNetwork) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="network-mismatch-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--content)] p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <AlertTriangle size={24} aria-hidden="true" />
        </div>
        <h2 id="network-mismatch-title" className="mb-2 text-lg font-bold font-sora text-[var(--text)]">
          Your wallet is on the wrong network
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          This app runs on <strong className="text-[var(--text)]">{NETWORK_LABELS[appNetwork]}</strong>, but your
          wallet is currently connected to{" "}
          <strong className="text-[var(--text)]">{NETWORK_LABELS[walletNetwork]}</strong>. Signing a transaction
          like this would either fail outright or, worse, send real funds somewhere this app can&apos;t see.
          Transactions are disabled until this is resolved.
        </p>
        <ol className="mb-5 list-decimal space-y-1.5 pl-5 text-sm text-[var(--muted)]">
          <li>Open your wallet extension.</li>
          <li>Find its network setting (usually in Settings or a network switcher in the toolbar).</li>
          <li>
            Switch it to <strong className="text-[var(--text)]">{NETWORK_LABELS[appNetwork]}</strong>.
          </li>
          <li>Come back here — this screen will clear automatically once it matches.</li>
        </ol>
        <p className="text-xs text-[var(--faint)]">
          Nothing you&apos;ve done is lost. This only blocks new signing attempts.
        </p>
      </div>
    </div>
  );
}
