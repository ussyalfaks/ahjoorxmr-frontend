"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

const CONSENT_STORAGE_KEY = "cookie-consent";
const CONSENT_VERSION = 1;

type ConsentCategories = {
  essential: true;
  analytics: boolean;
  preferences: boolean;
};

type StoredConsent = {
  version: number;
  categories: ConsentCategories;
};

function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed || parsed.version !== CONSENT_VERSION || !parsed.categories) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistConsent(categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredConsent = { version: CONSENT_VERSION, categories };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable (private mode); consent simply won't persist.
  }
}

function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures (e.g. unsupported browser) are non-fatal.
    });
  }, []);
}

export type TableDensity = "comfortable" | "compact";

const DENSITY_STORAGE_KEY = "table-density";

type DensityContextValue = {
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
  toggleDensity: () => void;
};

const DensityContext = createContext<DensityContextValue | null>(null);

export function useTableDensity(): DensityContextValue {
  const ctx = useContext(DensityContext);
  if (!ctx) {
    throw new Error("useTableDensity must be used within a DensityProvider");
  }
  return ctx;
}

function readStoredDensity(): TableDensity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
    if (raw === "compact" || raw === "comfortable") return raw;
    return null;
  } catch {
    return null;
  }
}

function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<TableDensity>("comfortable");

  useEffect(() => {
    const stored = readStoredDensity();
    if (stored) setDensityState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.density = density;
  }, [density]);

  const setDensity = (next: TableDensity) => {
    setDensityState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode); density simply won't persist.
    }
  };

  const toggleDensity = () => {
    setDensity(density === "compact" ? "comfortable" : "compact");
  };

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setAnalytics(stored.categories.analytics);
      setPreferences(stored.categories.preferences);
    } else {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const open = () => {
      const stored = readStoredConsent();
      if (stored) {
        setAnalytics(stored.categories.analytics);
        setPreferences(stored.categories.preferences);
      }
      setShowPreferences(true);
      setVisible(true);
    };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const save = (categories: ConsentCategories) => {
    persistConsent(categories);
    setAnalytics(categories.analytics);
    setPreferences(categories.preferences);
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          We use cookies to run the site and, with your consent, to understand usage and remember
          your preferences. See our{" "}
          <a href="/privacy" className="underline">
            privacy policy
          </a>
          .
        </p>

        {showPreferences && (
          <fieldset className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-200">
            <legend className="font-medium">Cookie preferences</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked disabled aria-label="Essential cookies (always on)" />
              Essential (always on)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
              Analytics
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences}
                onChange={(e) => setPreferences(e.target.checked)}
              />
              Preferences
            </label>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save({ essential: true, analytics: true, preferences: true })}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => save({ essential: true, analytics: false, preferences: false })}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-600"
          >
            Reject non-essential
          </button>
          {showPreferences ? (
            <button
              type="button"
              onClick={() => save({ essential: true, analytics, preferences })}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-600"
            >
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-600"
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  return (
    <ThemeProvider>
      <DensityProvider>
        <WalletProvider>
          <ToastProvider>
            {children}
            <CookieConsent />
          </ToastProvider>
        </WalletProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
