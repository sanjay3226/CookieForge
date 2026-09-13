import React from "react";
import { 
  Trophy, 
  X, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Coins, 
  ArrowRightLeft, 
  Globe, 
  Layers, 
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

interface JudgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateDemo: () => void;
}

export const JudgeGuideModal: React.FC<JudgeGuideModalProps> = ({
  isOpen,
  onClose,
  onActivateDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-[#0f1218] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  Judge & Reviewer Fast-Track Guide
                </h3>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                  Bounty Review
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                CookieForge — High-Performance SVM Terminal & Ecosystem Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 text-xs text-neutral-300 leading-relaxed">
          {/* Key Callout: Zero Friction Testing */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px] uppercase tracking-wider mb-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span>Zero-Gas Sandbox Mode Enabled ($0 / 0 Friction)</span>
            </div>
            <p className="text-neutral-300">
              Judges and reviewers can test all SVM interactions immediately without installing browser extensions or acquiring testnet/mainnet COOK. Your session is loaded with <strong>420.69 demo COOK</strong> and an ephemeral SVM keypair to simulate sub-second finality.
            </p>
          </div>

          {/* Core Feature Matrix */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-2">
              What This cApp Demonstrates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>1. Inscription Engine</span>
                </div>
                <p className="text-neutral-400 font-sans text-xs">
                  Submits immutable UTF-8 memo instructions to Cookie Chain’s genesis Memo program with instant latency benchmarking and verifiable ledger logging.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>2. DEX Aggregator</span>
                </div>
                <p className="text-neutral-400 font-sans text-xs">
                  Simulated and live routing through Cookiebox Dynamic AMM pools with dynamic slippage controls and price impact calculations.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>3. .cook Name Registry</span>
                </div>
                <p className="text-neutral-400 font-sans text-xs">
                  Resolves domain records against the CookOven Name Service program, showing owner accounts and real-time registration pricing.
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Layers className="h-3.5 w-3.5" />
                  <span>4. Hyperlane Warp Bridge</span>
                </div>
                <p className="text-neutral-400 font-sans text-xs">
                  Telemetry on the cross-chain collateral route between Cookie Chain and Solana with live escrow PDA tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Real Network Verification */}
          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5 font-mono text-[11px] space-y-1.5">
            <div className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">
              Live Cookie Chain Telemetry
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-500">RPC Endpoint</span>
              <span>{COOKIE_CHAIN_CONFIG.rpcUrl}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-500">Explorer</span>
              <span>{COOKIE_CHAIN_CONFIG.explorerUrl}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-500">Supported Wallets</span>
              <span>Nightly (SVM Native), Phantom, Solflare</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
          <button
            onClick={() => {
              onActivateDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-neutral-950 transition active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Enter Zero-Gas Sandbox</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08] transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
