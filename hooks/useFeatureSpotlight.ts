"use client";

import { useState, useEffect, useCallback } from "react";
import { SHIPPED_FEATURES } from "@/config/features";

const STORAGE_KEY = "ahjoor_dismissed_features";

export function useFeatureSpotlight(featureId: string) {
  // Default to true during SSR to prevent hydration mismatch flashes
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setIsDismissed(dismissed.includes(featureId));
    } catch {
      setIsDismissed(false); // Default show if parse error
    }
  }, [featureId]);

  const dismiss = useCallback(() => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!dismissed.includes(featureId)) {
        dismissed.push(featureId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
      }
    } catch {
      // ignore
    }
    setIsDismissed(true);
  }, [featureId]);

  const feature = SHIPPED_FEATURES.find((f) => f.id === featureId);
  const showSpotlight = Boolean(feature && feature.active && !isDismissed);

  return { showSpotlight, feature, dismiss };
}
