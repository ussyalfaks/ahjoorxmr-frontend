"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#F8717115] flex items-center justify-center mb-6">
        <AlertTriangle size={32} className="text-[#F87171]" aria-hidden="true" />
      </div>
      <h2 className="text-white text-xl font-bold font-sora mb-2">
        Something went wrong
      </h2>
      <p className="text-[#9A9A9A] text-sm mb-8 max-w-sm">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
      >
        Try again
      </button>
    </div>
  );
}
