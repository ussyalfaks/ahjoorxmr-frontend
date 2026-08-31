"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type FontSize = "sm" | "md" | "lg" | "xl";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "ahjoor-theme";
export const FONT_SIZE_STORAGE_KEY = "ahjoor-font-size";
export const HIGH_CONTRAST_STORAGE_KEY = "ahjoor-high-contrast";

const FONT_SIZE_SCALE: Record<FontSize, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
};

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

function applyFontSize(size: FontSize) {
  document.documentElement.style.setProperty("--base-font-size", FONT_SIZE_SCALE[size]);
  document.documentElement.dataset.fontSize = size;
}

function applyHighContrast(enabled: boolean, resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("high-contrast", enabled);
  if (enabled) {
    document.documentElement.style.setProperty("--text", resolved === "dark" ? "#ffffff" : "#000000");
    document.documentElement.style.setProperty("--muted", resolved === "dark" ? "#e5e5e5" : "#333333");
  } else {
    // Reset to defaults - will be handled by CSS
    document.documentElement.style.removeProperty("--text");
    document.documentElement.style.removeProperty("--muted");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [fontSize, setFontSizeState] = useState<FontSize>("md");
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const storedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSize | null;
    const storedHighContrast = localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY);

    const initialTheme: Theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
    const resolved = initialTheme === "system" ? getSystemTheme() : initialTheme;

    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);

    if (storedFontSize && FONT_SIZE_SCALE[storedFontSize]) {
      setFontSizeState(storedFontSize);
      applyFontSize(storedFontSize);
    }

    const hc = storedHighContrast === "true";
    setHighContrastState(hc);
    applyHighContrast(hc, resolved);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
      applyHighContrast(highContrast, resolved);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme, highContrast]);

  const setTheme = useCallback((next: Theme) => {
    const resolved = next === "system" ? getSystemTheme() : next;
    setThemeState(next);
    setResolvedTheme(resolved);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyResolvedTheme(resolved);
    applyHighContrast(highContrast, resolved);
  }, [highContrast]);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    applyFontSize(size);
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(enabled));
    applyHighContrast(enabled, resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
