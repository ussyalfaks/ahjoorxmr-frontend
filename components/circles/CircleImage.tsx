"use client";

import { useEffect, useState } from "react";
import {
    CIRCLE_IMAGES_UPDATED_EVENT,
    getCircleImages,
    getFallbackCircleImage,
    type CircleImageKind,
} from "@/lib/circleImages";

interface CircleImageProps {
    circleId: string;
    circleName: string;
    kind: CircleImageKind;
    className?: string;
    alt?: string;
}

export default function CircleImage({ circleId, circleName, kind, className, alt }: CircleImageProps) {
    const [src, setSrc] = useState(() => getFallbackCircleImage(circleId, circleName));

    useEffect(() => {
        const sync = () => setSrc(getCircleImages(circleId)[kind] ?? getFallbackCircleImage(circleId, circleName));
        sync();
        window.addEventListener(CIRCLE_IMAGES_UPDATED_EVENT, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(CIRCLE_IMAGES_UPDATED_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, [circleId, circleName, kind]);

    return <img src={src} alt={alt ?? `${circleName} ${kind}`} loading="lazy" decoding="async" className={className} />;
}
