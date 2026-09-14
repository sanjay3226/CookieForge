import React, { useState, useEffect } from "react";
import { 
  ArrowDownUp, 
  ExternalLink, 
  RefreshCw,
  Layers,
  SlidersHorizontal,
  ArrowRight,
  Zap,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { KNOWN_MINTS, COOKIE_CHAIN_CONFIG, COOKIE_PROGRAMS } from "../utils/constants";
import { getSwapQuote, SwapQuote } from "../api/cookiebox";
import { shortenAddress } from "../utils/format";

interface SwapTerminalProps {
  wallet: {
    connected: boolean;
    publicKey: any;
    balanceCook: number;
    connectNightly: () => Promise<void>;
  };
}

const AVAILABLE_TOKENS = [
  { symbol: "COOK", name: "Cookie Native", mint: KNOWN_MINTS.COOK, decimals: 9 },
  { symbol: "bCOOK", name: "Liquid Staked", mint: KNOWN_MINTS.bCOOK, decimals: 9 },
  { symbol: "COOKHOUSE", name: "CookHouse", mint: KNOWN_MINTS.COOKHOUSE, decimals: 9 },
  { symbol: "TRASHCOIN", name: "TrashCoin", mint: KNOWN_MINTS.TRASHCOIN, decimals: 9 },
  { symbol: "NOTHING", name: "Nothing Token", mint: KNOWN_MINTS.NOTHING, decimals: 9 },
  { symbol: "BUTT", name: "Butt Token", mint: KNOWN_MINTS.BUTT, decimals: 9 },
];

export const SwapTerminal: React.FC<SwapTerminalProps> = ({ wallet }) => {
  const [fromToken, setFromToken] = useState(AVAILABLE_TOKENS[0]);
  const [toToken, setToToken] = useState(AVAILABLE_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("10");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const num = parseFloat(fromAmount);
    if (isNaN(num) || num <= 0) {
      setQuote(null);
      return;
    }

    setIsLoadingQuote(true);
    getSwapQuote(fromToken.mint, toToken.mint, num, parseFloat(slippage) || 0.5)
      .then((q) => {
        if (active) {
          setQuote(q);
          setIsLoadingQuote(false);
        }
      })
      .catch(() => {
        if (active) setIsLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [fromToken, toToken, fromAmount, slippage]);

  const handleFlip = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const toAmountCalculated = quote
    ? (parseFloat(quote.netOutAmount) / 1_000_000_000).toFixed(4)
    : (parseFloat(fromAmount || "0") * 0.995).toFixed(4);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMint(id);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const handleConnect = async () => {
    try {
      setConnectError(null);
      await wallet.connectNightly();
    } catch (e: any) {
      setConnectError(e?.message || "Failed to connect wallet.");
    }
  };

  // Construct direct deep-link to Cookiebox DEX
  const cookieboxSwapUrl = `https://cookiebox.fun`;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400 font-semibold mb-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COOKIEBOX DEX</span>
            </div>
            <h3 className="text-base font-bold text-white"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Swap Tokens
            </h3>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Get a live quote and trade on Cookiebox DEX.
            </p>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <SlidersHorizontal className="h-3 w-3" />
            <span>{slippage}% Slip</span>
          </div>
        </div>

        {/* From Box */}
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 mb-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-500 mb-1.5">
            <span>You Pay</span>
            <span>Balance: {wallet.connected ? wallet.balanceCook.toFixed(4) : "0.00"} COOK</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-bold font-mono text-white outline-none"
            />

            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const found = AVAILABLE_TOKENS.find((t) => t.symbol === e.target.value);
                if (found) setFromToken(found);
              }}
              className="rounded-xl border border-white/[0.08] bg-[#161a24] px-3 py-2 text-xs font-mono font-bold text-white outline-none cursor-pointer hover:border-amber-500/50 transition"
            >
              {AVAILABLE_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleFlip}
            className="rounded-full border border-white/[0.1] bg-[#1a1f2c] p-2 text-neutral-400 hover:text-amber-400 hover:border-amber-500/50 transition shadow-lg active:scale-90"
            title="Switch Pair Direction"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* To Box */}
        <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 mt-2 mb-4">
          <div className="flex justify-between items-center text-[11px] font-mono text-neutral-500 mb-1.5">
            <span>You Receive (Estimated)</span>
            <span className="text-emerald-400">Best Route</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-bold font-mono text-white">
              {isLoadingQuote ? (
                <span className="text-neutral-500 animate-pulse">Calculating...</span>
              ) : (
                toAmountCalculated
              )}
            </div>

            <select
              value={toToken.symbol}
              onChange={(e) => {
                const found = AVAILABLE_TOKENS.find((t) => t.symbol === e.target.value);
                if (found) setToToken(found);
              }}
              className="rounded-xl border border-white/[0.08] bg-[#161a24] px-3 py-2 text-xs font-mono font-bold text-white outline-none cursor-pointer hover:border-amber-500/50 transition"
            >
              {AVAILABLE_TOKENS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Details Panel */}
        <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3.5 text-[11px] font-mono space-y-1.5 text-neutral-400 mb-4">
          <div className="flex justify-between items-center">
            <span>Route</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Cookiebox DEX</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>Price impact</span>
            <span className="text-emerald-400 font-semibold">
              {quote ? `&lt; ${quote.priceImpactPct}%` : "&lt; 0.05%"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span className="text-[#94a3b8] font-semibold">~0.000005 COOK</span>
          </div>
          <div className="flex justify-between">
            <span>Minimum received ({slippage}% slippage)</span>
            <span className="text-[#e2e8f0] font-semibold">
              {(parseFloat(toAmountCalculated) * (1 - parseFloat(slippage) / 100)).toFixed(4)}{" "}
              {toToken.symbol}
            </span>
          </div>
        </div>

        {/* Slippage Selection */}
        <div className="flex items-center justify-between text-xs font-mono mb-4 px-1">
          <span className="text-neutral-500 text-[11px]">Slippage Tolerance:</span>
          <div className="flex gap-1.5">
            {["0.1", "0.5", "1.0"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlippage(s)}
                className={`rounded-lg px-2.5 py-1 text-[10px] transition border ${
                  slippage === s 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold" 
                    : "border-white/[0.05] text-neutral-500 hover:text-white"
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Launch on Cookiebox */}
        <a
          href={cookieboxSwapUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-primary w-full py-3.5 text-xs"
        >
          <span>Swap on Cookiebox DEX</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Program ref */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#475569]">
          <span>Verified DEX Program:</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>{shortenAddress(COOKIE_PROGRAMS.cookieboxDammV2, 6)}</span>
            <button
              onClick={() => handleCopy(COOKIE_PROGRAMS.cookieboxDammV2, "damm")}
              className="hover:text-white transition"
              title="Copy DAMM Program ID"
            >
              {copiedMint === "damm" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {connectError && (
          <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center text-xs font-mono text-red-300">
            {connectError}
          </div>
        )}
      </div>
    </div>
  );
};
