const STORAGE_KEY = "ahjoor:support-tickets";

export type SupportTicketCategory = "account" | "wallet" | "circle" | "payment" | "technical" | "other";
export type SupportTicketStatus = "open" | "in-progress" | "resolved";

export interface SupportTicket {
  id: string;
  reference: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  screenshotName: string | null;
  screenshotDataUrl: string | null;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
}

function readTickets(): SupportTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupportTicket[]) : [];
  } catch {
    return [];
  }
}

function writeTickets(tickets: SupportTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage errors; the ticket remains visible in the current session.
  }
}

function createReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AHJ-${date}-${suffix}`;
}

export function getSupportTickets(): SupportTicket[] {
  return readTickets().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveSupportTicket(
  ticket: Omit<SupportTicket, "id" | "reference" | "status" | "createdAt" | "updatedAt">
): SupportTicket {
  const now = new Date().toISOString();
  const savedTicket: SupportTicket = {
    ...ticket,
    id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reference: createReference(),
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  writeTickets([savedTicket, ...readTickets()]);
  return savedTicket;
}
