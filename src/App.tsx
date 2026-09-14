import { useState } from "react";
import { 
  Terminal, 
  ArrowRightLeft, 
  Globe, 
  BarChart3, 
  Layers,
  Zap,
  Activity,
  ExternalLink,
  ShieldCheck,
  Cpu
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

export function App() {
  const { connection, chainState } = useCookieChain();
  const wallet = useWallet(connection);

  const [activeTab, setActiveTab] = useState<"inscribe" | "swap" | "domains" | "bridge" | "radar">("inscribe");
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Institutional Top Bar */}
      <Header
        chainState={chainState}
        wallet={wallet}
        onOpenNetworkGuide={() => setIsNetworkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Terminal Overview Hero */}
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0e121a]/80 via-[#0a0d14]/70 to-[#07090e]/80 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Cookie Chain SVM Network</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">Anchor Runtime v0.30</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Institutional SVM Terminal & Smart Contract Engine
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Production-grade cApp featuring custom on-chain Anchor state (<code className="text-neutral-300 font-mono">cookie_vault</code>), Cookiebox DEX aggregation, CookOven domain resolution, and Hyperlane cross-chain warp routing.
              </p>
            </div>

            {/* Micro Benchmark Indicators */}
            <div className="flex items-center gap-3 font-mono self-start lg:self-auto">
              <div className="rounded-xl border border-white/[0.08] bg-black/50 px-4 py-2.5 text-center shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Finality</span>
                <span className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Zap className="h-3 w-3" />
                  &lt;800ms
                </span>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/50 px-4 py-2.5 text-center shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Avg Gas</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">0.000005 COOK</span>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/50 px-4 py-2.5 text-center shadow-inner">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Deploy Cost</span>
                <span className="text-sm font-bold text-neutral-200 mt-0.5 block">~$0.05</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex items-center justify-start overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0c0f16] p-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab("inscribe")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition ${
                activeTab === "inscribe"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Smart Contract & Inscriptions</span>
            </button>

            <button
              onClick={() => setActiveTab("swap")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition ${
                activeTab === "swap"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>DEX Aggregator</span>
            </button>

            <button
              onClick={() => setActiveTab("domains")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition ${
                activeTab === "domains"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>.cook Registry</span>
            </button>

            <button
              onClick={() => setActiveTab("bridge")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition ${
                activeTab === "bridge"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Ecosystem Gateways & Warp Route</span>
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition ${
                activeTab === "radar"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Markets Radar</span>
            </button>
          </div>
        </div>

        {/* Tab View Container */}
        <div>
          {activeTab === "inscribe" && (
            <div className="space-y-6">
              <FortuneBakery wallet={wallet} connection={connection} />
              <div className="max-w-xl mx-auto">
                <CookieJar wallet={wallet} />
              </div>
            </div>
          )}

          {activeTab === "swap" && (
            <div className="py-2">
              <SwapTerminal wallet={wallet} />
            </div>
          )}

          {activeTab === "domains" && (
            <div className="py-2">
              <DomainResolver connection={connection} />
            </div>
          )}

          {activeTab === "bridge" && (
            <div className="py-2">
              <BridgeCompanion connection={connection} />
            </div>
          )}

          {activeTab === "radar" && (
            <div className="py-2">
              <MarketRadar />
            </div>
          )}
        </div>
      </main>

      {/* Network Configuration Guide Modal */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="mt-20 border-t border-white/[0.08] bg-[#07090e] py-8 px-4 text-xs font-mono text-neutral-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-bold text-neutral-200">CookieForge SVM Terminal</span>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <span className="text-neutral-400">
              Built by{" "}
              <a 
                href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${CREATOR_WALLET}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline font-bold"
              >
                Sanjay ({shortenAddress(CREATOR_WALLET, 4)})
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
            <a
              href={COOKIE_CHAIN_CONFIG.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              Docs
            </a>
            <a
              href={COOKIE_CHAIN_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              Explorer
            </a>
            <a
              href={COOKIE_CHAIN_CONFIG.bridgeUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              Bridge
            </a>
            <a
              href={COOKIE_CHAIN_CONFIG.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              Telegram
            </a>
            <a
              href={COOKIE_CHAIN_CONFIG.xUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition"
            >
              X (@TheCookieChain)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
