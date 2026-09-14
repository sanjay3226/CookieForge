import React, { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Settings2,
  Activity,
  Feather,
  Power,
  Wallet,
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
    connectInjected: () => Promise<void>;
    disconnect: () => Promise<void>;
  };
  onOpenNetworkGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ chainState, wallet, onOpenNetworkGuide }) => {
  const [copied, setCopied] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const err = (msg: string) => {
    setConnectError(msg);
    setTimeout(() => setConnectError(null), 5000);
  };

  const copyAddr = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#07090e]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Feather className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              CookieForge
            </span>
            <span className="ml-2 rounded-full bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 text-[9px] font-mono text-amber-300">
              MAINNET
            </span>
          </div>

          {/* Network status – shown only on wide screens */}
          <div className="hidden lg:flex items-center gap-3 ml-4 text-[11px] font-mono text-[#64748b]">
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Connected
            </span>
            <span>Block {chainState.slot.toLocaleString()}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {chainState.pingMs}ms
            </span>
            <button
              onClick={onOpenNetworkGuide}
              title="Network setup guide"
              className="text-[#475569] hover:text-amber-400"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {!wallet.connected ? (
            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                disabled={wallet.connecting}
                className="btn-primary text-xs py-2 px-3"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{wallet.connecting ? "Connecting…" : "Connect Wallet"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {walletMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/[0.1] bg-[#0f1218] p-2 shadow-2xl z-50 anim-slide-down"
                  onMouseLeave={() => setWalletMenuOpen(false)}
                >
                  <p className="px-3 pb-1.5 pt-1 text-[10px] font-mono text-[#475569] uppercase tracking-wider border-b border-white/[0.06] mb-1">
                    Choose your wallet
                  </p>

                  {[
                    {
                      label: "Nightly",
                      sub: "Best for Cookie Chain",
                      badge: "Recommended",
                      color: "text-indigo-400 bg-indigo-500/20",
                      act: () => wallet.connectNightly().catch((e) => err(e.message)),
                    },
                    {
                      label: "Phantom",
                      sub: "Popular Solana wallet",
                      color: "text-purple-400 bg-purple-500/20",
                      act: () => wallet.connectStandard("phantom").catch((e) => err(e.message)),
                    },
                    {
                      label: "Solflare",
                      sub: "Solana wallet",
                      color: "text-orange-400 bg-orange-500/20",
                      act: () => wallet.connectStandard("solflare").catch((e) => err(e.message)),
                    },
                    {
                      label: "Other Wallet",
                      sub: "Any browser SVM wallet",
                      color: "text-emerald-400 bg-emerald-500/20",
                      act: () => wallet.connectInjected().catch((e) => err(e.message)),
                    },
                  ].map(({ label, sub, badge, color, act }) => (
                    <button
                      key={label}
                      onClick={() => { setWalletMenuOpen(false); act(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[#e2e8f0] hover:bg-white/[0.05] transition group"
                    >
                      <div className={`h-7 w-7 rounded-lg grid place-items-center text-[11px] font-bold shrink-0 ${color}`}>
                        {label[0]}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-white group-hover:text-amber-300 transition">{label}</div>
                        <div className="text-[10px] text-[#475569]">{sub}</div>
                      </div>
                      {badge && (
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#0f1218] px-2.5 py-1.5 text-xs font-mono">
              <span className="text-[#94a3b8] font-semibold">{wallet.balanceCook.toFixed(3)}</span>
              <span className="text-amber-400 text-[10px]">COOK</span>
              <span className="mx-1 h-3 w-px bg-white/[0.1]" />
              <span className="text-[#94a3b8]">
                {wallet.publicKey ? shortenAddress(wallet.publicKey.toBase58(), 4) : ""}
              </span>
              <button onClick={copyAddr} title="Copy address" className="text-[#475569] hover:text-white ml-0.5">
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
              {wallet.publicKey && (
                <a
                  href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${wallet.publicKey.toBase58()}`}
                  target="_blank"
                  rel="noreferrer"
                  title="View on explorer"
                  className="text-[#475569] hover:text-amber-400"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button onClick={wallet.disconnect} title="Disconnect" className="text-[#475569] hover:text-red-400 ml-1">
                <Power className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {connectError && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-xs font-mono text-red-300 flex items-center justify-center gap-2 anim-slide-down">
          <span>{connectError}</span>
          <button onClick={() => setConnectError(null)} className="text-red-400 hover:text-white ml-2">✕</button>
        </div>
      )}
    </header>
  );
};
