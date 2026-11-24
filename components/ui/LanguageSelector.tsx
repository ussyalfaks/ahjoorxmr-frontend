"use client";

import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  variant?: "select" | "buttons";
  className?: string;
}

export default function LanguageSelector({
  variant = "buttons",
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages } = useLanguage();

  if (variant === "select") {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <Globe
          size={16}
          className="absolute start-3 text-[var(--muted)] pointer-events-none"
          aria-hidden="true"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          aria-label="Select language"
          className="ps-9 pe-8 py-1.5 text-xs font-medium rounded-lg border border-[var(--ov-14)] bg-[var(--content)] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] cursor-pointer"
        >
          {availableLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableLanguages.map((l) => {
        const isSelected = language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={isSelected}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSelected
                ? "bg-[#4B6B76] text-white border-[#4B6B76] shadow-sm"
                : "border-[var(--ov-10)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-05)]"
            }`}
          >
            <span>{l.nativeName}</span>
            <span className="ms-1.5 opacity-70 text-[10px]">({l.dir.toUpperCase()})</span>
          </button>
        );
      })}
    </div>
  );
}
