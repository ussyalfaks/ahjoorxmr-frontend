const rateCache = new Map<string, Promise<number | null>>();

function toCoinGeckoDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

/** Fetches the USD rate once per token/date pair and shares in-flight requests. */
export function getHistoricalUsdRate(date: string, token = "tether"): Promise<number | null> {
  const cacheKey = `${token}:${date}`;
  const cached = rateCache.get(cacheKey);
  if (cached) return cached;

  const request = fetch(
    `https://api.coingecko.com/api/v3/coins/${token}/history?date=${toCoinGeckoDate(date)}&localization=false`,
    { headers: { Accept: "application/json" } }
  )
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = (await response.json()) as { market_data?: { current_price?: { usd?: number } } };
      const rate = payload.market_data?.current_price?.usd;
      return typeof rate === "number" && Number.isFinite(rate) ? rate : null;
    })
    .catch(() => null);

  rateCache.set(cacheKey, request);
  return request;
}