"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import SavingsCalculator from "@/components/calculator/SavingsCalculator";
import { CIRCLE_CATEGORIES, CATEGORY_LABELS, type CircleCategory } from "@/lib/circles";
import type { PenaltyConfig } from "@/types/circle";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate?: (circle: CreateCircleData) => void;
}

export interface CreateCircleData {
  name: string;
  description: string;
  contribution: string;
  maxMembers: string;
  roundDuration: string;
  category: CircleCategory;
  isPrivate: boolean;
  penaltyEnabled: boolean;
  penaltyType: "percentage" | "fixed";
  penaltyValue: string;
}

interface CircleTemplate {
  id: string;
  name: string;
  frequency: string;
  amount: number;
  maxMembers: number;
  roundDuration: number;
  description: string;
}

const CIRCLE_TEMPLATES: CircleTemplate[] = [
  {
    id: "weekly-starter",
    name: "Weekly Starter",
    frequency: "Weekly",
    amount: 5000,
    maxMembers: 5,
    roundDuration: 7,
    description: "Best for close friends or family contributing small amounts every week.",
  },
  {
    id: "monthly-builder",
    name: "Monthly Builder",
    frequency: "Monthly",
    amount: 50000,
    maxMembers: 6,
    roundDuration: 30,
    description: "Great for salary earners pooling a larger sum once a month.",
  },
  {
    id: "biweekly-boost",
    name: "Biweekly Boost",
    frequency: "Bi-weekly",
    amount: 20000,
    maxMembers: 8,
    roundDuration: 14,
    description: "Fits groups that want faster payouts without waiting a full month.",
  },
];

const EMPTY: CreateCircleData = {
  name: "",
  description: "",
  contribution: "",
  maxMembers: "",
  roundDuration: "",
  category: "family",
  isPrivate: false,
  penaltyEnabled: false,
  penaltyType: "percentage",
  penaltyValue: "",
};

const TOTAL_STEPS = 4;

export default function CreateCircleModal({ open, onClose, onCreate }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateCircleData>(EMPTY);
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

  function selectTemplate(template: CircleTemplate) {
    setForm((f) => ({
      ...f,
      contribution: String(template.amount),
      maxMembers: String(template.maxMembers),
      roundDuration: String(template.roundDuration),
    }));
    setStep(1);
  }

  function selectCustom() {
    setStep(1);
  }

  const set = (key: keyof CreateCircleData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const step1Valid = form.name.trim().length > 0;
  const contributionAmount = Number(form.contribution);
  const penaltyAmount = Number(form.penaltyValue);
  const penaltyIsValid =
    !form.penaltyEnabled ||
    (form.penaltyValue.trim().length > 0 &&
      Number.isFinite(penaltyAmount) &&
      penaltyAmount > 0 &&
      (form.penaltyType === "percentage" ? penaltyAmount <= 100 : penaltyAmount <= contributionAmount));
  const step2Valid =
    form.contribution.trim().length > 0 &&
    Number(form.contribution) > 0 &&
    form.maxMembers.trim().length > 0 &&
    Number(form.maxMembers) >= 2 &&
    form.roundDuration.trim().length > 0 &&
    Number(form.roundDuration) >= 1 &&
    (!form.penaltyEnabled || penaltyIsValid);

  function formatPenalty() {
    if (!form.penaltyEnabled) return "No late contribution penalty";
    return form.penaltyType === "percentage"
      ? `${form.penaltyValue}% of the contribution`
      : `${form.penaltyValue} USDT fixed fee`;
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    onCreate?.(form);
    setSubmitting(false);
    setSuccess(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={ref}
        className="bg-[var(--modal)] rounded-2xl w-full max-w-md p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-circle-title"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={36} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 id="create-circle-title" className="text-2xl font-bold font-sora text-[var(--text)]">
              Circle Created!
            </h2>
            <p className="text-[var(--muted)] text-sm">
              <span className="text-[var(--text)] font-medium">{form.name}</span> has been created.
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
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-[#4B6B76]" : "bg-[var(--ov-1a)]"}`}
                />
              ))}
            </div>

            {/* Step 0: Template selection */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
                    Choose a Template
                  </h2>
                  <p className="text-[var(--muted)] text-sm mt-1">
                    Start from a preset or configure everything yourself.
                  </p>
                </div>
                <div className="space-y-3">
                  {CIRCLE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left bg-[var(--ov-0a)] border border-[var(--ov-14)] hover:border-[#4B6B76] rounded-xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold font-sora text-[var(--text)] text-sm">
                          {template.name}
                        </span>
                        <span className="text-xs font-medium text-[var(--muted)]">
                          {template.frequency}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text)] font-medium mt-1">
                        ₦{template.amount.toLocaleString()} · {template.maxMembers} members
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">{template.description}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={selectCustom}
                    className="w-full text-left bg-[var(--ov-0a)] border border-dashed border-[var(--ov-14)] hover:border-[#4B6B76] rounded-xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] flex items-center gap-3"
                  >
                    <Sparkles size={18} className="text-[var(--muted)]" aria-hidden="true" />
                    <span>
                      <span className="font-semibold font-sora text-[var(--text)] text-sm block">
                        Custom
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        Configure amount, members, and duration manually.
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Name & description */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
                    Create a Circle
                  </h2>
                  <p className="text-[var(--muted)] text-sm mt-1">Give your savings circle a name.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="circle-name">
                      Circle Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="circle-name"
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Family Savings"
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="circle-desc">
                      Description
                    </label>
                    <textarea
                      id="circle-desc"
                      value={form.description}
                      onChange={set("description")}
                      placeholder="Optional — what's this circle for?"
                      rows={3}
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="circle-category">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="circle-category"
                      value={form.category}
                      onChange={(e) => setForm((current) => ({ ...current, category: e.target.value as CircleCategory }))}
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    >
                      {CIRCLE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
                    Circle Settings
                  </h2>
                  <p className="text-[var(--muted)] text-sm mt-1">Configure contribution details.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="contribution">
                      Contribution Amount (USDT) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contribution"
                      type="number"
                      min="1"
                      value={form.contribution}
                      onChange={set("contribution")}
                      placeholder="e.g. 50"
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="max-members">
                      Max Members <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="max-members"
                      type="number"
                      min="2"
                      value={form.maxMembers}
                      onChange={set("maxMembers")}
                      placeholder="e.g. 5 (minimum 2)"
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)] mb-1.5 block" htmlFor="duration">
                      Round Duration (days) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      value={form.roundDuration}
                      onChange={set("roundDuration")}
                      placeholder="e.g. 7"
                      className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-4 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer border-t border-[var(--ov-14)] pt-4" htmlFor="circle-private">
                    <input
                      id="circle-private"
                      type="checkbox"
                      checked={form.isPrivate}
                      onChange={(e) => setForm((current) => ({ ...current, isPrivate: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--ov-14)] text-[#4B6B76] focus:ring-[#4B6B76]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[var(--text)]">Private circle</span>
                      <span className="block text-xs text-[var(--muted)] mt-0.5">Only invited participants can request to join.</span>
                    </span>
                  </label>
                  <div className="border-t border-[var(--ov-14)] pt-4">
                    <label className="flex items-start gap-3 cursor-pointer" htmlFor="penalty-enabled">
                      <input
                        id="penalty-enabled"
                        type="checkbox"
                        checked={form.penaltyEnabled}
                        onChange={(e) => setForm((current) => ({ ...current, penaltyEnabled: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 rounded border-[var(--ov-14)] text-[#4B6B76] focus:ring-[#4B6B76]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-[var(--text)]">Late contribution penalty</span>
                        <span className="block text-xs text-[var(--muted)] mt-0.5">Apply a fee when a contribution misses its deadline.</span>
                      </span>
                    </label>
                    {form.penaltyEnabled && (
                      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1.5 block" htmlFor="penalty-type">Penalty type</label>
                          <select
                            id="penalty-type"
                            value={form.penaltyType}
                            onChange={(e) => setForm((current) => ({ ...current, penaltyType: e.target.value as PenaltyConfig["type"] }))}
                            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-3 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1.5 block" htmlFor="penalty-value">
                            {form.penaltyType === "percentage" ? "Percentage" : "Amount (USDT)"}
                          </label>
                          <input
                            id="penalty-value"
                            type="number"
                            min="0.01"
                            max={form.penaltyType === "percentage" ? "100" : contributionAmount || undefined}
                            step="0.01"
                            value={form.penaltyValue}
                            onChange={set("penaltyValue")}
                            placeholder={form.penaltyType === "percentage" ? "e.g. 5" : "e.g. 2"}
                            className="w-full bg-[var(--ov-0a)] border border-[var(--ov-14)] rounded-xl px-3 py-3 text-[var(--text)] text-sm placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
                          />
                        </div>
                      </div>
                    )}
                    {form.penaltyEnabled && !penaltyIsValid && (
                      <p className="mt-2 text-xs text-red-400">Enter a positive penalty up to 100%, or no more than the contribution amount.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 id="create-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
                    Review & Confirm
                  </h2>
                  <p className="text-[var(--muted)] text-sm mt-1">Check your circle details before creating.</p>
                </div>
                <div className="bg-[var(--ov-0a)] rounded-xl p-5 space-y-3">
                  {[
                    { label: "Name", value: form.name },
                    { label: "Description", value: form.description || "—" },
                    { label: "Contribution", value: `${form.contribution} USDT` },
                    { label: "Max Members", value: form.maxMembers },
                    { label: "Round Duration", value: `${form.roundDuration} days` },
                    { label: "Visibility", value: form.isPrivate ? "Private (request to join)" : "Public (direct join)" },
                    { label: "Late penalty", value: formatPenalty() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-[var(--muted)]">{label}</span>
                      <span className="text-[var(--text)] font-medium max-w-[60%] text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Simulation Preview</h3>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar -mx-2 px-2">
                    <SavingsCalculator 
                      isReadOnly={true}
                      amount={Number(form.contribution) || 0}
                      participants={Number(form.maxMembers) || 0}
                      frequencyDays={Number(form.roundDuration) || 0}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded px-2 py-1"
                >
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded px-2 py-1"
                >
                  Cancel
                </button>
              )}

              {step === 0 ? null : step < TOTAL_STEPS - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
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
