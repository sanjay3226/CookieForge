import React, { useState, useEffect } from "react";
import { 
  ArrowRightLeft, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Layers,
  ArrowRight
} from "lucide-react";
import { Connection } from "@solana/web3.js";
import { getBridgeStatus, BridgeStatusInfo } from "../api/bridge";
import { shortenAddress } from "../utils/format";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

interface BridgeCompanionProps {
  connection: Connection;
}

export const BridgeCompanion: React.FC<BridgeCompanionProps> = ({ connection }) => {
  const [bridgeInfo, setBridgeInfo] = useState<BridgeStatusInfo | null>(null);
  const [bridgeAmount, setBridgeAmount] = useState("5000");
  const [direction, setDirection] = useState<"cookie-to-solana" | "solana-to-cookie">("cookie-to-solana");

  useEffect(() => {
    getBridgeStatus(connection).then(setBridgeInfo);
  }, [connection]);

  return (
    <div className="max-w-xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
            Hyperlane Warp Route Gateway
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono">Cookie Chain ⇄ Solana Mainnet</p>
        </div>

        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Route Active
        </span>
      </div>

      {/* Direction Selector */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.06] bg-black/40 p-1 mb-4 text-xs font-mono">
        <button
          type="button"
          onClick={() => setDirection("cookie-to-solana")}
          className={`rounded-lg py-1.5 transition ${
            direction === "cookie-to-solana"
              ? "bg-amber-500 text-neutral-950 font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Cookie → Solana
        </button>
        <button
          type="button"
          onClick={() => setDirection("solana-to-cookie")}
          className={`rounded-lg py-1.5 transition ${
            direction === "solana-to-cookie"
              ? "bg-amber-500 text-neutral-950 font-bold"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Solana → Cookie
        </button>
      </div>

      {/* Amount Input */}
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 mb-4">
        <div className="flex justify-between text-[11px] font-mono text-neutral-500 mb-1">
          <span>Transfer Amount</span>
          <span>1:1 Fixed Warp Ratio</span>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            value={bridgeAmount}
            onChange={(e) => setBridgeAmount(e.target.value)}
            className="w-full bg-transparent text-xl font-bold font-mono text-white outline-none"
          />
          <span className="font-mono font-bold text-amber-400 text-xs">COOK</span>
        </div>
      </div>

      {/* Route Architecture Metrics */}
      <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3 text-[11px] font-mono space-y-1.5 text-neutral-400 mb-4">
        <div className="flex justify-between">
          <span>Destination Collateral Reserve</span>
          <span className="text-white font-semibold">
            {bridgeInfo ? bridgeInfo.collateralReserveCook.toLocaleString() : "1,250,000"} COOK
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Delivery Time</span>
          <span className="text-emerald-400 font-semibold">~2 mins (Hyperlane Relayer)</span>
        </div>
        <div className="flex justify-between">
          <span>Cookie Collateral PDA</span>
          <span className="text-neutral-300">
            {shortenAddress("CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz", 4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Solana Escrow PDA</span>
          <span className="text-neutral-300">
            {shortenAddress("88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq", 4)}
          </span>
        </div>
      </div>

      <a
        href={COOKIE_CHAIN_CONFIG.bridgeUrl}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-xs font-bold text-neutral-950 transition"
      >
        <span>Open Hyperlane Warp Portal</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};
