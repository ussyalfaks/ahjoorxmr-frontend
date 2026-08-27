"use client";

import { useCallback, useRef, useState } from "react";
import { renderMilestoneCard } from "@/lib/shareCard";
import type { MilestoneData } from "@/types/milestone";

export type ShareStatus = "idle" | "rendering" | "ready" | "sharing" | "error";

export interface UseShareCardReturn {
  status: ShareStatus;
  previewUrl: string | null;
  /** Render the card and open the share sheet. Call from the "Share" button. */
  openShare: (milestone: MilestoneData) => Promise<void>;
  /** Download the last-rendered card as a PNG. */
  download: (filename?: string) => void;
  /** Web Share API (native sheet). Returns false if not supported. */
  nativeShare: (milestone: MilestoneData, shareUrl?: string) => Promise<boolean>;
  /** Copy a fallback URL to clipboard. */
  copyLink: (shareUrl?: string) => Promise<boolean>;
  /** Reset back to idle (close preview). */
  reset: () => void;
  errorMessage: string | null;
}

export function useShareCard(): UseShareCardReturn {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    blobRef.current = null;
  }, [previewUrl]);

  const renderCard = useCallback(async (milestone: MilestoneData): Promise<Blob | null> => {
    setStatus("rendering");
    setErrorMessage(null);
    try {
      const blob = await renderMilestoneCard(milestone);
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setStatus("ready");
      return blob;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate card";
      setErrorMessage(msg);
      setStatus("error");
      return null;
    }
  }, []);

  const openShare = useCallback(
    async (milestone: MilestoneData) => {
      // Re-render if we don't have a blob yet (or status is not ready)
      if (status !== "ready" || !blobRef.current) {
        await renderCard(milestone);
      }
    },
    [status, renderCard]
  );

  const download = useCallback((filename = "ahjoor-milestone.png") => {
    const blob = blobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const nativeShare = useCallback(
    async (milestone: MilestoneData, shareUrl?: string): Promise<boolean> => {
      if (!("share" in navigator)) return false;

      setStatus("sharing");
      let blob = blobRef.current;
      if (!blob) {
        blob = await renderCard(milestone);
        if (!blob) return false;
      }

      const file = new File([blob], "ahjoor-milestone.png", { type: "image/png" });
      const canShareFile = navigator.canShare?.({ files: [file] }) ?? false;

      try {
        const shareData: ShareData = {
          title: `${milestone.circleName} – Ahjoor Milestone`,
          text: `I just hit a milestone on Ahjoor! ${milestone.circleName}: ${milestone.amount}`,
          url: shareUrl ?? window.location.href,
          ...(canShareFile ? { files: [file] } : {}),
        };
        await navigator.share(shareData);
        setStatus("ready");
        return true;
      } catch (err) {
        // AbortError means user dismissed — not a real error
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("ready");
          return false;
        }
        setErrorMessage("Sharing failed. Try downloading instead.");
        setStatus("error");
        return false;
      }
    },
    [renderCard]
  );

  const copyLink = useCallback(async (shareUrl?: string): Promise<boolean> => {
    const url = shareUrl ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  return {
    status,
    previewUrl,
    openShare,
    download,
    nativeShare,
    copyLink,
    reset,
    errorMessage,
  };
}
