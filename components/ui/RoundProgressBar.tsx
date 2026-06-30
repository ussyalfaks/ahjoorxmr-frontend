"use client";

import { useState } from "react";

interface Props {
  current: number;
  total: number;
}

export default function RoundProgressBar({ current, total }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null);
  const fillPercent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="w-full">
      {/* Round markers */}
      <div className="flex justify-between mb-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const roundNum = i + 1;
          const isDone = roundNum <= current;
          return (
            <div
              key={roundNum}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setTooltip(roundNum)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isDone ? "bg-[#4B6B76]" : "bg-[#ffffff1a]"
                }`}
              />
              {tooltip === roundNum && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs text-white bg-[#2a2a2e] border border-[#ffffff14] pointer-events-none z-10">
                  Round {roundNum} of {total}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bar track */}
      <div
        className="w-full h-1.5 rounded-full bg-[#ffffff1a] overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Round ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-[#4B6B76] transition-all duration-500"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
