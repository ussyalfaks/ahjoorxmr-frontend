"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useCircleTags } from "@/hooks/useCircleTags";

interface Props {
  circleId: string;
  circleName: string;
}

export default function CircleTagControls({ circleId, circleName }: Props) {
  const { tags, assignedTags, assignedIds, create, rename, remove, toggle } = useCircleTags();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const assigned = assignedTags(circleId);

  function addTag(event: FormEvent) {
    event.preventDefault();
    if (create(newName)) setNewName("");
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1">
        {assigned.map((tag) => (
          <span key={tag.id} className="rounded-full bg-[#4B6B76]/10 px-2 py-0.5 text-[10px] font-medium text-[#4B6B76] dark:text-[#9fc2cc]">
            {tag.name}
          </span>
        ))}
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`Manage tags for ${circleName}`} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-[var(--muted)] hover:bg-[var(--ov-0a)] hover:text-[var(--text)]">
          <Tag size={12} aria-hidden="true" />
          Tags
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-[var(--ov-14)] bg-[var(--content)] p-3 shadow-xl" role="dialog" aria-label={`Tags for ${circleName}`}>
          <p className="mb-2 text-xs font-semibold text-[var(--text)]">Private tags</p>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {tags.map((tag) => {
              const checked = assignedIds(circleId).includes(tag.id);
              return (
                <div key={tag.id} className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <input type="checkbox" checked={checked} onChange={() => toggle(circleId, tag.id)} aria-label={`Assign ${tag.name}`} />
                  <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                  <button type="button" onClick={() => { const next = window.prompt("Rename tag", tag.name); if (next) rename(tag.id, next); }} aria-label={`Rename ${tag.name}`} className="text-[var(--muted)] hover:text-[var(--text)]"><Pencil size={12} /></button>
                  <button type="button" onClick={() => remove(tag.id)} aria-label={`Delete ${tag.name}`} className="text-[var(--muted)] hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              );
            })}
          </div>
          <form onSubmit={addTag} className="mt-3 flex gap-1.5">
            <input value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={24} placeholder="New tag" aria-label="New tag name" className="min-w-0 flex-1 rounded-md border border-[var(--ov-14)] bg-transparent px-2 py-1 text-xs text-[var(--text)] outline-none focus:ring-1 focus:ring-[#4B6B76]" />
            <button type="submit" aria-label="Create tag" className="rounded-md bg-[#4B6B76] p-1.5 text-white"><Plus size={13} /></button>
          </form>
          <p className="mt-2 text-[10px] text-[var(--muted)]">Tags are stored only in this browser for your wallet.</p>
        </div>
      )}
    </div>
  );
}
