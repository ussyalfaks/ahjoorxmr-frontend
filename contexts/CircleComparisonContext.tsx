"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const MAX_COMPARE_LIMIT = 3;

interface CircleComparisonContextValue {
  selectedCircleIds: string[];
  isComparisonOpen: boolean;
  toggleCircle: (circleId: string) => boolean;
  removeCircle: (circleId: string) => void;
  clearSelection: () => void;
  openComparison: () => void;
  closeComparison: () => void;
  isSelected: (circleId: string) => boolean;
  isMaxSelected: boolean;
  maxLimit: number;
}

const CircleComparisonContext = createContext<CircleComparisonContextValue | undefined>(
  undefined
);

export function CircleComparisonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const isSelected = useCallback(
    (circleId: string) => selectedCircleIds.includes(circleId),
    [selectedCircleIds]
  );

  const isMaxSelected = selectedCircleIds.length >= MAX_COMPARE_LIMIT;

  const toggleCircle = useCallback(
    (circleId: string): boolean => {
      let updated = false;
      setSelectedCircleIds((prev) => {
        if (prev.includes(circleId)) {
          updated = true;
          return prev.filter((id) => id !== circleId);
        }
        if (prev.length >= MAX_COMPARE_LIMIT) {
          // Cannot add more than MAX_COMPARE_LIMIT
          return prev;
        }
        updated = true;
        return [...prev, circleId];
      });
      return updated;
    },
    []
  );

  const removeCircle = useCallback((circleId: string) => {
    setSelectedCircleIds((prev) => prev.filter((id) => id !== circleId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCircleIds([]);
    setIsComparisonOpen(false);
  }, []);

  const openComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      selectedCircleIds,
      isComparisonOpen,
      toggleCircle,
      removeCircle,
      clearSelection,
      openComparison,
      closeComparison,
      isSelected,
      isMaxSelected,
      maxLimit: MAX_COMPARE_LIMIT,
    }),
    [
      selectedCircleIds,
      isComparisonOpen,
      toggleCircle,
      removeCircle,
      clearSelection,
      openComparison,
      closeComparison,
      isSelected,
      isMaxSelected,
    ]
  );

  return (
    <CircleComparisonContext.Provider value={value}>
      {children}
    </CircleComparisonContext.Provider>
  );
}

export function useCircleComparison(): CircleComparisonContextValue {
  const context = useContext(CircleComparisonContext);
  if (!context) {
    throw new Error(
      "useCircleComparison must be used within a CircleComparisonProvider"
    );
  }
  return context;
}
