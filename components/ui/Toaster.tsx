"use client";

import { X } from "lucide-react";
import { toastVariantStyles, useToast } from "@/components/ui/Toast";

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
      {toasts.map((toast) => {
        const styles = toastVariantStyles(toast.variant);
        const Icon = styles.icon;

        return (
          <article
            key={toast.id}
            role="alert"
            aria-live="polite"
            className={`pointer-events-auto transform rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ${styles.ring} transition-all duration-200 ease-out ${
              toast.phase === "entering"
                ? "translate-x-4 opacity-0"
                : toast.phase === "leaving"
                  ? "translate-x-3 opacity-0"
                  : "translate-x-0 opacity-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${styles.accent}`}>
                <Icon size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold ${styles.title}`}>{toast.title}</div>
                {toast.message && (
                  <p className={`mt-1 text-sm leading-5 ${styles.message}`}>{toast.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                aria-label="Dismiss toast"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
