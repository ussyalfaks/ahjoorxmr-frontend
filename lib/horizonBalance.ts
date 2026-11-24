/**
 * Fetches real account balances from the Stellar Horizon API.
 * Returns native XLM (available vs reserved) and USDC asset balance.
 */

const HORIZON_URL = "https://horizon.stellar.org";
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const BASE_RESERVE_XLM = 0.5;
const ENTRY_RESERVE_XLM = 0.5;

export interface HorizonBalance {
  nativeTotal: number;
  nativeAvailable: number;
  nativeReserved: number;
  usdc: number;
}

interface HorizonBalanceEntry {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  buying_liabilities: string;
  selling_liabilities: string;
}

interface HorizonAccount {
  subentry_count: number;
  balances: HorizonBalanceEntry[];
}

export async function fetchHorizonBalances(address: string): Promise<HorizonBalance> {
  const res = await fetch(`${HORIZON_URL}/accounts/${encodeURIComponent(address)}`);
  if (!res.ok) {
    throw new Error(`Horizon error ${res.status}`);
  }
  const data: HorizonAccount = await res.json();

  const nativeEntry = data.balances.find((b) => b.asset_type === "native");
  const nativeTotal = nativeEntry ? parseFloat(nativeEntry.balance) : 0;
  const reserved = (2 + data.subentry_count) * (BASE_RESERVE_XLM + ENTRY_RESERVE_XLM);
  const sellingLiabilities = nativeEntry ? parseFloat(nativeEntry.selling_liabilities) : 0;
  const nativeAvailable = Math.max(nativeTotal - reserved - sellingLiabilities, 0);

  const usdcEntry = data.balances.find(
    (b) => b.asset_type === "credit_alphanum4" && b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER
  );
  const usdc = usdcEntry ? parseFloat(usdcEntry.balance) : 0;

  return { nativeTotal, nativeAvailable, nativeReserved: reserved, usdc };
}
