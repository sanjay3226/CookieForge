import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Search, 
  RefreshCw,
  ArrowUpRight
} from "lucide-react";
import { fetchAllTokens, fetchCookPrice, TokenItem } from "../api/cookiescan";
import { formatUsd, formatNumber, shortenAddress } from "../utils/format";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

interface MarketRadarProps {
  onSelectToken?: (token: TokenItem) => void;
}

export const MarketRadar: React.FC<MarketRadarProps> = () => {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [cookPrice, setCookPrice] = useState<number>(0.0000712);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [tokenList, price] = await Promise.all([fetchAllTokens(), fetchCookPrice()]);
      setTokens(tokenList);
      setCookPrice(price);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTokens = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.mint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06] mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
            Cookie Chain Market Radar
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Streaming real-time token metrics via api.cookiescan.io
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1 font-mono text-xs">
            <span className="text-neutral-500 mr-1.5">COOK</span>
            <span className="font-bold text-amber-300">${cookPrice.toFixed(8)}</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-neutral-400 hover:text-white transition active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
        <input
          type="text"
          placeholder="Filter tokens by name, symbol, or mint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-8 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] uppercase text-neutral-500">
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Price (USD)</th>
              <th className="py-2.5 px-3">24h</th>
              <th className="py-2.5 px-3">Liquidity / Vol</th>
              <th className="py-2.5 px-3">Holders</th>
              <th className="py-2.5 px-3 text-right">Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTokens.slice(0, 10).map((t) => (
              <tr key={t.mint} className="hover:bg-white/[0.02] transition">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-white/[0.05] border border-white/[0.08] grid place-items-center text-[10px] font-bold text-amber-300">
                      {t.symbol[0]}
                    </div>
                    <div>
                      <div className="font-sans font-bold text-white text-xs">{t.name}</div>
                      <span className="text-[10px] text-neutral-500">{shortenAddress(t.mint, 4)}</span>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 text-neutral-200">
                  {formatUsd(t.priceUsd)}
                </td>

                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                      t.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {t.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {t.change24h > 0 ? `+${t.change24h.toFixed(1)}` : t.change24h.toFixed(1)}%
                  </span>
                </td>

                <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                  <div>${formatNumber(t.liquidity)}</div>
                  <div className="text-[10px] text-neutral-500">${formatNumber(t.volume24h)} vol</div>
                </td>

                <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                  {t.holderCount.toLocaleString()}
                </td>

                <td className="py-2.5 px-3 text-right">
                  <a
                    href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/token/${t.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex p-1 text-neutral-500 hover:text-amber-400 transition"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
