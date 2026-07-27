"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title: string;
  message?: string;
  variant?: ToastVariant;
}

export interface ToastItem extends Required<Pick<ToastInput, "title">> {
  id: string;
  message?: string;
  variant: ToastVariant;
  phase: "entering" | "visible" | "leaving";
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 220;

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, phase: "leaving" } : toast))
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = createToastId();
    const nextToast: ToastItem = {
      id,
      title: toast.title,
      message: toast.message,
      variant: toast.variant ?? "info",
      phase: "entering",
    };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      setToasts((current) =>
        current.map((item) => (item.id === id ? { ...item, phase: "visible" } : item))
      );
    }, 20);

    window.setTimeout(() => {
      setToasts((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) =>
              item.id === id ? { ...item, phase: "leaving" } : item
            )
          : current
      );

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, EXIT_ANIMATION_MS);
    }, AUTO_DISMISS_MS);

    return id;
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

export function toastVariantStyles(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        ring: "ring-emerald-500/25",
        accent: "bg-emerald-500/15 text-emerald-300",
        title: "text-emerald-50",
        message: "text-emerald-100/80",
        icon: CheckCircle2,
      };
    case "error":
      return {
        ring: "ring-rose-500/25",
        accent: "bg-rose-500/15 text-rose-300",
        title: "text-rose-50",
        message: "text-rose-100/80",
        icon: AlertCircle,
      };
    case "warning":
      return {
        ring: "ring-amber-500/25",
        accent: "bg-amber-500/15 text-amber-300",
        title: "text-amber-50",
        message: "text-amber-100/80",
        icon: TriangleAlert,
      };
    case "info":
    default:
      return {
        ring: "ring-sky-500/25",
        accent: "bg-sky-500/15 text-sky-300",
        title: "text-sky-50",
        message: "text-sky-100/80",
        icon: Info,
      };
  }
}
