"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  error?: Error;
  reset?: () => void;
  message?: string;
}

export default function ErrorFallback({
  error,
  reset,
  message = "Something went wrong.",
}: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[#1C1C1E] rounded-2xl"
    >
      <div className="w-14 h-14 rounded-full bg-[#F8717115] flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-[#F87171]" aria-hidden="true" />
      </div>
      <p className="text-white font-semibold text-base mb-1">{message}</p>
      {error?.message && (
        <p className="text-[#9A9A9A] text-xs mb-6 max-w-sm">{error.message}</p>
      )}
      {reset && (
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
