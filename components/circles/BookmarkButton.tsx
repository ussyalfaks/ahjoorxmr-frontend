"use client";

import { Star } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/components/ui/Toast";
import { useUndoableRemoval } from "@/hooks/useUndoableRemoval";

interface BookmarkButtonProps {
  circleId: string;
  circleName: string;
  size?: number;
  className?: string;
}

export default function BookmarkButton({
  circleId,
  circleName,
  size = 16,
  className = "",
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const { showToast } = useToast();
  // #245: removing a bookmark is the destructive half of this toggle —
  // adding one isn't (it's instantly reversible by clicking the same
  // star again, no undo needed). The actual `toggle()` persistence call
  // for a removal is deferred to the undo window's commit; while pending,
  // this circle's star renders unbookmarked optimistically even though
  // storage hasn't changed yet.
  const { remove, undo, isPending } = useUndoableRemoval<string>();
  const pendingRemoval = isPending(circleId);
  const bookmarked = pendingRemoval ? false : isBookmarked(circleId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (pendingRemoval) {
      // Clicking again before the undo window closes is the undo action
      // itself — storage was never actually touched, so just cancel it.
      undo(circleId);
      return;
    }

    if (bookmarked) {
      remove(circleId, {
        title: "Bookmark removed",
        message: `${circleName} was removed from your bookmarks.`,
        commit: () => toggle(circleId),
      });
      return;
    }

    toggle(circleId);
    showToast({
      title: "Circle bookmarked",
      message: `${circleName} was added to your bookmarks.`,
      variant: "success",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? `Remove ${circleName} from bookmarks` : `Bookmark ${circleName}`}
      className={`flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[#FBBF24] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${className}`}
    >
      <Star
        size={size}
        aria-hidden="true"
        className={bookmarked ? "fill-[#FBBF24] text-[#FBBF24]" : "fill-none"}
      />
    </button>
  );
}
