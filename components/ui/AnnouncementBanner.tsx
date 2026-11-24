"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Info, AlertTriangle, AlertOctagon, ExternalLink } from "lucide-react";
import { useSiteAnnouncement } from "@/hooks/useSiteAnnouncement";
import type { AnnouncementSeverity } from "@/types/siteAnnouncement";

/* ─── Severity configuration ──────────────────────────────────────────────── */

const SEVERITY_CONFIG: Record<
  AnnouncementSeverity,
  {
    Icon: React.ElementType;
    /** CSS custom-property–based colour tokens */
    bgVar: string;
    borderVar: string;
    textVar: string;
    iconColor: string;
    /** Tailwind/inline accent colours */
    accent: string;
    label: string;
  }
> = {
  info: {
    Icon: Info,
    bgVar: "rgba(108, 92, 231, 0.08)",
    borderVar: "rgba(108, 92, 231, 0.25)",
    textVar: "var(--text)",
    iconColor: "#8b7cf8",
    accent: "#6c5ce7",
    label: "Info",
  },
  warning: {
    Icon: AlertTriangle,
    bgVar: "rgba(234, 179, 8, 0.10)",
    borderVar: "rgba(234, 179, 8, 0.35)",
    textVar: "var(--text)",
    iconColor: "#f59e0b",
    accent: "#d97706",
    label: "Warning",
  },
  critical: {
    Icon: AlertOctagon,
    bgVar: "rgba(239, 68, 68, 0.10)",
    borderVar: "rgba(239, 68, 68, 0.35)",
    textVar: "var(--text)",
    iconColor: "#f87171",
    accent: "#ef4444",
    label: "Critical",
  },
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function AnnouncementBanner() {
  const { announcement, dismiss } = useSiteAnnouncement();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Animate in once the announcement is available
  useEffect(() => {
    if (announcement) {
      // Tiny delay lets the element mount before the transition fires
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [announcement?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = useCallback(() => {
    if (!announcement) return;
    setExiting(true);
    // Wait for the collapse animation before removing from DOM
    setTimeout(() => {
      dismiss(announcement.id);
      setExiting(false);
      setVisible(false);
    }, 350);
  }, [announcement, dismiss]);

  // Keyboard shortcut: Escape closes the banner
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && announcement) handleDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [announcement, handleDismiss]);

  if (!announcement) return null;

  const cfg = SEVERITY_CONFIG[announcement.severity];
  const { Icon } = cfg;

  const isExiting = exiting || !visible;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label={`${cfg.label} announcement`}
      aria-live="polite"
      data-announcement-severity={announcement.severity}
      style={{
        background: cfg.bgVar,
        borderBottom: `1px solid ${cfg.borderVar}`,
        // Collapse-height animation driven by max-height + opacity
        maxHeight: isExiting ? "0px" : "120px",
        opacity: isExiting ? 0 : 1,
        overflow: "hidden",
        transition: "max-height 350ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease",
        willChange: "max-height, opacity",
      }}
    >
      {/* Left severity accent stripe */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          background: cfg.accent,
          borderRadius: "0 2px 2px 0",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "10px 20px",
        }}
      >
        {/* Icon + Message */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Icon
            size={17}
            aria-hidden="true"
            style={{ color: cfg.iconColor, flexShrink: 0 }}
          />
          <p
            style={{
              color: cfg.textVar,
              fontSize: "13.5px",
              lineHeight: 1.5,
              margin: 0,
              fontWeight: 450,
              // Allow long messages to wrap gracefully
              wordBreak: "break-word",
            }}
          >
            {announcement.message}
          </p>

          {announcement.link && (
            <Link
              href={announcement.link.href}
              target={announcement.link.href.startsWith("http") ? "_blank" : undefined}
              rel={announcement.link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: cfg.accent,
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                borderBottom: `1px solid transparent`,
                transition: "border-color 150ms",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.borderBottomColor = cfg.accent)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "transparent")
              }
              aria-label={`${announcement.link.label} — opens ${announcement.link.href.startsWith("http") ? "in a new tab" : "in the app"}`}
            >
              {announcement.link.label}
              {announcement.link.href.startsWith("http") && (
                <ExternalLink size={11} aria-hidden="true" />
              )}
            </Link>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: "28px",
            height: "28px",
            border: "none",
            borderRadius: "8px",
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
            transition: "background 150ms, color 150ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = `${cfg.borderVar}`;
            (e.currentTarget as HTMLButtonElement).style.color = cfg.iconColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
