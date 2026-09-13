import React, { useState } from "react";
import { Search, ExternalLink, Globe, ArrowUpRight } from "lucide-react";
import { Connection } from "@solana/web3.js";
import { resolveDomain, DomainLookupResult } from "../api/domains";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { shortenAddress } from "../utils/format";

interface DomainResolverProps {
  connection: Connection;
}

export const DomainResolver: React.FC<DomainResolverProps> = ({ connection }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DomainLookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await resolveDomain(connection, query);
      setResult(res);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
            .cook Domain Registry (CookOven)
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono">
            Program: {shortenAddress("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX", 4)}
          </p>
        </div>
        <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
          Name Service
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search domain (e.g. chef, baker.cook) or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-8 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition"
        >
          {isSearching ? "..." : "Resolve"}
        </button>
      </form>

      {/* Suggested Quick Searches */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
        <span>Verified:</span>
        {["chef", "baker", "degen", "satoshi"].map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setQuery(name);
              resolveDomain(connection, name).then(setResult);
            }}
            className="rounded bg-white/[0.04] px-1.5 py-0.5 text-neutral-300 hover:text-amber-400 hover:bg-white/[0.08] transition"
          >
            {name}.cook
          </button>
        ))}
      </div>

      {/* Inspection Card */}
      {result && (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 p-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3">
            <div className="flex items-center gap-2 font-mono">
              <Globe className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-white">{result.name}</span>
            </div>

            <span
              className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                result.isRegistered
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
              }`}
            >
              {result.isRegistered ? "Registered" : "Available"}
            </span>
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            {result.isRegistered ? (
              <>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Owner Account</span>
                  <span className="text-white flex items-center gap-1">
                    {shortenAddress(result.owner || "", 6)}
                    <a
                      href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${result.owner}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      <ArrowUpRight className="h-3 w-3 inline" />
                    </a>
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Registration Status</span>
                  <span className="text-neutral-200">Active Record</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-neutral-400">
                <span>Registration Cost</span>
                <span className="font-bold text-amber-300">
                  {result.estimatedCostCook?.toLocaleString()} COOK
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
