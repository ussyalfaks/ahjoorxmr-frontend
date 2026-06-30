"use client";

import { useState, useEffect, useRef } from "react";
import { X, Users, Coins, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const STORAGE_KEY = "onboarding_complete";

const HOW_IT_WORKS = [
  { Icon: Users, label: "Create or Join", desc: "Start a savings circle or join an existing one with people you trust." },
  { Icon: Coins, label: "Contribute", desc: "Each member contributes the agreed amount every round." },
  { Icon: Gift, label: "Receive Payout", desc: "Members take turns receiving the full pool payout." },
];

const TOTAL_STEPS = 3;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useFocusTrap(ref, open, dismiss);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={ref}
        className="bg-[#1C1C1E] rounded-2xl w-full max-w-md p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Skip onboarding"
        >
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-[#4B6B76]" : "w-2 bg-[#ffffff1a]"}`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#4B6B76]/20 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <span className="text-3xl font-bold text-[#4B6B76]">$</span>
            </div>
            <h2 id="onboarding-title" className="text-2xl font-bold font-sora text-white">
              Welcome to Ahjoor
            </h2>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Ahjoor is a{" "}
              <span className="text-white font-medium">trustless community savings</span>{" "}
              platform. Pool funds with people you trust, take turns receiving payouts — all secured by smart contracts.
            </p>
          </div>
        )}

        {/* Step 1: How it works */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 id="onboarding-title" className="text-2xl font-bold font-sora text-white text-center">
              How It Works
            </h2>
            <div className="space-y-3">
              {HOW_IT_WORKS.map(({ Icon, label, desc }, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#ffffff0a] rounded-xl p-4">
                  <div className="w-9 h-9 rounded-full bg-[#4B6B76]/20 flex items-center justify-center shrink-0" aria-hidden="true">
                    <Icon size={18} className="text-[#4B6B76]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{label}</p>
                    <p className="text-[#A1A1AA] text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose path */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 id="onboarding-title" className="text-2xl font-bold font-sora text-white">
              How would you like to start?
            </h2>
            <p className="text-[#A1A1AA] text-sm">Choose your path to begin your savings journey.</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/circles"
                onClick={dismiss}
                className="w-full py-3 bg-[#4B6B76] hover:bg-[#3D5A64] text-white font-medium rounded-xl transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1E]"
              >
                Create a Circle
              </Link>
              <Link
                href="/dashboard/circles?tab=discover"
                onClick={dismiss}
                className="w-full py-3 bg-[#ffffff0a] hover:bg-[#ffffff14] text-white font-medium rounded-xl transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1E]"
              >
                Browse Circles
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={dismiss}
            className="text-sm text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded px-2 py-1"
          >
            Skip
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1E]"
            >
              Next <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
