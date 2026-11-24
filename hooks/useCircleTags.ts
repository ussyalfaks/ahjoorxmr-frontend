"use client";

import { useCallback, useEffect, useState } from "react";
import { CURRENT_WALLET } from "@/data/circles";
import {
  CIRCLE_TAGS_EVENT,
  createCircleTag,
  deleteCircleTag,
  getCircleTagState,
  renameCircleTag,
  toggleCircleTag,
  type CircleTag,
} from "@/lib/circleTags";

export function useCircleTags() {
  const [state, setState] = useState(() => getCircleTagState(CURRENT_WALLET));

  useEffect(() => {
    const sync = () => setState(getCircleTagState(CURRENT_WALLET));
    sync();
    window.addEventListener(CIRCLE_TAGS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CIRCLE_TAGS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const refresh = useCallback(() => setState(getCircleTagState(CURRENT_WALLET)), []);
  const create = useCallback((name: string) => {
    if (state.tags.length >= 20) return null;
    const tag = createCircleTag(CURRENT_WALLET, name);
    refresh();
    return tag;
  }, [refresh, state.tags.length]);
  const rename = useCallback((id: string, name: string) => {
    const changed = renameCircleTag(CURRENT_WALLET, id, name);
    refresh();
    return changed;
  }, [refresh]);
  const remove = useCallback((id: string) => {
    deleteCircleTag(CURRENT_WALLET, id);
    refresh();
  }, [refresh]);
  const toggle = useCallback((circleId: string, tagId: string) => {
    toggleCircleTag(CURRENT_WALLET, circleId, tagId);
    refresh();
  }, [refresh]);
  const assignedIds = useCallback((circleId: string) => state.assignments[circleId] ?? [], [state.assignments]);
  const assignedTags = useCallback((circleId: string): CircleTag[] => {
    const ids = new Set(assignedIds(circleId));
    return state.tags.filter((tag) => ids.has(tag.id));
  }, [assignedIds, state.tags]);

  return { tags: state.tags, assignments: state.assignments, assignedIds, assignedTags, create, rename, remove, toggle };
}
