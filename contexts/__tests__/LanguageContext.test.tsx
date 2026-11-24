// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  isRtlLanguage,
  getLanguageDirection,
  LANGUAGES,
  applyLanguageAndDirection,
} from "../LanguageContext";

describe("Language & RTL Support", () => {
  it("identifies RTL languages correctly", () => {
    expect(isRtlLanguage("ar")).toBe(true);
    expect(isRtlLanguage("AR")).toBe(true);
    expect(isRtlLanguage("he")).toBe(true);
    expect(isRtlLanguage("fa")).toBe(true);
    expect(isRtlLanguage("ur")).toBe(true);
  });

  it("identifies LTR languages correctly", () => {
    expect(isRtlLanguage("en")).toBe(false);
    expect(isRtlLanguage("fr")).toBe(false);
    expect(isRtlLanguage("es")).toBe(false);
  });

  it("returns correct direction for languages", () => {
    expect(getLanguageDirection("ar")).toBe("rtl");
    expect(getLanguageDirection("en")).toBe("ltr");
    expect(getLanguageDirection("fr")).toBe("ltr");
    expect(getLanguageDirection("es")).toBe("ltr");
  });

  it("includes Arabic as an RTL option in available languages", () => {
    const arabic = LANGUAGES.find((l) => l.code === "ar");
    expect(arabic).toBeDefined();
    expect(arabic?.dir).toBe("rtl");
    expect(arabic?.nativeName).toBe("العربية");
  });
});
