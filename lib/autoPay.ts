import type { AutoPayConfig } from "@/types/autoPay";

// Requires a real wallet-side pre-authorization/allowance mechanism per the
// issue's tech notes; persisted client-side here as an interim until that
// contract-level allowance exists, mirroring the app's other mock stores.
const STORAGE_KEY = "ahjoor:auto-pay";

function readAll(): Record<string, AutoPayConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(configs: Record<string, AutoPayConfig>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // ignore storage errors
  }
}

export function getAutoPayConfig(circleId: string): AutoPayConfig | null {
  return readAll()[circleId] ?? null;
}

export function isAutoPayActive(circleId: string): boolean {
  return getAutoPayConfig(circleId)?.enabled ?? false;
}

export function enableAutoPay(input: {
  circleId: string;
  authorizedAmount: string;
  frequency: string;
}): AutoPayConfig {
  const configs = readAll();
  const config: AutoPayConfig = {
    circleId: input.circleId,
    enabled: true,
    authorizedAmount: input.authorizedAmount,
    frequency: input.frequency,
    createdAt: new Date().toISOString(),
    lastAttempt: configs[input.circleId]?.lastAttempt ?? null,
  };
  configs[input.circleId] = config;
  writeAll(configs);
  return config;
}

export function disableAutoPay(circleId: string): void {
  const configs = readAll();
  const existing = configs[circleId];
  if (!existing) return;
  configs[circleId] = { ...existing, enabled: false };
  writeAll(configs);
}

export function recordAutoPayAttempt(
  circleId: string,
  attempt: AutoPayConfig["lastAttempt"]
): void {
  const configs = readAll();
  const existing = configs[circleId];
  if (!existing) return;
  configs[circleId] = { ...existing, lastAttempt: attempt };
  writeAll(configs);
}
