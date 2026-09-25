export type CircleImageKind = "icon" | "cover";

export interface CircleImages {
    icon?: string;
    cover?: string;
}

const STORAGE_KEY = "ahjoorxmr:circle-images";
export const CIRCLE_IMAGES_UPDATED_EVENT = "ahjoorxmr:circle-images-updated";

function readAll(): Record<string, CircleImages> {
    if (typeof window === "undefined") return {};
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function getCircleImages(circleId: string): CircleImages {
    return readAll()[circleId] ?? {};
}

export function saveCircleImage(circleId: string, kind: CircleImageKind, dataUrl: string): void {
    const images = readAll();
    const current = images[circleId] ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...images,
        [circleId]: { ...current, [kind]: dataUrl },
    }));
    window.dispatchEvent(new CustomEvent(CIRCLE_IMAGES_UPDATED_EVENT, { detail: { circleId, kind } }));
}

export function removeCircleImage(circleId: string, kind: CircleImageKind): void {
    const images = readAll();
    const current = { ...(images[circleId] ?? {}) };
    delete current[kind];
    if (current.icon || current.cover) images[circleId] = current;
    else delete images[circleId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    window.dispatchEvent(new CustomEvent(CIRCLE_IMAGES_UPDATED_EVENT, { detail: { circleId, kind } }));
}

export function getFallbackCircleImage(circleId: string, name: string): string {
    const palette = ["#315B63", "#8B5E3C", "#446B4D", "#715A8A", "#9A5D50"];
    const color = palette[Number.parseInt(circleId.replace(/\D/g, "") || "0", 10) % palette.length];
    const initials = name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="${color}"/><circle cx="690" cy="-20" r="210" fill="#ffffff" fill-opacity=".12"/><circle cx="100" cy="420" r="180" fill="#000000" fill-opacity=".12"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="150" font-weight="700">${initials}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
