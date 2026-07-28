"use client";

import { useEffect } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures (e.g. unsupported browser) are non-fatal.
    });
  }, []);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  return (
    <ThemeProvider>
      <WalletProvider>
        <ToastProvider>{children}</ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
