export type FeeOperation = "contribute" | "claim" | "create-circle";

export interface GasFeeEstimate {
    nativeToken: string;
    nativeAmount: string;
    fiatAmount?: string;
    updatedAt: number;
}

export interface GasFeeRequest {
    operation: FeeOperation;
    walletAddress?: string;
    transaction?: Record<string, unknown>;
}

interface WalletFeeProvider {
    estimateFee?: (request: GasFeeRequest) => Promise<unknown>;
}

interface WindowWithWalletProviders extends Window {
    starknet_argentX?: WalletFeeProvider;
    starknet_braavos?: WalletFeeProvider;
}

function normalizeProviderEstimate(value: unknown): GasFeeEstimate | null {
    if (!value || typeof value !== "object") return null;
    const estimate = value as Record<string, unknown>;
    const nativeAmount = estimate.nativeAmount ?? estimate.amount ?? estimate.overall_fee;
    if (typeof nativeAmount !== "string" && typeof nativeAmount !== "number") return null;

    return {
        nativeToken: typeof estimate.nativeToken === "string" ? estimate.nativeToken : "STRK",
        nativeAmount: String(nativeAmount),
        fiatAmount: typeof estimate.fiatAmount === "string" ? estimate.fiatAmount : undefined,
        updatedAt: Date.now(),
    };
}

async function estimateFromRpc(request: GasFeeRequest): Promise<GasFeeEstimate | null> {
    const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL;
    if (!rpcUrl || !request.transaction) return null;

    const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "starknet_estimateFee",
            params: [[request.transaction], "latest", { version: "0x3" }],
        }),
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as { result?: { overall_fee?: string } };
    const overallFee = payload.result?.overall_fee;
    if (!overallFee) return null;
    const feeInWei = BigInt(overallFee);
    const weiPerToken = BigInt("1000000000000000000");
    const wholeUnits = feeInWei / weiPerToken;
    const fractionalUnits = (feeInWei % weiPerToken)
        .toString()
        .padStart(18, "0")
        .replace(/0+$/, "");

    return {
        nativeToken: "STRK",
        nativeAmount: fractionalUnits ? `${wholeUnits}.${fractionalUnits}` : wholeUnits.toString(),
        updatedAt: Date.now(),
    };
}

export async function estimateNetworkFee(request: GasFeeRequest): Promise<GasFeeEstimate | null> {
    if (typeof window === "undefined") return null;

    const providers = [
        (window as WindowWithWalletProviders).starknet_argentX,
        (window as WindowWithWalletProviders).starknet_braavos,
    ].filter(Boolean);

    for (const provider of providers) {
        if (!provider?.estimateFee) continue;
        try {
            const estimate = normalizeProviderEstimate(await provider.estimateFee(request));
            if (estimate) return estimate;
        } catch {
            continue;
        }
    }

    try {
        return await estimateFromRpc(request);
    } catch {
        return null;
    }
}

export async function addFiatValue(estimate: GasFeeEstimate): Promise<GasFeeEstimate> {
    if (estimate.fiatAmount || estimate.nativeToken !== "STRK") return estimate;

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=starknet&vs_currencies=usd"
        );
        if (!response.ok) return estimate;
        const payload = (await response.json()) as { starknet?: { usd?: number } };
        const price = payload.starknet?.usd;
        const amount = Number(estimate.nativeAmount);
        if (!price || !Number.isFinite(amount)) return estimate;

        return { ...estimate, fiatAmount: `$${(amount * price).toFixed(2)}` };
    } catch {
        return estimate;
    }
}