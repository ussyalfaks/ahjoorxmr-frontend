"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  description: string;
  contribution: string;
  maxMembers: string;
  roundDuration: string;
}

const EMPTY: FormData = {
  name: "",
  description: "",
  contribution: "",
  maxMembers: "",
  roundDuration: "",
};

const TOTAL_STEPS = 3;

export default function CreateCircleModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useFocusTrap(ref, open, handleClose);

  function handleClose() {
    setStep(0);
    setForm(EMPTY);
    setSuccess(false);
    onClose();
  }

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const step0Valid = form.name.trim().length > 0;
  const step1Valid =
    form.contribution.trim().length > 0 &&
    Number(form.contribution) > 0 &&
    form.maxMembers.trim().length > 0 &&
    Number(form.maxMembers) >= 2 &&
    form.roundDuration.trim().length > 0 &&
    Number(form.roundDuration) >= 1;

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={ref}
        className="bg-[#1C1C1E] rounded-2xl w-full max-w-md p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-circle-title"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
            <h2 id="create-circle-title" className="text-2xl font-bold font-sora text-white">
              Circle Created!
            </h2>
            <p className="text-[#A1A1AA] text-sm">
              <span className="text-white font-medium">{form.name}</span> has been created.
              Invite members to start saving together.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#4B6B76] hover:bg-[#3D5A64] text-white font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[#4B6B76]" : "bg-[#ffffff1a]"}`}
                />
              ))}
            </div>

            {/* Step 0: Name & description */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-white">
                    Create a Circle
                  </h2>
                  <p className="text-[#A1A1AA] text-sm mt-1">Give your savings circle a name.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#A1A1AA] mb-1.5 block" htmlFor="circle-name">
                      Circle Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="circle-name"
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Family Savings"
                      className="w-full bg-[#ffffff0a] border border-[#ffffff14] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#A1A1AA] mb-1.5 block" htmlFor="circle-desc">
                      Description
                    </label>
                    <textarea
                      id="circle-desc"
                      value={form.description}
                      onChange={set("description")}
                      placeholder="Optional — what's this circle for?"
                      rows={3}
                      className="w-full bg-[#ffffff0a] border border-[#ffffff14] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Settings */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-white">
                    Circle Settings
                  </h2>
                  <p className="text-[#A1A1AA] text-sm mt-1">Configure contribution details.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#A1A1AA] mb-1.5 block" htmlFor="contribution">
                      Contribution Amount (USDT) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contribution"
                      type="number"
                      min="1"
                      value={form.contribution}
                      onChange={set("contribution")}
                      placeholder="e.g. 50"
                      className="w-full bg-[#ffffff0a] border border-[#ffffff14] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#A1A1AA] mb-1.5 block" htmlFor="max-members">
                      Max Members <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="max-members"
                      type="number"
                      min="2"
                      value={form.maxMembers}
                      onChange={set("maxMembers")}
                      placeholder="e.g. 5 (minimum 2)"
                      className="w-full bg-[#ffffff0a] border border-[#ffffff14] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#A1A1AA] mb-1.5 block" htmlFor="duration">
                      Round Duration (days) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      value={form.roundDuration}
                      onChange={set("roundDuration")}
                      placeholder="e.g. 7"
                      className="w-full bg-[#ffffff0a] border border-[#ffffff14] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-white">
                    Review & Confirm
                  </h2>
                  <p className="text-[#A1A1AA] text-sm mt-1">Check your circle details before creating.</p>
                </div>
                <div className="bg-[#ffffff0a] rounded-xl p-5 space-y-3">
                  {[
                    { label: "Name", value: form.name },
                    { label: "Description", value: form.description || "—" },
                    { label: "Contribution", value: `${form.contribution} USDT` },
                    { label: "Max Members", value: form.maxMembers },
                    { label: "Round Duration", value: `${form.roundDuration} days` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">{label}</span>
                      <span className="text-white font-medium max-w-[60%] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 text-sm text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded px-2 py-1"
                >
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-sm text-[#9A9A9A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded px-2 py-1"
                >
                  Cancel
                </button>
              )}

              {step < TOTAL_STEPS - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 ? !step0Valid : !step1Valid}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  Next <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  {submitting ? "Creating…" : "Create Circle"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
