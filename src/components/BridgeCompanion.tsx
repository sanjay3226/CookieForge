import React, { useState, useEffect } from "react";
import { 
  ArrowRightLeft, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowRight,
  Copy,
  Check,
  Zap,
  Globe,
  Coins,
  Cpu,
  FileCode2,
  Trophy,
  CheckCircle2
} from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getBridgeStatus, BridgeStatusInfo } from "../api/bridge";
import { shortenAddress } from "../utils/format";
import { COOKIE_CHAIN_CONFIG, COOKIE_PROGRAMS, KNOWN_MINTS } from "../utils/constants";

interface BridgeCompanionProps {
  connection: Connection;
}

interface EcosystemPortal {
  id: string;
  name: string;
  category: "Bridge" | "DEX" | "Identity" | "Explorer" | "Docs" | "Bounty";
  tagline: string;
  description: string;
  url: string;
  programId?: string;
  statusText: string;
  specs: { label: string; value: string }[];
  accentColor: string;
}

const ECOSYSTEM_PORTALS: EcosystemPortal[] = [
  {
    id: "hyperlane",
    name: "Hyperlane Warp Route",
    category: "Bridge",
    tagline: "Canonical Cookie Chain ⇄ Solana Mainnet Bridge",
    description: "Institutional cross-chain warp route powered by Hyperlane Interchain Security Modules (ISM). Enables instant 1:1 transfers of native COOK and liquid staked bCOOK between Cookie Chain SVM and Solana Mainnet.",
    url: COOKIE_CHAIN_CONFIG.bridgeUrl,
    programId: COOKIE_PROGRAMS.bridgeWarpCookie,
    statusText: "Route Operational",
    specs: [
      { label: "Warp Ratio", value: "1:1 Fixed Peg" },
      { label: "Finality", value: "< 2 mins" },
      { label: "Security", value: "Hyperlane ISM Relayers" },
      { label: "Supported Assets", value: "COOK, bCOOK, SOL" },
    ],
    accentColor: "from-amber-500 to-amber-600",
  },
  {
    id: "cookiebox",
    name: "Cookiebox DEX & AMM",
    category: "DEX",
    tagline: "Ecosystem Liquidity & Concentrated AMM Pools",
    description: "The primary decentralized exchange on Cookie Chain. Trade native COOK, bCOOK, and community tokens with concentrated liquidity, dynamic pool fees, and sub-cent execution fees.",
    url: "https://cookiebox.fun",
    programId: COOKIE_PROGRAMS.cookieboxDammV2,
    statusText: "Pools Active",
    specs: [
      { label: "Architecture", value: "DAMM v2 & CLMM" },
      { label: "Avg Gas", value: "0.000005 COOK" },
      { label: "Trading Pairs", value: "COOK/bCOOK, COOK/COOKHOUSE" },
      { label: "Settlement", value: "< 800ms Finality" },
    ],
    accentColor: "from-purple-500 to-indigo-600",
  },
  {
    id: "cookoven",
    name: "CookOven .cook Registry",
    category: "Identity",
    tagline: "Decentralized SVM Domain Service",
    description: "The native naming protocol on Cookie Chain adhering to the Solana Name Service (SNS) standard. Mint, transfer, and link human-readable .cook domain handles to SVM public keys.",
    url: "https://cookoven.com",
    programId: COOKIE_PROGRAMS.nameService,
    statusText: "Registry Online",
    specs: [
      { label: "Format", value: "*.cook" },
      { label: "Standard", value: "Solana Name Service (SNS)" },
      { label: "Lookup Speed", value: "< 25ms RPC Resolution" },
      { label: "Ownership", value: "Self-Sovereign PDA State" },
    ],
    accentColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "cookiescan",
    name: "CookieScan Ledger Explorer",
    category: "Explorer",
    tagline: "Real-Time Institutional Block Explorer & Analyzer",
    description: "The authoritative SVM block explorer for Cookie Chain. Inspect live block slots, transaction traces, Anchor smart contract accounts, token holder distributions, and network validator metrics.",
    url: COOKIE_CHAIN_CONFIG.explorerUrl,
    statusText: "Live Feed",
    specs: [
      { label: "Slot Time", value: "~400ms" },
      { label: "RPC Endpoint", value: "rpc.cookiescan.io" },
      { label: "WSS Stream", value: "wss.cookiescan.io" },
      { label: "Features", value: "PDA & Anchor State Decoder" },
    ],
    accentColor: "from-blue-500 to-cyan-600",
  },
  {
    id: "docs",
    name: "Cookie Chain Docs & DevKit",
    category: "Docs",
    tagline: "Anchor Runtime & Infrastructure Guide",
    description: "Official documentation covering Cookie Chain architecture, Genesis parameters, Anchor contract compilation, RPC rate limits, and custom SVM instructions for dApp builders.",
    url: COOKIE_CHAIN_CONFIG.docsUrl,
    statusText: "Updated v0.30",
    specs: [
      { label: "SVM Version", value: "Solana 1.18+ / Agave" },
      { label: "Anchor Framework", value: "v0.30.1" },
      { label: "Chain Domain", value: "420042004" },
      { label: "Language Support", value: "Rust & TypeScript SDK" },
    ],
    accentColor: "from-neutral-600 to-neutral-800",
  },
  {
    id: "superteam",
    name: "Superteam Earn Bounty Hub",
    category: "Bounty",
    tagline: "Build a cApp on Cookie Chain ($2,500 USDC)",
    description: "Official Superteam Earn bounty competition empowering engineers to build production-grade, stateful decentralized applications on the high-performance Cookie Chain SVM network.",
    url: "https://earn.superteam.fun/listings/bounties/build-a-capp-on-cookie-chain",
    statusText: "Submission Active",
    specs: [
      { label: "Prize Pool", value: "$2,500 USDC" },
      { label: "Evaluation", value: "Anchor Contract, UX, SVM Fit" },
      { label: "Network", value: "Cookie Chain SVM Mainnet" },
      { label: "Submission Deadline", value: "September 2026" },
    ],
    accentColor: "from-rose-500 to-amber-600",
  },
];

export const BridgeCompanion: React.FC<BridgeCompanionProps> = ({ connection }) => {
  const [bridgeInfo, setBridgeInfo] = useState<BridgeStatusInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    getBridgeStatus(connection).then(setBridgeInfo);
  }, [connection]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const categories = ["All", "Bridge", "DEX", "Identity", "Explorer", "Docs", "Bounty"];

  const filteredPortals = selectedCategory === "All" 
    ? ECOSYSTEM_PORTALS 
    : ECOSYSTEM_PORTALS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Visual Hyperlane Warp Route Topology Pipeline */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0e121a]/90 via-[#0a0d14]/80 to-[#07090e]/90 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-semibold mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HYPERLANE WARP ROUTE PIPELINE</span>
              <span className="text-neutral-600">•</span>
              <span className="text-emerald-400">Mainnet Route Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Institutional Cross-Chain Gateway
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1 max-w-2xl">
              Bidirectional warp bridge routing native <span className="text-amber-300 font-bold">COOK</span> and <span className="text-amber-300 font-bold">bCOOK</span> between Cookie Chain SVM and Solana Mainnet with sub-2min relayer settlement.
            </p>
          </div>

          <a
            href={COOKIE_CHAIN_CONFIG.bridgeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] px-5 py-2.5 text-xs font-bold text-neutral-950 transition shadow-lg shadow-amber-500/15 whitespace-nowrap self-start md:self-auto"
          >
            <span>Launch Warp Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Visual Route Diagram */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Node 1: Cookie Chain SVM */}
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 relative">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="text-amber-400 font-bold">SOURCE NETWORK</span>
              <span className="text-[10px] text-neutral-500">Chain ID: 420042004</span>
            </div>
            <div className="text-base font-bold text-white mb-1">Cookie Chain SVM</div>
            <div className="text-[11px] text-neutral-400 space-y-1 mt-3 pt-3 border-t border-white/[0.05]">
              <div className="flex justify-between">
                <span>Asset:</span>
                <span className="text-amber-300 font-semibold">Native COOK</span>
              </div>
              <div className="flex justify-between">
                <span>Mailbox PDA:</span>
                <span className="text-neutral-300">{shortenAddress(COOKIE_PROGRAMS.bridgeMailbox, 4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Warp Program:</span>
                <span className="text-neutral-300">{shortenAddress(COOKIE_PROGRAMS.bridgeWarpCookie, 4)}</span>
              </div>
            </div>
          </div>

          {/* Node 2: Hyperlane Relayer & Mailbox */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="text-amber-300 font-bold">INTERCHAIN PROTOCOL</span>
                <span className="text-[10px] text-emerald-400 font-semibold">ISM Verified</span>
              </div>
              <div className="text-base font-bold text-white mb-1">Hyperlane v3 Relayer</div>
              <p className="text-[10px] text-neutral-400 font-sans mt-1">
                Zero-slippage warp collateral lock & mint mechanism secured by independent validators.
              </p>
            </div>

            <div className="text-[11px] text-neutral-300 space-y-1 mt-3 pt-3 border-t border-amber-500/10">
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-semibold">&lt; 2 mins</span>
              </div>
              <div className="flex justify-between">
                <span>Peg Ratio:</span>
                <span className="text-amber-300 font-semibold">1:1 Exact</span>
              </div>
              <div className="flex justify-between">
                <span>Collateral:</span>
                <span className="text-white font-semibold">
                  {bridgeInfo ? bridgeInfo.collateralReserveCook.toLocaleString() : "1,250,000"} COOK
                </span>
              </div>
            </div>
          </div>

          {/* Node 3: Solana Mainnet */}
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 relative">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="text-purple-400 font-bold">DESTINATION NETWORK</span>
              <span className="text-[10px] text-neutral-500">Solana L1 Mainnet</span>
            </div>
            <div className="text-base font-bold text-white mb-1">Solana Mainnet</div>
            <div className="text-[11px] text-neutral-400 space-y-1 mt-3 pt-3 border-t border-white/[0.05]">
              <div className="flex justify-between">
                <span>Token Standard:</span>
                <span className="text-neutral-200">Token-2022 Bridged</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow PDA:</span>
                <span className="text-neutral-300">{shortenAddress("88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq", 4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Mint (Solana):</span>
                <span className="text-neutral-300">{shortenAddress(KNOWN_MINTS.COOK_SOLANA, 4)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified On-Chain Route Addresses */}
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Verified On-Chain Contract Registry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg">
              <div className="text-neutral-400">Cookie Collateral PDA:</div>
              <div className="flex items-center gap-1.5 text-neutral-200">
                <span>{shortenAddress("CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz", 6)}</span>
                <button
                  onClick={() => handleCopy("CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz", "collat")}
                  className="text-neutral-400 hover:text-white p-1 rounded transition"
                  title="Copy Address"
                >
                  {copiedKey === "collat" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg">
              <div className="text-neutral-400">Solana Escrow PDA:</div>
              <div className="flex items-center gap-1.5 text-neutral-200">
                <span>{shortenAddress("88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq", 6)}</span>
                <button
                  onClick={() => handleCopy("88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq", "escrow")}
                  className="text-neutral-400 hover:text-white p-1 rounded transition"
                  title="Copy Address"
                >
                  {copiedKey === "escrow" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Ecosystem Portals Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-400" />
              <span>Official Cookie Chain Ecosystem Portals & Launchpad</span>
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Verified infrastructure gateways and smart contract applications across the SVM network.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 transition border ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-neutral-950 font-bold border-amber-400"
                    : "border-white/[0.08] bg-black/40 text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => (
            <div
              key={portal.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0f16]/90 p-5 flex flex-col justify-between shadow-xl hover:border-amber-500/40 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[9px] font-mono uppercase font-bold text-neutral-300">
                    {portal.category}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{portal.statusText}</span>
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                  {portal.name}
                </h4>
                <div className="text-[11px] font-mono text-amber-400/90 font-medium mt-0.5">
                  {portal.tagline}
                </div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed font-sans line-clamp-3">
                  {portal.description}
                </p>

                {/* Specs List */}
                <div className="mt-4 pt-3 border-t border-white/[0.05] space-y-1.5 font-mono text-[11px]">
                  {portal.specs.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-neutral-400">
                      <span>{s.label}:</span>
                      <span className="text-neutral-200 font-semibold">{s.value}</span>
                    </div>
                  ))}

                  {portal.programId && (
                    <div className="flex items-center justify-between text-neutral-400 pt-1">
                      <span>Program ID:</span>
                      <div className="flex items-center gap-1 text-neutral-300">
                        <span>{shortenAddress(portal.programId, 4)}</span>
                        <button
                          onClick={() => handleCopy(portal.programId!, portal.id)}
                          className="hover:text-amber-400 transition"
                          title="Copy Program ID"
                        >
                          {copiedKey === portal.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-neutral-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-white/[0.06]">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-neutral-950 border border-white/[0.08] hover:border-amber-400 py-2.5 text-xs font-bold font-mono text-neutral-200 transition active:scale-[0.98]"
                >
                  <span>Launch {portal.name}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
