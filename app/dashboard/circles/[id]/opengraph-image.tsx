import { ImageResponse } from "next/og";
import { MOCK_CIRCLES } from "@/data/circles";

/**
 * Per-circle Open Graph image, shown when a circle link is shared.
 * Colors mirror the brand tokens in app/global.css (dark theme).
 */

export const alt = "Ahjoor savings circle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = {
  bg: "#0a0a0f",
  card: "#13131e",
  accent: "#6c5ce7",
  accent2: "#8b7cf8",
  text: "#eeeef8",
  muted: "#a1a1aa",
  track: "rgba(255, 255, 255, 0.1)",
};

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          display: "flex",
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${BRAND.accent}, ${BRAND.accent2})`,
        }}
      />
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: BRAND.text }}>Ahjoor</div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `radial-gradient(circle at 85% 10%, rgba(108, 92, 231, 0.35), ${BRAND.bg} 55%)`,
        color: BRAND.text,
        fontFamily: "sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", fontSize: 22, textTransform: "uppercase", letterSpacing: 3, color: BRAND.muted }}>
        {label}
      </div>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: BRAND.text }}>{value}</div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circle = MOCK_CIRCLES.find((c) => c.id === id);

  // Fallback for unknown / removed circles: generic brand card instead of a 404.
  if (!circle) {
    return new ImageResponse(
      (
        <Frame>
          <Wordmark />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>Savings circle</div>
            <div style={{ display: "flex", fontSize: 32, color: BRAND.muted }}>
              This circle is unavailable. Save with friends on Ahjoor.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: BRAND.accent2 }}>Decentralized savings circles</div>
        </Frame>
      ),
      size
    );
  }

  const joined = circle.members.length;
  const total = circle.totalSlots;
  const { currentRound, totalRounds } = circle;
  // Prefer round progress when the circle has started; otherwise show seats filled.
  const hasRounds = currentRound !== undefined && totalRounds !== undefined && totalRounds > 0;
  const progress = hasRounds
    ? Math.min(1, currentRound / totalRounds)
    : Math.min(1, joined / Math.max(total, 1));
  const progressLabel = hasRounds
    ? `Round ${currentRound} of ${totalRounds}`
    : `${joined} of ${total} seats filled`;

  return new ImageResponse(
    (
      <Frame>
        <Wordmark />

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <div
            style={{
              display: "flex",
              fontSize: circle.name.length > 28 ? 60 : 80,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {circle.name}
          </div>

          <div style={{ display: "flex", gap: 96 }}>
            <Stat label="Contribution" value={`${circle.contribution} / ${circle.duration.toLowerCase()}`} />
            <Stat label="Members" value={`${joined}/${total} joined`} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: BRAND.muted }}>
            <div style={{ display: "flex" }}>{progressLabel}</div>
            <div style={{ display: "flex", color: BRAND.text, fontWeight: 700 }}>{Math.round(progress * 100)}%</div>
          </div>
          <div style={{ display: "flex", width: "100%", height: 18, borderRadius: 9, background: BRAND.track }}>
            <div
              style={{
                display: "flex",
                width: `${progress * 100}%`,
                height: "100%",
                borderRadius: 9,
                background: `linear-gradient(90deg, ${BRAND.accent}, ${BRAND.accent2})`,
              }}
            />
          </div>
        </div>
      </Frame>
    ),
    size
  );
}
