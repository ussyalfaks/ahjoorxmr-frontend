"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleDot, Command, HelpCircle, LayoutGrid, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const OPEN_SHORTCUTS_EVENT = "ahjoor:open-shortcuts";

type ShortcutGroup = {
  label: string;
  icon: typeof LayoutGrid;
  shortcuts: { keys: string[]; description: string }[];
};

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "Navigation",
    icon: LayoutGrid,
    shortcuts: [
      { keys: ["Cmd", "K"], description: "Open the command palette" },
      { keys: ["Esc"], description: "Close an open menu or dialog" },
    ],
  },
  {
    label: "Actions",
    icon: Command,
    shortcuts: [
      { keys: ["?"], description: "Open this shortcuts reference" },
      { keys: ["Tab"], description: "Move between interactive controls" },
    ],
  },
  {
    label: "Circle-specific",
    icon: CircleDot,
    shortcuts: [
      { keys: ["↑", "↓"], description: "Move through command palette results" },
      { keys: ["Enter"], description: "Open the selected circle or action" },
    ],
  },
];

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return element?.tagName === "INPUT" || element?.tagName === "TEXTAREA" || element?.tagName === "SELECT" || element?.isContentEditable;
}

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    function handleGlobalKeydown(event: KeyboardEvent) {
      if (event.key === "?" && !isTypingTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }

    document.addEventListener("keydown", handleGlobalKeydown);
    window.addEventListener(OPEN_SHORTCUTS_EVENT, handleOpenEvent);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeydown);
      window.removeEventListener(OPEN_SHORTCUTS_EVENT, handleOpenEvent);
    };
  }, []);

  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div ref={dialogRef} className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--modal)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ov-0f)] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden="true"><HelpCircle size={18} /></span>
            <div>
              <h2 id="shortcuts-title" className="text-lg font-bold font-sora text-[var(--text)]">Keyboard shortcuts</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">A quick reference for moving around Ahjoor.</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close shortcuts dialog" className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--ov-0a)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"><X size={18} /></button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          {SHORTCUT_GROUPS.map(({ label, icon: Icon, shortcuts }) => (
            <section key={label} aria-labelledby={`shortcut-group-${label}`}>
              <h3 id={`shortcut-group-${label}`} className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"><Icon size={14} aria-hidden="true" />{label}</h3>
              <div className="divide-y divide-[var(--ov-0f)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {shortcuts.map(({ keys, description }) => (
                  <div key={description} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className="text-[var(--text)]">{description}</span>
                    <span className="flex shrink-0 items-center gap-1" aria-label={keys.join(" plus ")}>
                      {keys.map((key) => <kbd key={key} className="min-w-7 rounded-md border border-[var(--border)] bg-[var(--modal)] px-2 py-1 text-center text-xs font-semibold text-[var(--muted)] shadow-sm">{key}</kbd>)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--ov-0f)] px-5 py-3 text-xs text-[var(--muted)]"><Check size={14} className="text-[var(--success)]" aria-hidden="true" /> Shortcuts work wherever you are in the dashboard.</div>
      </div>
    </div>
  );
}