export type ContactField = "email" | "handle" | "none";

export interface ContactSharingSettings {
  shareContactInfo: boolean;
  contactField: ContactField;
  contactValue: string;
}

const DIRECTORY_STORAGE_KEY = "ahjoorxmr:contact-directory";

export const defaultContactSharingSettings: ContactSharingSettings = {
  shareContactInfo: false,
  contactField: "none",
  contactValue: "",
};

function readDirectory(): Record<string, ContactSharingSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DIRECTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeSettings(settings: Partial<ContactSharingSettings>): ContactSharingSettings {
  const shareContactInfo = settings.shareContactInfo === true;
  const contactField = settings.contactField === "email" || settings.contactField === "handle"
    ? settings.contactField
    : "none";
  const contactValue = typeof settings.contactValue === "string" ? settings.contactValue.trim() : "";

  return {
    shareContactInfo,
    contactField: shareContactInfo ? contactField : "none",
    contactValue: shareContactInfo && contactField !== "none" ? contactValue : "",
  };
}

export function getContactSharingSettings(address: string): ContactSharingSettings {
  return normalizeSettings(readDirectory()[address.toLowerCase()] ?? defaultContactSharingSettings);
}

export function saveContactSharingSettings(address: string, settings: ContactSharingSettings): void {
  if (typeof window === "undefined") return;
  try {
    const directory = readDirectory();
    directory[address.toLowerCase()] = normalizeSettings(settings);
    localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
    window.dispatchEvent(new Event("ahjoor:contact-directory-updated"));
  } catch {
    // Ignore storage errors; profile saving still succeeds.
  }
}

export function getVisibleContact({
  viewerIsMember,
  participantAddress,
  participantIsMember,
}: {
  viewerIsMember: boolean;
  participantAddress: string;
  participantIsMember: boolean;
}): { field: Exclude<ContactField, "none">; value: string } | null {
  if (!viewerIsMember || !participantIsMember) return null;

  const settings = getContactSharingSettings(participantAddress);
  if (!settings.shareContactInfo || settings.contactField === "none" || !settings.contactValue) return null;

  return { field: settings.contactField, value: settings.contactValue };
}