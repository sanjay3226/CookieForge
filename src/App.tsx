import React, { useState } from "react";
import {
  Feather,
  ArrowRightLeft,
  Globe,
  BarChart3,
  Layers,
  Zap,
} from "lucide-react";
import { useCookieChain } from "./hooks/useCookieChain";
import { useWallet } from "./hooks/useWallet";
import { Header } from "./components/Header";
import { FortuneBakery } from "./components/FortuneBakery";
import { CookieJar } from "./components/CookieJar";
import { SwapTerminal } from "./components/SwapTerminal";
import { DomainResolver } from "./components/DomainResolver";
import { BridgeCompanion } from "./components/BridgeCompanion";
import { MarketRadar } from "./components/MarketRadar";
import { NetworkModal } from "./components/NetworkModal";
import { COOKIE_CHAIN_CONFIG, CREATOR_WALLET } from "./utils/constants";
import { shortenAddress } from "./utils/format";

type Tab = "write" | "bridge" | "names" | "swap" | "prices";

const TABS: { id: Tab; icon: React.FC<any>; label: string }[] = [
  { id: "write",  icon: Feather,        label: "Write Message" },
  { id: "bridge", icon: Layers,         label: "Bridge & Apps" },
  { id: "names",  icon: Globe,          label: "Name Search" },
  { id: "swap",   icon: ArrowRightLeft, label: "Swap Tokens" },
  { id: "prices", icon: BarChart3,      label: "Token Prices" },
];

export function App() {
  const { connection, chainState } = useCookieChain();
  const wallet = useWallet(connection);

  const [activeTab, setActiveTab] = useState<Tab>("write");
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  // key counter forces re-animation when tab switches
  const [tabKey, setTabKey] = useState(0);

  const handleTab = (t: Tab) => {
    if (t === activeTab) return;
    setActiveTab(t);
    setTabKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] selection:bg-amber-500 selection:text-black">
      <Header
        chainState={chainState}
        wallet={wallet}
        onOpenNetworkGuide={() => setIsNetworkModalOpen(true)}
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        {/* ── Hero ── */}
        <div className="mb-8 text-center anim-fade-up">
          <div className="inline-flex items-center gap-2 mb-3 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Cookie Chain · Live Mainnet</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            CookieForge
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]"
             style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Write permanent messages on the Cookie Chain blockchain — forever on-chain.
          </p>

          {/* Quick stats */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#64748b]">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              Confirms in &lt;1 second
            </span>
            <span className="text-[#1e293b]">·</span>
            <span>Fee: ~$0.0000005 per write</span>
            <span className="text-[#1e293b]">·</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Block {chainState.slot.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6 flex justify-center anim-fade-up" style={{ animationDelay: "80ms" }}>
          <nav className="inline-flex gap-1 rounded-2xl border border-white/[0.08] bg-[#0c0f16] p-1 shadow-lg">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTab(id)}
                className={[
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-mono font-medium transition-all",
                  activeTab === id
                    ? "tab-active"
                    : "text-[#64748b] hover:text-white hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div key={tabKey} className="anim-fade-up" style={{ animationDelay: "60ms" }}>
          {activeTab === "write" && (
            <div className="space-y-4">
              <FortuneBakery wallet={wallet} connection={connection} />
              <CookieJar wallet={wallet} />
            </div>
          )}
          {activeTab === "bridge"  && <BridgeCompanion connection={connection} />}
          {activeTab === "names"   && <DomainResolver  connection={connection} />}
          {activeTab === "swap"    && <SwapTerminal     wallet={wallet} />}
          {activeTab === "prices"  && <MarketRadar />}
        </div>
      </main>

      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-white/[0.06] py-6 px-4 font-mono text-[11px] text-[#334155]">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            CookieForge · Built by{" "}
            <a
              href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${CREATOR_WALLET}`}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline"
            >
              Sanjay ({shortenAddress(CREATOR_WALLET, 4)})
            </a>
            {" "}on Cookie Chain SVM
          </span>

          <div className="flex items-center gap-4">
            {([
              ["Docs",     COOKIE_CHAIN_CONFIG.docsUrl],
              ["Explorer", COOKIE_CHAIN_CONFIG.explorerUrl],
              ["Bridge",   COOKIE_CHAIN_CONFIG.bridgeUrl],
              ["Telegram", COOKIE_CHAIN_CONFIG.telegramUrl],
            ] as const).map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer"
                 className="hover:text-amber-400 transition">
                {name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
