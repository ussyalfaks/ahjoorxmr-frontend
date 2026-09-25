import { useCallback, useEffect, useRef, useState } from "react";
import { addFiatValue, estimateNetworkFee, type GasFeeEstimate, type GasFeeRequest } from "@/lib/gasFee";

const REFRESH_INTERVAL_MS = 15_000;

export function useGasFeeEstimate(
    isOpen: boolean,
    request: GasFeeRequest,
    estimate = estimateNetworkFee
) {
    const [fee, setFee] = useState<GasFeeEstimate | null>(null);
    const [loading, setLoading] = useState(false);
    const activeRef = useRef(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        const nextFee = await estimate(request);
        const feeWithFiat = nextFee ? await addFiatValue(nextFee) : null;
        if (activeRef.current) {
            setFee(feeWithFiat);
            setLoading(false);
        }
        return feeWithFiat;
    }, [estimate, request]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        activeRef.current = true;
        const initialRefresh = window.setTimeout(() => void refresh(), 0);
        const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
        return () => {
            activeRef.current = false;
            window.clearTimeout(initialRefresh);
            window.clearInterval(interval);
        };
    }, [isOpen, refresh]);

    return { fee, loading, refresh };
}