"use client";

import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WalletProvider>
        <ToastProvider>{children}</ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
