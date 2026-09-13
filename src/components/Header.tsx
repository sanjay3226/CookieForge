import React, { useState } from "react";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  Settings2, 
  Activity,
  Terminal,
  ShieldCheck,
  Zap,
  Power,
  Trophy,
  RotateCcw
} from "lucide-react";
import { ChainState } from "../hooks/useCookieChain";
import { shortenAddress } from "../utils/format";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

interface HeaderProps {
  chainState: ChainState;
  wallet: {
    connected: boolean;
    connecting: boolean;
    publicKey: any;
    walletName: string | null;
    walletType: string | null;
    balanceCook: number;
    isSimulationMode: boolean;
    connectNightly: () => Promise<void>;
    connectStandard: (type: "phantom" | "solflare") => Promise<void>;
    connectDemoMode: () => void;
    resetDemoBalance?: () => void;
    disconnect: () => Promise<void>;
  };
  onOpenNetworkGuide: () => void;
  onOpenJudgeGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  chainState, 
  wallet, 
  onOpenNetworkGuide,
  onOpenJudgeGuide 
}) => {
  const [copied, setCopied] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const handleCopy = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-white text-sm sm:text-base">CookieForge</span>
              <span className="font-mono text-[10px] text-amber-400 font-bold">SVM</span>
              <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-mono text-neutral-400 hidden xs:inline">v1.0</span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden md:block" />

          {/* Network Telemetry */}
          <div className="hidden md:flex items-center gap-2.5 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-neutral-300 font-sans font-medium text-xs">Mainnet</span>
            </div>

            <span className="text-white/[0.15]">•</span>

            <div className="flex items-center gap-1">
              <span className="text-neutral-500">Slot</span>
              <span className="text-neutral-200 font-semibold">{chainState.slot.toLocaleString()}</span>
            </div>

            <span className="text-white/[0.15]">•</span>

            <div className="flex items-center gap-1 text-emerald-400">
              <Activity className="h-3 w-3" />
              <span>{chainState.pingMs}ms</span>
            </div>

            <button
              onClick={onOpenNetworkGuide}
              className="ml-0.5 text-neutral-500 hover:text-amber-400 transition p-1"
              title="View RPC Endpoints"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions & Wallets */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Judge Fast-Track Guide Button */}
          <button
            onClick={onOpenJudgeGuide}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300 transition active:scale-95"
            title="Fast-Track Guide for Hackathon Judges & Reviewers"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Judge Fast-Track</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {/* Sandbox Status Badge */}
          {wallet.isSimulationMode && (
            <div className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/5 px-2.5 py-1.5 text-[11px] font-mono text-amber-300">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>0-Gas Sandbox</span>
            </div>
          )}

          {!wallet.connected ? (
            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                disabled={wallet.connecting}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.98] px-3 py-1.5 text-xs font-bold text-neutral-950 transition shadow-sm"
              >
                <span>{wallet.connecting ? "Connecting..." : "Connect Wallet"}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {walletMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-white/[0.08] bg-[#0f1218] p-1.5 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-500 border-b border-white/[0.05] mb-1">
                    Select SVM Wallet
                  </div>

                  {/* Nightly */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectNightly().catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] grid place-items-center font-bold">N</div>
                      <span className="font-medium">Nightly Wallet</span>
                    </div>
                    <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-mono text-amber-400">SVM Native</span>
                  </button>

                  {/* Phantom */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectStandard("phantom").catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                  >
                    <div className="h-5 w-5 rounded bg-purple-500/20 text-purple-400 font-mono text-[10px] grid place-items-center font-bold">P</div>
                    <span className="font-medium">Phantom</span>
                  </button>

                  {/* Solflare */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectStandard("solflare").catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                  >
                    <div className="h-5 w-5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] grid place-items-center font-bold">S</div>
                    <span className="font-medium">Solflare</span>
                  </button>

                  <div className="h-px bg-white/[0.06] my-1" />

                  {/* Sandbox Mode */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectDemoMode();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-amber-300 hover:bg-amber-500/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span className="font-medium">Zero-Gas Sandbox</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">$0 Test</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-white/[0.08] bg-[#0f1218] p-1 text-xs">
              {/* Balance */}
              <div className="px-2 py-0.5 font-mono text-neutral-200 font-medium text-xs">
                {wallet.balanceCook.toFixed(2)}{" "}
                <span className="text-neutral-500 text-[10px]">
                  {wallet.isSimulationMode ? "DEMO COOK" : "COOK"}
                </span>
              </div>

              {/* Reset Demo Balance if in simulation */}
              {wallet.isSimulationMode && wallet.resetDemoBalance && (
                <button
                  onClick={wallet.resetDemoBalance}
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.05] hover:text-amber-300 transition"
                  title="Reset Demo Balance to 420.69 COOK"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}

              <div className="h-3 w-px bg-white/[0.08]" />

              {/* Address / Actions */}
              <div className="flex items-center gap-0.5 sm:gap-1 pl-1">
                <span 
                  className="font-mono text-neutral-400 text-[11px]" 
                  title={wallet.isSimulationMode ? "Ephemeral Sandbox Keypair" : wallet.publicKey?.toBase58()}
                >
                  {wallet.publicKey ? shortenAddress(wallet.publicKey.toBase58(), 3) : "Demo"}
                </span>

                <button
                  onClick={handleCopy}
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.05] hover:text-white transition"
                  title="Copy address"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>

                {/* Only link to CookieScan if NOT a simulated demo key */}
                {!wallet.isSimulationMode && wallet.publicKey && (
                  <a
                    href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${wallet.publicKey.toBase58()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-1 text-neutral-400 hover:bg-white/[0.05] hover:text-amber-400 transition"
                    title="View on CookieScan"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Switch / Connect Real Wallet Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                    className="rounded p-1 text-neutral-400 hover:bg-white/[0.05] hover:text-amber-300 transition"
                    title={wallet.isSimulationMode ? "Switch to Real Wallet" : "Change Wallet"}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#0f1218] p-1.5 shadow-2xl z-50 animate-in fade-in">
                      <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-500 border-b border-white/[0.05] mb-1">
                        Connect Real Wallet
                      </div>

                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          wallet.connectNightly().catch((e) => alert(e.message));
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                      >
                        <span className="font-medium">Nightly (SVM)</span>
                        <span className="text-[9px] font-mono text-amber-400">Recommended</span>
                      </button>

                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          wallet.connectStandard("phantom").catch((e) => alert(e.message));
                        }}
                        className="flex w-full items-center rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                      >
                        <span className="font-medium">Phantom</span>
                      </button>

                      <button
                        onClick={() => {
                          setWalletMenuOpen(false);
                          wallet.connectStandard("solflare").catch((e) => alert(e.message));
                        }}
                        className="flex w-full items-center rounded-lg px-2.5 py-2 text-xs text-neutral-200 hover:bg-white/[0.05] transition"
                      >
                        <span className="font-medium">Solflare</span>
                      </button>

                      {!wallet.isSimulationMode && (
                        <>
                          <div className="h-px bg-white/[0.06] my-1" />
                          <button
                            onClick={() => {
                              setWalletMenuOpen(false);
                              wallet.connectDemoMode();
                            }}
                            className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-amber-400 hover:bg-amber-500/10 transition"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Return to Sandbox ($0)</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={wallet.disconnect}
                  className="rounded p-1 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition"
                  title="Disconnect"
                >
                  <Power className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
