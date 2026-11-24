"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { safeStorage } from "@/lib/safeStorage";

export type Language = "en" | "ar" | "fr" | "es";
export type Direction = "ltr" | "rtl";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  dir: Direction;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
];

export const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"]);

export function isRtlLanguage(lang: string): boolean {
  return RTL_LANGUAGES.has(lang.toLowerCase());
}

export function getLanguageDirection(lang: string): Direction {
  return isRtlLanguage(lang) ? "rtl" : "ltr";
}

interface LanguageContextValue {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LANGUAGE_STORAGE_KEY = "ahjoor-language";
export const LANGUAGE_EVENT = "ahjoor-language-changed";

export function applyLanguageAndDirection(lang: Language) {
  if (typeof document === "undefined") return;
  const dir = getLanguageDirection(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
  document.documentElement.dataset.direction = dir;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [direction, setDirectionState] = useState<Direction>("ltr");

  useEffect(() => {
    const stored = safeStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    const initialLang: Language =
      stored && LANGUAGES.some((l) => l.code === stored) ? stored : "en";
    setLanguageState(initialLang);
    const dir = getLanguageDirection(initialLang);
    setDirectionState(dir);
    applyLanguageAndDirection(initialLang);
  }, []);

  const setLanguage = useCallback((nextLang: Language) => {
    setLanguageState(nextLang);
    const dir = getLanguageDirection(nextLang);
    setDirectionState(dir);
    safeStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    applyLanguageAndDirection(nextLang);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: nextLang }));
    }
  }, []);

  const isRtl = direction === "rtl";

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl,
        setLanguage,
        availableLanguages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
