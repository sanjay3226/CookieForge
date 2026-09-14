import React, { useState } from "react";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  Settings2, 
  Activity,
  Terminal,
  Power,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { ChainState } from "../hooks/useCookieChain";
import { shortenAddress } from "../utils/format";
import { COOKIE_CHAIN_CONFIG, CREATOR_WALLET } from "../utils/constants";

interface HeaderProps {
  chainState: ChainState;
  wallet: {
    connected: boolean;
    connecting: boolean;
    publicKey: any;
    walletName: string | null;
    walletType: string | null;
    balanceCook: number;
    connectNightly: () => Promise<void>;
    connectStandard: (type: "phantom" | "solflare") => Promise<void>;
    disconnect: () => Promise<void>;
  };
  onOpenNetworkGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  chainState, 
  wallet, 
  onOpenNetworkGuide 
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCreator, setCopiedCreator] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const handleCopy = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCreator = () => {
    navigator.clipboard.writeText(CREATOR_WALLET);
    setCopiedCreator(true);
    setTimeout(() => setCopiedCreator(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07090e]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Network */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 shadow-md shadow-amber-500/10">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">CookieForge</span>
                <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-amber-300">
                  SVM MAINNET
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono hidden sm:block">
                High-Performance Infrastructure Terminal
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-white/[0.08] hidden lg:block" />

          {/* Network Telemetry */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-neutral-200 font-medium">RPC Connected</span>
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
              className="text-neutral-500 hover:text-amber-400 transition p-1"
              title="View Cookie Chain RPC Endpoints"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Creator Badge & Wallet Connect */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Creator & Deployer Identification Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-1.5 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-neutral-500">Creator:</span>
            <span className="text-neutral-200 font-semibold">{shortenAddress(CREATOR_WALLET, 4)}</span>
            <button
              onClick={handleCopyCreator}
              className="ml-1 text-neutral-500 hover:text-amber-300 transition"
              title="Copy Creator Address"
            >
              {copiedCreator ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
            <a
              href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${CREATOR_WALLET}`}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-amber-300 transition ml-0.5"
              title="View on CookieScan"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {!wallet.connected ? (
            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                disabled={wallet.connecting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] px-4 py-2 text-xs font-bold text-neutral-950 transition shadow-lg shadow-amber-500/15"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{wallet.connecting ? "Connecting..." : "Connect Wallet"}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {walletMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.1] bg-[#0f1218] p-2 shadow-2xl z-50 animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-neutral-500 border-b border-white/[0.06] mb-1.5 flex justify-between">
                    <span>Select SVM Wallet</span>
                    <span className="text-amber-400">Cookie Chain</span>
                  </div>

                  {/* Nightly (Recommended) */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectNightly().catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs text-neutral-200 hover:bg-white/[0.06] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs grid place-items-center font-bold">N</div>
                      <div className="text-left">
                        <div className="font-semibold text-white">Nightly Wallet</div>
                        <div className="text-[10px] text-neutral-500">Official Cookie Chain SVM</div>
                      </div>
                    </div>
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 font-bold">Native</span>
                  </button>

                  {/* Phantom */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectStandard("phantom").catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-200 hover:bg-white/[0.06] transition"
                  >
                    <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono text-xs grid place-items-center font-bold">P</div>
                    <span className="font-medium">Phantom</span>
                  </button>

                  {/* Solflare */}
                  <button
                    onClick={() => {
                      setWalletMenuOpen(false);
                      wallet.connectStandard("solflare").catch((e) => alert(e.message));
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-200 hover:bg-white/[0.06] transition"
                  >
                    <div className="h-6 w-6 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-xs grid place-items-center font-bold">S</div>
                    <span className="font-medium">Solflare</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0f1218] p-1.5 text-xs shadow-md">
              {/* Balance */}
              <div className="px-2.5 py-1 font-mono text-neutral-200 font-bold text-xs flex items-center gap-1.5">
                <span>{wallet.balanceCook.toFixed(4)}</span>
                <span className="text-amber-400 text-[10px]">COOK</span>
              </div>

              <div className="h-4 w-px bg-white/[0.1]" />

              {/* Address */}
              <div className="flex items-center gap-1 pl-1 font-mono text-[11px] text-neutral-300">
                <span>{wallet.publicKey ? shortenAddress(wallet.publicKey.toBase58(), 4) : ""}</span>

                <button
                  onClick={handleCopy}
                  className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white transition"
                  title="Copy address"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>

                {wallet.publicKey && (
                  <a
                    href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${wallet.publicKey.toBase58()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-amber-400 transition"
                    title="View on CookieScan"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <button
                  onClick={wallet.disconnect}
                  className="rounded p-1 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 transition ml-1"
                  title="Disconnect Wallet"
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
