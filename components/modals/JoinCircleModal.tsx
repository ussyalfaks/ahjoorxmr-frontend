"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { CircleJoinRequest, PenaltyConfig } from "@/types/circle";
import CircleRulesView from "@/components/circles/CircleRulesView";
import { CIRCLE_RULES_UPDATED_EVENT, getCircleRules, type CircleRulesRecord } from "@/lib/circleRules";
import { JOIN_REQUESTS_UPDATED_EVENT } from "@/lib/joinRequests";
import WaitlistPositionCard from "@/components/circles/WaitlistPositionCard";

const REQUESTS_KEY = "ahjoorxmr:circle-join-requests";

export interface JoinCircleData {
  id: string;
  name: string;
  contribution: string;
  duration: string;
  members: string[];
  totalSlots: number;
  penalty?: PenaltyConfig;
  isPrivate?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  circle: JoinCircleData | null;
  currentWallet: string;
  onRequestSubmitted?: (request: CircleJoinRequest) => void;
}

export default function JoinCircleModal({ open, onClose, circle, currentWallet, onRequestSubmitted }: Props) {
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [requestStatus, setRequestStatus] = useState<CircleJoinRequest["status"] | null>(null);
  const [rules, setRules] = useState<CircleRulesRecord | null>(null);
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useFocusTrap(ref, open, handleClose);

  useEffect(() => {
  if (!open || !circle?.isPrivate) return;
  const circleId = circle.id;
  function refreshStatus() {
    const requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]") as CircleJoinRequest[];
    const existing = requests.find((request) => request.circleId === circleId && request.requester === currentWallet);
    setRequestStatus(existing?.status ?? null);
  }
  refreshStatus();
  window.addEventListener("storage", refreshStatus);
  window.addEventListener(JOIN_REQUESTS_UPDATED_EVENT, refreshStatus);
  return () => {
    window.removeEventListener("storage", refreshStatus);
    window.removeEventListener(JOIN_REQUESTS_UPDATED_EVENT, refreshStatus);
  };
}, [circle, currentWallet, open]);

  useEffect(() => {
    if (!open || !circle) return;
    const refreshRules = () => setRules(getCircleRules(circle.id));
    refreshRules();
    window.addEventListener(CIRCLE_RULES_UPDATED_EVENT, refreshRules);
    return () => window.removeEventListener(CIRCLE_RULES_UPDATED_EVENT, refreshRules);
  }, [circle, open]);

  function handleClose() {
    setSuccess(false);
    setRulesAcknowledged(false);
    onClose();
  }

  async function handleJoin() {
    setJoining(true);
    await new Promise((r) => setTimeout(r, 1200));
    setJoining(false);
    setSuccess(true);
  }

  function handleRequest() {
    if (!circle) return;
    const now = new Date().toISOString();
    const request: CircleJoinRequest = {
      id: `${circle.id}-${currentWallet}-${Date.now()}`,
      circleId: circle.id,
      circleName: circle.name,
      requester: currentWallet,
      note: requestNote.trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) ?? "[]") as CircleJoinRequest[];
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([
      ...requests.filter((item) => !(item.circleId === circle.id && item.requester === currentWallet)),
      request,
    ]));
    window.dispatchEvent(new CustomEvent(JOIN_REQUESTS_UPDATED_EVENT, { detail: { circleId: circle.id } }));
setRequestStatus("pending");;
    onRequestSubmitted?.(request);
  }

  if (!open || !circle) return null;

  const isMember = circle.members.includes(currentWallet);
  const isFull = circle.members.length >= circle.totalSlots;
  const isPrivate = circle.isPrivate === true;
  const requiresRulesAcknowledgement = rules !== null;
  const penaltySummary = circle.penalty?.enabled
    ? circle.penalty.type === "percentage"
      ? `${circle.penalty.value}% of the contribution when late`
      : `${circle.penalty.value} USDT when late`
    : "No late contribution penalty";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={ref}
        className="bg-[var(--modal)] rounded-2xl w-full max-w-sm p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-circle-title"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {isMember ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#4B6B76]/20 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={28} className="text-[#4B6B76]" />
            </div>
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
              Already a Member
            </h2>
            <p className="text-[var(--muted)] text-sm">
              You&apos;re already in{" "}
              <span className="text-[var(--text)] font-medium">{circle.name}</span>.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Close
            </button>
          </div>
        ) : success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
              You&apos;re In!
            </h2>
            <p className="text-[var(--muted)] text-sm">
              You&apos;ve successfully joined{" "}
              <span className="text-[var(--text)] font-medium">{circle.name}</span>.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] text-white font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
            >
              Done
            </button>
          </div>
        ) : isPrivate && requestStatus ? (
          <div className="space-y-4 py-4">
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
              Join request {requestStatus}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {requestStatus === "pending" ? "The organizer will review your request." : requestStatus === "approved" ? "Your request was approved. You can now join this circle." : "The organizer declined your request."}
            </p>
            {requestStatus === "pending" && (
  <WaitlistPositionCard circleId={circle.id} currentWallet={currentWallet} />
)}
            <button onClick={handleClose} className="w-full py-2.5 bg-[var(--ov-0a)] text-[var(--text)] font-medium rounded-xl">Close</button>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 id="join-circle-title" className="text-xl font-bold font-sora text-[var(--text)]">
              Join {circle.name}
            </h2>
            <div className="bg-[var(--ov-0a)] rounded-xl p-4 space-y-3">
              {[
                { label: "Contribution", value: circle.contribution },
                { label: "Duration", value: circle.duration },
                { label: "Slots", value: `${circle.members.length} / ${circle.totalSlots}` },
                { label: "Late penalty", value: penaltySummary },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="text-[var(--text)] font-medium">{value}</span>
                </div>
              ))}
            </div>
            {isFull ? (
              <p className="text-red-400 text-sm text-center">This circle is full.</p>
            ) : (
              <>
                <p className="text-[var(--muted)] text-xs">By joining, you agree to contribute {circle.contribution} each round and accept the listed late contribution terms.</p>
                {rules ? (
                  <div className="rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">Circle rules</p>
                        <Link href={`/dashboard/circles/${circle.id}`} className="text-xs font-medium text-[#4B6B76] hover:underline">View full rules</Link>
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">Updated {new Date(rules.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto"><CircleRulesView rules={rules} /></div>
                    <label className="mt-4 flex items-start gap-2 text-xs text-[var(--text)]">
                      <input type="checkbox" checked={rulesAcknowledged} onChange={(event) => setRulesAcknowledged(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[var(--ov-14)] text-[#4B6B76] focus:ring-[#4B6B76]" />
                      <span>I have read and agree to follow these circle rules.</span>
                    </label>
                  </div>
                ) : <p className="text-xs text-[var(--muted)]">This circle has no published rules yet.</p>}
              </>
            )}
            {isPrivate && (
              <textarea
                value={requestNote}
                onChange={(event) => setRequestNote(event.target.value)}
                placeholder="Optional note to the organizer"
                rows={3}
                className="w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-0a)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-[var(--ov-0a)] hover:bg-[var(--ov-14)] text-[var(--text)] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Cancel
              </button>
              <button
                onClick={isPrivate ? handleRequest : handleJoin}
                disabled={joining || isFull || (requiresRulesAcknowledgement && !rulesAcknowledged)}
                className="flex-1 py-2.5 bg-[#4B6B76] hover:bg-[#3D5A64] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                {joining ? "Joining…" : isPrivate ? "Request to Join" : "Confirm Join"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
