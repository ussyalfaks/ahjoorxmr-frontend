"use client";

import { useEffect, useState } from "react";
import { CIRCLE_PAUSE_EVENT, emptyPauseState, getCirclePauseState, type CirclePauseState } from "@/lib/circlePause";

/** Live pause/resume state for a circle, synced across tabs and components. */
export function useCirclePause(circleId: string): CirclePauseState {
  const [state, setState] = useState<CirclePauseState>(() => emptyPauseState(circleId));

  useEffect(() => {
    const sync = () => setState(getCirclePauseState(circleId));
    sync();
    window.addEventListener(CIRCLE_PAUSE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CIRCLE_PAUSE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [circleId]);

  return state;
}
