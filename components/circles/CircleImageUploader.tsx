"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { CIRCLE_IMAGES_UPDATED_EVENT, getCircleImages, removeCircleImage, saveCircleImage, type CircleImageKind } from "@/lib/circleImages";
import { useToast } from "@/components/ui/Toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface CircleImageUploaderProps {
    circleId: string;
    kind: CircleImageKind;
    label: string;
    description: string;
    aspectRatio: number;
}

export default function CircleImageUploader({ circleId, kind, label, description, aspectRatio }: CircleImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const savedImage = useSyncExternalStore(
        (onChange) => {
            const sync = () => onChange();
            window.addEventListener(CIRCLE_IMAGES_UPDATED_EVENT, sync);
            window.addEventListener("storage", sync);
            return () => {
                window.removeEventListener(CIRCLE_IMAGES_UPDATED_EVENT, sync);
                window.removeEventListener("storage", sync);
            };
        },
        () => getCircleImages(circleId)[kind] ?? null,
        () => null,
    );
    const [source, setSource] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        return () => {
            if (source) URL.revokeObjectURL(source);
        };
    }, [source]);

    function chooseFile(file: File | null) {
        setError(null);
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Use a JPG, PNG, or WebP image.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError("Image must be 5 MB or smaller.");
            return;
        }
        if (source) URL.revokeObjectURL(source);
        setSource(URL.createObjectURL(file));
        setZoom(1);
    }

    function cropAndSave() {
        const image = imageRef.current;
        if (!image || !source) return;
        const outputWidth = kind === "cover" ? 1200 : 800;
        const outputHeight = Math.round(outputWidth / aspectRatio);
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const context = canvas.getContext("2d");
        if (!context || !image.naturalWidth || !image.naturalHeight) return;

        const cropRatio = outputWidth / outputHeight;
        const imageRatio = image.naturalWidth / image.naturalHeight;
        const baseScale = imageRatio > cropRatio ? image.naturalHeight / outputHeight : image.naturalWidth / outputWidth;
        const cropWidth = outputWidth * baseScale / zoom;
        const cropHeight = outputHeight * baseScale / zoom;
        const cropX = (image.naturalWidth - cropWidth) / 2;
        const cropY = (image.naturalHeight - cropHeight) / 2;
        context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        saveCircleImage(circleId, kind, dataUrl);
        setSource(null);
        showToast({ title: `${label} saved`, variant: "success" });
    }

    function removeSavedImage() {
        removeCircleImage(circleId, kind);
        showToast({ title: `${label} removed`, variant: "success" });
    }

    return (
        <div className="space-y-3 rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)] p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">{label}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
                </div>
                {savedImage && !source && (
                    <button type="button" onClick={removeSavedImage} className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-red-500" aria-label={`Remove ${label}`}>
                        <Trash2 size={13} aria-hidden="true" /> Remove
                    </button>
                )}
            </div>

            {source ? (
                <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg bg-black/20" style={{ aspectRatio }}>
                        <img ref={imageRef} src={source} alt="Crop preview" className="h-full w-full object-cover" style={{ transform: `scale(${zoom})` }} />
                    </div>
                    <div className="flex items-center gap-3">
                        <label htmlFor={`${kind}-zoom`} className="text-xs text-[var(--muted)]">Zoom</label>
                        <input id={`${kind}-zoom`} type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-[#4B6B76]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={cropAndSave} className="inline-flex items-center gap-2 rounded-lg bg-[#4B6B76] px-3 py-2 text-xs font-medium text-white hover:bg-[#3D5A64]"><ImagePlus size={14} aria-hidden="true" /> Use this crop</button>
                        <button type="button" onClick={() => setSource(null)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--ov-14)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-0a)]"><RotateCcw size={14} aria-hidden="true" /> Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {savedImage && <img src={savedImage} alt="" className="h-16 w-24 rounded-lg object-cover" loading="lazy" />}
                    <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--ov-1a)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--ov-0a)]"><Upload size={14} aria-hidden="true" /> {savedImage ? "Replace image" : "Upload image"}</button>
                    <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} className="sr-only" onChange={(event) => { chooseFile(event.target.files?.[0] ?? null); event.target.value = ""; }} />
                </div>
            )}
            {error && <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
