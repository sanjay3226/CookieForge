// Client for CookieScan REST API (api.cookiescan.io)
import { COOKIE_APIS } from "../utils/constants";

export interface TokenItem {
  mint: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: number;
  description?: string;
  priceUsd: number;
  priceNative: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  holderCount: number;
}

export interface MarketItem {
  marketId: string;
  type: string;
  baseSymbol: string;
  baseMint: string;
  quoteSymbol: string;
  quoteMint: string;
  liquidityUsd: number;
  liquidityDisplay: string;
}

/**
 * Fetch all registered tokens and enrich their data
 */
export async function fetchAllTokens(): Promise<TokenItem[]> {
  try {
    const res = await fetch(`${COOKIE_APIS.scanApi}/api/tokens`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rawTokens = Array.isArray(json) ? json : json?.data || json?.tokens || [];

    // Parse and normalize tokens
    return rawTokens.map((t: any): TokenItem => {
      const pUsd = Number(t.price?.usd || 0);
      const pNative = Number(t.price?.native || 0);
      const chg = Number(t.price?.change24h || 0);
      const vol = Number(t.marketData?.volume24h || 0);
      const liq = Number(t.marketData?.liquidity || 0);
      const mcap = Number(t.marketData?.marketCap || 0);
      const holders = Number(t.marketData?.holderCount || 0);

      return {
        mint: t.mint,
        name: t.metadata?.name || t.symbol || "Unknown Cookie",
        symbol: t.metadata?.symbol || t.symbol || "COOKIE",
        logo: t.metadata?.logo || null,
        decimals: t.metadata?.decimals ?? 9,
        description: t.metadata?.description || "",
        priceUsd: isFinite(pUsd) ? pUsd : 0,
        priceNative: isFinite(pNative) ? pNative : 0,
        change24h: isFinite(chg) ? chg : 0,
        volume24h: isFinite(vol) ? vol : 0,
        liquidity: isFinite(liq) ? liq : 0,
        marketCap: isFinite(mcap) ? mcap : 0,
        holderCount: isFinite(holders) ? holders : 0,
      };
    });
  } catch (err) {
    console.warn("Falling back to local curated tokens due to API error:", err);
    return getCuratedFallbackTokens();
  }
}

/**
 * Fetch all active DEX markets / liquidity pools
 */
export async function fetchMarkets(): Promise<MarketItem[]> {
  try {
    const res = await fetch(`${COOKIE_APIS.scanApi}/api/markets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rawMarkets = Array.isArray(json) ? json : json?.data || json?.markets || [];

    return rawMarkets.map((m: any): MarketItem => {
      return {
        marketId: m.marketId,
        type: m.type || "DEX Pool",
        baseSymbol: m.baseToken?.symbol || "wCOOK",
        baseMint: m.baseToken?.mint || "",
        quoteSymbol: m.quoteToken?.symbol || "TOKEN",
        quoteMint: m.quoteToken?.mint || "",
        liquidityUsd: Number(m.liquidityUsd || 0),
        liquidityDisplay: m.liquidityDisplay || "",
      };
    });
  } catch (err) {
    console.warn("Could not fetch live markets:", err);
    return [];
  }
}

/**
 * Fetch live COOK USD price
 */
export async function fetchCookPrice(): Promise<number> {
  try {
    const res = await fetch(`${COOKIE_APIS.scanApi}/api/price/cook`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Number(json?.data?.price?.usd || 0.0000712);
  } catch {
    return 0.0000712; // default fallback
  }
}

function getCuratedFallbackTokens(): TokenItem[] {
  return [
    {
      mint: "So11111111111111111111111111111111111111112",
      name: "Cookie Chain Native",
      symbol: "COOK",
      logo: "https://www.cookiechain.wtf/cookie.jpeg",
      decimals: 9,
      description: "The native fuel of Cookie Chain SVM.",
      priceUsd: 0.0000712,
      priceNative: 1,
      change24h: 3.42,
      volume24h: 12450,
      liquidity: 450000,
      marketCap: 712000,
      holderCount: 1840,
    },
    {
      mint: "Ctgd1omtw7cWAWYh4SZXUT29dcmncBkMofm7cLrMpVa",
      name: "Baked COOK (Liquid Staked)",
      symbol: "bCOOK",
      logo: null,
      decimals: 9,
      description: "Yield-bearing liquid staked COOK token.",
      priceUsd: 0.0000715,
      priceNative: 1.004,
      change24h: 0.8,
      volume24h: 3400,
      liquidity: 95000,
      marketCap: 180000,
      holderCount: 420,
    },
    {
      mint: "C4yVWDrwXeEUapmw3BkvktHBxCSsM8MfJ3aPVuFonFi5",
      name: "CookHouse Ecosystem",
      symbol: "COOKHOUSE",
      logo: null,
      decimals: 9,
      description: "Ecosystem governance and bakery token.",
      priceUsd: 0.000012,
      priceNative: 0.168,
      change24h: 12.5,
      volume24h: 5600,
      liquidity: 42000,
      marketCap: 120000,
      holderCount: 310,
    },
    {
      mint: "GNFqCqaU9R2jas4iaKEFZM5hiX5AHxBL7rPHTCpX5T6z",
      name: "TrashCoin Degen",
      symbol: "TRASHCOIN",
      logo: null,
      decimals: 9,
      description: "Pure community degen memecoin.",
      priceUsd: 0.00075,
      priceNative: 10.5,
      change24h: -4.2,
      volume24h: 8900,
      liquidity: 31000,
      marketCap: 95000,
      holderCount: 650,
    },
  ];
}
