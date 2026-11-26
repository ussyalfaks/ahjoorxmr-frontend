"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarClock, Lock, Plus, X } from "lucide-react";
import type { CirclePoll } from "@/types/discussion";
import {
  CIRCLE_POLLS_UPDATED_EVENT,
  castCirclePollVote,
  closeCirclePoll,
  createCirclePoll,
  getCirclePolls,
  isCirclePollClosed,
} from "@/lib/circlePolls";

interface CirclePollsProps {
  circleId: string;
  currentAddress: string;
  canCreate: boolean;
}

export default function CirclePolls({
  circleId,
  currentAddress,
  canCreate,
}: CirclePollsProps) {
  const [polls, setPolls] = useState<CirclePoll[]>(() => getCirclePolls(circleId));
  const [composerOpen, setComposerOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [closeAt, setCloseAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ circleId?: string }>).detail;
      if (!detail?.circleId || detail.circleId === circleId) {
        setPolls(getCirclePolls(circleId));
      }
    };
    window.addEventListener(CIRCLE_POLLS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CIRCLE_POLLS_UPDATED_EVENT, refresh);
  }, [circleId]);

  const now = useMemo(() => Date.now(), [polls]);

  function resetComposer() {
    setQuestion("");
    setOptions(["", ""]);
    setCloseAt("");
    setError(null);
  }

  function addOption() {
    if (options.length < 6) setOptions((current) => [...current, ""]);
  }

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((option, i) => i === index ? value : option));
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, i) => i !== index));
  }

  async function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (closeAt && new Date(closeAt).getTime() <= Date.now()) {
        throw new Error("Close date must be in the future.");
      }
      createCirclePoll(
        circleId,
        question,
        options,
        currentAddress,
        closeAt ? new Date(closeAt).toISOString() : undefined
      );
      setPolls(getCirclePolls(circleId));
      resetComposer();
      setComposerOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create poll.");
    }
  }

  function vote(pollId: string, optionId: string) {
    setPolls(castCirclePollVote(circleId, pollId, optionId, currentAddress));
  }

  function closePoll(pollId: string) {
    setPolls(closeCirclePoll(circleId, pollId));
  }

  return (
    <section aria-labelledby="circle-polls-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="circle-polls-heading" className="text-lg font-bold font-sora text-[var(--text)]">Polls</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Ask the circle a question and vote once.</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4B6B76] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3D5A64]"
          >
            <Plus size={14} aria-hidden="true" />
            Create poll
          </button>
        )}
      </div>

      {composerOpen && (
        <form onSubmit={submitCreate} className="rounded-2xl border border-[var(--ov-14)] bg-[var(--content)] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text)]">New poll</h3>
            <button type="button" onClick={() => { resetComposer(); setComposerOpen(false); }} aria-label="Close poll composer" className="text-[var(--muted)]">
              <X size={16} />
            </button>
          </div>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Question
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={160}
              required
              className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2 text-sm text-[var(--text)]"
              placeholder="What should we decide?"
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-medium text-[var(--muted)]">Options ({options.length}/6)</legend>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  maxLength={80}
                  required
                  className="min-w-0 flex-1 rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2 text-sm text-[var(--text)]"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} aria-label={`Remove option ${index + 1}`} className="rounded-lg px-2 text-[var(--muted)] hover:text-[#FF5B5B]">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button type="button" onClick={addOption} className="text-xs font-medium text-[#4B6B76] hover:underline">+ Add option</button>
            )}
          </fieldset>
          <label className="block text-xs font-medium text-[var(--muted)]">
            Close date <span className="font-normal">(optional)</span>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={(event) => setCloseAt(event.target.value)}
              className="mt-1.5 block rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2 text-sm text-[var(--text)]"
            />
          </label>
          {error && <p role="alert" className="text-xs text-[#FF5B5B]">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="rounded-lg bg-[#4B6B76] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D5A64]">Create poll</button>
          </div>
        </form>
      )}

      {polls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ov-14)] px-5 py-8 text-center">
          <BarChart3 size={22} className="mx-auto mb-2 text-[var(--faint)]" />
          <p className="text-sm text-[var(--muted)]">No polls yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => {
            const closed = isCirclePollClosed(poll, new Date(now));
            const totalVotes = poll.options.reduce((sum, option) => sum + option.voterAddresses.length, 0);
            const selectedOptionId = poll.options.find((option) =>
              option.voterAddresses.some((address) => address.toLowerCase() === currentAddress.toLowerCase())
            )?.id;

            return (
              <article key={poll.id} className="rounded-2xl border border-[var(--ov-0f)] bg-[var(--content)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">{poll.question}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                      {closed ? <Lock size={11} /> : <CalendarClock size={11} />}
                      {closed
                        ? "Closed - final results"
                        : poll.closeAt
                          ? `Closes ${new Date(poll.closeAt).toLocaleString()}`
                          : "Open until closed by an organizer"}
                    </p>
                  </div>
                  {canCreate && !closed && (
                    <button type="button" onClick={() => closePoll(poll.id)} className="shrink-0 rounded border border-[var(--ov-14)] px-2 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--text)]">
                      Close poll
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {poll.options.map((option) => {
                    const count = option.voterAddresses.length;
                    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                    const selected = selectedOptionId === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        disabled={closed}
                        onClick={() => vote(poll.id, option.id)}
                        aria-pressed={selected}
                        className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-default ${
                          selected
                            ? "border-[#4B6B76] bg-[#4B6B760d]"
                            : "border-[var(--ov-0f)] bg-[var(--ov-05)] hover:border-[var(--ov-14)]"
                        }`}
                      >
                        <span className="absolute inset-y-0 left-0 bg-[#4B6B7618]" style={{ width: `${percent}%` }} />
                        <span className="relative flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-[var(--text)]">{option.text}</span>
                          <span className="tabular-nums text-xs text-[var(--muted)]">{percent}% ({count})</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                  {!closed && selectedOptionId && " - Click another option to change your vote"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
