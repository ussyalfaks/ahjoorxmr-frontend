/**
 * shareCard.ts
 * Client-side canvas renderer for Ahjoor milestone share cards.
 * Returns a PNG Blob — no server dependency.
 *
 * Card dimensions: 1200 × 630 (standard OG image ratio).
 */

import type { MilestoneData, MilestoneType } from "@/types/milestone";

// ---------------------------------------------------------------------------
// Design tokens (mirrored from global.css dark palette)
// ---------------------------------------------------------------------------
const PALETTE = {
  bg: "#0a0a0f",
  surface: "#161616",
  card: "#13131e",
  border: "rgba(255,255,255,0.07)",
  text: "#eeeef8",
  muted: "#a1a1aa",
  faint: "#555555",
  accent: "#6c5ce7",
  accentSoft: "rgba(108,92,231,0.18)",
  brand: "#4B6B76",
  success: "#4ADE80",
  gold: "#FBBF24",
  coral: "#FF5B5B",
  white: "#ffffff",
} as const;

interface TypeConfig {
  label: string;
  accentColor: string;
  emoji: string;
}

const TYPE_CONFIG: Record<MilestoneType, TypeConfig> = {
  circle_completed: {
    label: "Circle Completed",
    accentColor: PALETTE.success,
    emoji: "🎉",
  },
  payout_received: {
    label: "Payout Received",
    accentColor: PALETTE.gold,
    emoji: "💰",
  },
  savings_goal: {
    label: "Savings Goal Hit",
    accentColor: PALETTE.accent,
    emoji: "🏆",
  },
  streak: {
    label: "Streak Achieved",
    accentColor: PALETTE.coral,
    emoji: "🔥",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  // Handle rgba(...) pass-through
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGlowCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, hexToRgba(color, 0.22));
  grad.addColorStop(0.5, hexToRgba(color, 0.08));
  grad.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export async function renderMilestoneCard(milestone: MilestoneData): Promise<Blob> {
  const W = 1200;
  const H = 630;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const cfg = TYPE_CONFIG[milestone.type];

  // --- Background ---
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid overlay (very faint dot pattern)
  ctx.fillStyle = hexToRgba(PALETTE.white, 0.018);
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Glow blobs ---
  drawGlowCircle(ctx, W * 0.15, H * 0.3, 320, cfg.accentColor);
  drawGlowCircle(ctx, W * 0.85, H * 0.75, 280, PALETTE.accent);

  // --- Card surface ---
  const cPad = 48;
  const cW = W - cPad * 2;
  const cH = H - cPad * 2;
  roundRect(ctx, cPad, cPad, cW, cH, 28);
  ctx.fillStyle = hexToRgba(PALETTE.surface, 0.88);
  ctx.fill();

  // Card border
  roundRect(ctx, cPad, cPad, cW, cH, 28);
  ctx.strokeStyle = hexToRgba(PALETTE.white, 0.08);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top accent bar
  const barH = 4;
  roundRect(ctx, cPad, cPad, cW, barH, 2);
  const barGrad = ctx.createLinearGradient(cPad, 0, cPad + cW, 0);
  barGrad.addColorStop(0, cfg.accentColor);
  barGrad.addColorStop(0.6, PALETTE.accent);
  barGrad.addColorStop(1, hexToRgba(cfg.accentColor, 0));
  ctx.fillStyle = barGrad;
  ctx.fill();

  // --- Logo mark ($ in circle) ---
  const logoX = cPad + 48;
  const logoY = cPad + 56;
  const logoR = 22;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(PALETTE.white, 0.55);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = `bold 22px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = PALETTE.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", logoX, logoY + 1);

  // Brand name
  ctx.font = `600 24px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = hexToRgba(PALETTE.white, 0.9);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Ahjoor", logoX + logoR + 14, logoY);

  // --- Milestone type badge ---
  const badgePad = { x: 20, y: 9 };
  const badgeText = `${cfg.emoji}  ${cfg.label}`;
  ctx.font = `600 18px "DM Sans", system-ui, sans-serif`;
  const badgeW = ctx.measureText(badgeText).width + badgePad.x * 2;
  const badgeH = 40;
  const badgeX = cPad + 48;
  const badgeY = logoY + logoR + 36;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
  ctx.fillStyle = hexToRgba(cfg.accentColor, 0.15);
  ctx.fill();
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
  ctx.strokeStyle = hexToRgba(cfg.accentColor, 0.35);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = `600 18px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = cfg.accentColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, badgeX + badgePad.x, badgeY + badgeH / 2);

  // --- Circle name ---
  const nameY = badgeY + badgeH + 42;
  ctx.font = `700 52px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  // Truncate if too long
  let displayName = milestone.circleName;
  while (ctx.measureText(displayName).width > cW - 120 && displayName.length > 10) {
    displayName = displayName.slice(0, -1);
  }
  if (displayName !== milestone.circleName) displayName += "…";
  ctx.fillText(displayName, cPad + 48, nameY);

  // --- Amount (large hero number) ---
  const amountY = nameY + 78;
  const amountGrad = ctx.createLinearGradient(cPad + 48, amountY, cPad + 48 + 400, amountY + 80);
  amountGrad.addColorStop(0, PALETTE.white);
  amountGrad.addColorStop(1, hexToRgba(cfg.accentColor, 0.8));
  ctx.font = `700 80px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = amountGrad;
  ctx.textBaseline = "top";
  ctx.fillText(milestone.amount, cPad + 48, amountY);

  // --- Subtitle ---
  if (milestone.subtitle) {
    const subtitleY = amountY + 96;
    ctx.font = `400 24px "DM Sans", system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.muted;
    ctx.textBaseline = "top";
    ctx.fillText(milestone.subtitle, cPad + 52, subtitleY);
  }

  // --- Divider ---
  const dividerY = H - cPad - 80;
  ctx.strokeStyle = hexToRgba(PALETTE.white, 0.07);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cPad + 48, dividerY);
  ctx.lineTo(cPad + cW - 48, dividerY);
  ctx.stroke();

  // --- Footer: date + tagline ---
  const footerY = dividerY + 24;
  ctx.font = `400 18px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = PALETTE.faint;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  if (milestone.date) {
    ctx.fillText(milestone.date, cPad + 48, footerY);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = hexToRgba(PALETTE.white, 0.3);
  ctx.fillText("ahjoor.finance", cPad + cW - 48, footerY);

  // --- Decorative ring (bottom-right corner) ---
  const ringX = W - cPad - 80;
  const ringY = H / 2 + 40;
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(ringX, ringY, 60 * i, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(cfg.accentColor, 0.04 * i);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      },
      "image/png"
    );
  });
}
