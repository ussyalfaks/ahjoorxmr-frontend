"use client";

import { Star } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/components/ui/Toast";

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
  const bookmarked = isBookmarked(circleId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowBookmarked = toggle(circleId);
    showToast({
      title: nowBookmarked ? "Circle bookmarked" : "Bookmark removed",
      message: nowBookmarked
        ? `${circleName} was added to your bookmarks.`
        : `${circleName} was removed from your bookmarks.`,
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
