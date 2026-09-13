import React, { useState, useEffect } from "react";
import { 
  ArrowDownUp, 
  Settings, 
  ExternalLink, 
  RefreshCw,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  FlaskConical,
  Zap
} from "lucide-react";
import { KNOWN_MINTS, COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { getSwapQuote, SwapQuote } from "../api/cookiebox";
import { playSuccessChime } from "../utils/audio";

interface SwapTerminalProps {
  wallet: {
    connected: boolean;
    publicKey: any;
    balanceCook: number;
    isSimulationMode: boolean;
    connectDemoMode: () => void;
    sendTransaction: (tx: any) => Promise<{ signature: string; isSimulated?: boolean }>;
  };
}

interface SwapResult {
  isSimulated: boolean;
  fromAmt: string;
  fromSymbol: string;
  toAmt: string;
  toSymbol: string;
  venue: string;
  latencyMs: number;
  signature?: string;
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
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);

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
    setSwapResult(null);
  };

  const toAmountCalculated = quote
    ? (parseFloat(quote.netOutAmount) / 1_000_000_000).toFixed(4)
    : (parseFloat(fromAmount || "0") * 0.995).toFixed(4);

  const handleExecuteSwap = async () => {
    if (!wallet.connected) {
      wallet.connectDemoMode();
      return;
    }

    setIsSwapping(true);
    setSwapResult(null);

    const startTime = Date.now();

    try {
      // Simulate high-speed SVM swap execution
      await new Promise((r) => setTimeout(r, 520));
      const elapsed = Date.now() - startTime;
      playSuccessChime();

      setSwapResult({
        isSimulated: wallet.isSimulationMode,
        fromAmt: fromAmount,
        fromSymbol: fromToken.symbol,
        toAmt: toAmountCalculated,
        toSymbol: toToken.symbol,
        venue: quote?.dexVenue || "Cookiebox DAMM v2",
        latencyMs: elapsed,
      });
    } catch (err: any) {
      console.error("Swap error:", err);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
              Cookiebox DEX Aggregator
            </h3>
            {wallet.isSimulationMode && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono text-amber-400 font-medium">
                Sandbox
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">Dynamic AMM Routing</p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-black/40 px-2 py-1 rounded border border-white/[0.05]">
          <SlidersHorizontal className="h-3 w-3" />
          <span>{slippage}% Slip</span>
        </div>
      </div>

      {/* Pay Box */}
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5">
        <div className="flex justify-between text-[11px] font-mono text-neutral-500 mb-1">
          <span>You Pay</span>
          <span>Bal: {wallet.balanceCook.toFixed(2)} COOK</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => {
              setFromAmount(e.target.value);
              setSwapResult(null);
            }}
            placeholder="0.0"
            className="w-full bg-transparent text-xl font-bold font-mono text-white outline-none"
          />

          <select
            value={fromToken.symbol}
            onChange={(e) => {
              const s = AVAILABLE_TOKENS.find((t) => t.symbol === e.target.value);
              if (s) {
                setFromToken(s);
                setSwapResult(null);
              }
            }}
            className="rounded-lg border border-white/[0.08] bg-[#161922] px-2.5 py-1.5 font-mono text-xs font-bold text-white outline-none cursor-pointer"
          >
            {AVAILABLE_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap Flip Icon */}
      <div className="flex justify-center -my-2.5 relative z-10">
        <button
          onClick={handleFlip}
          className="rounded-lg border border-white/[0.08] bg-[#161922] p-1.5 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40 transition active:scale-95 shadow"
          title="Invert tokens"
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Receive Box */}
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5">
        <div className="flex justify-between text-[11px] font-mono text-neutral-500 mb-1">
          <span>You Receive</span>
          <span>{isLoadingQuote ? "Routing..." : "Best Execution"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-bold font-mono text-amber-300">
            {isLoadingQuote ? <span className="animate-pulse">...</span> : toAmountCalculated}
          </div>

          <select
            value={toToken.symbol}
            onChange={(e) => {
              const s = AVAILABLE_TOKENS.find((t) => t.symbol === e.target.value);
              if (s) {
                setToToken(s);
                setSwapResult(null);
              }
            }}
            className="rounded-lg border border-white/[0.08] bg-[#161922] px-2.5 py-1.5 font-mono text-xs font-bold text-white outline-none cursor-pointer"
          >
            {AVAILABLE_TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route Breakdown */}
      {quote && (
        <div className="mt-3.5 rounded-lg border border-white/[0.04] bg-black/20 p-2.5 text-[10px] font-mono space-y-1 text-neutral-400">
          <div className="flex justify-between">
            <span>Route</span>
            <span className="text-neutral-200 flex items-center gap-1">
              <span>{fromToken.symbol}</span>
              <ArrowRight className="h-2.5 w-2.5" />
              <span className="text-amber-400">{quote.dexVenue}</span>
              <ArrowRight className="h-2.5 w-2.5" />
              <span>{toToken.symbol}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span className="text-emerald-400">&lt;0.05%</span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee</span>
            <span className="text-neutral-300">~0.000005 COOK ($0.0000004)</span>
          </div>
        </div>
      )}

      {/* Slippage Pills */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
        <span>Slippage Tolerance:</span>
        <div className="flex gap-1">
          {["0.1", "0.5", "1.0"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlippage(s)}
              className={`rounded px-1.5 py-0.5 text-[10px] transition ${
                slippage === s ? "bg-amber-500/20 text-amber-300 font-bold" : "text-neutral-500 hover:text-white"
              }`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleExecuteSwap}
        disabled={isSwapping}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] py-3 text-xs font-bold text-neutral-950 transition disabled:opacity-50 shadow-lg shadow-amber-500/10"
      >
        {isSwapping ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Settling on Cookie Chain...</span>
          </>
        ) : (
          <span>{wallet.isSimulationMode ? "Simulate Swap in Sandbox" : "Execute Swap"}</span>
        )}
      </button>

      {/* Honest Settled Feedback */}
      {swapResult && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs font-mono animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Sandbox Swap Simulated ({swapResult.latencyMs}ms)</span>
            </div>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300">
              0 Gas Spent
            </span>
          </div>

          <p className="text-[11px] text-neutral-300 font-sans">
            Swapped {swapResult.fromAmt} {swapResult.fromSymbol} → {swapResult.toAmt} {swapResult.toSymbol} via {swapResult.venue}.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
            <span className="text-neutral-500">Live DEX Venue:</span>
            <a
              href="https://cookiebox.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:underline"
            >
              <span>Launch Cookiebox AMM</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
