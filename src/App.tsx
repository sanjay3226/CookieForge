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
  Trophy
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
import { JudgeGuideModal } from "./components/JudgeGuideModal";
import { COOKIE_CHAIN_CONFIG } from "./utils/constants";

export function App() {
  const { connection, chainState } = useCookieChain();
  const wallet = useWallet(connection);

  const [activeTab, setActiveTab] = useState<"inscribe" | "swap" | "domains" | "bridge" | "radar">("inscribe");
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Institutional Top Bar */}
      <Header
        chainState={chainState}
        wallet={wallet}
        onOpenNetworkGuide={() => setIsNetworkModalOpen(true)}
        onOpenJudgeGuide={() => setIsJudgeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Minimal Hero Stats Bar */}
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0f1218]/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-amber-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Cookie Chain SVM Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Sub-Second SVM Terminal & Infrastructure Hub
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Full-stack cApp demonstrating sub-second settlement, genesis Memo inscriptions, Cookiebox AMM liquidity aggregation, .cook identity resolution, and Hyperlane warp routing.
              </p>
            </div>

            {/* Micro Benchmark Indicators */}
            <div className="flex items-center gap-3 font-mono">
              <div className="rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2 text-center">
                <span className="text-[10px] text-neutral-500 uppercase block">Finality</span>
                <span className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" />
                  &lt;800ms
                </span>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2 text-center">
                <span className="text-[10px] text-neutral-500 uppercase block">Gas Fee</span>
                <span className="text-sm font-bold text-emerald-400">0.000005 COOK</span>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/40 px-3.5 py-2 text-center">
                <span className="text-[10px] text-neutral-500 uppercase block">Deploy Cost</span>
                <span className="text-sm font-bold text-neutral-200">~$0.05</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zero-Gas Sandbox Mode Callout for Judges & Reviewers */}
        {wallet.isSimulationMode && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 backdrop-blur-xl shadow-lg shadow-amber-500/5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                      Zero-Gas Interactive Sandbox Active
                    </span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      {wallet.balanceCook.toFixed(2)} Demo COOK Loaded
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl leading-relaxed">
                    Judges & reviewers can test all SVM interactions immediately with $0 and 0 wallet setup. Click <strong>Inscribe in Sandbox Mode</strong> or <strong>Simulate Swap</strong> below to test sub-second finality.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsJudgeModalOpen(true)}
                  className="w-full sm:w-auto rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3.5 py-2 text-xs font-mono font-bold text-amber-300 transition text-center shadow-sm active:scale-95"
                >
                  Reviewer Fast-Track
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Precision Segmented Navigation */}
        <div className="mb-6 flex items-center justify-start overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex gap-1 rounded-xl border border-white/[0.08] bg-[#0f1218] p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("inscribe")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                activeTab === "inscribe"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Inscription Engine</span>
            </button>

            <button
              onClick={() => setActiveTab("swap")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                activeTab === "swap"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>DEX Aggregator</span>
            </button>

            <button
              onClick={() => setActiveTab("domains")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                activeTab === "domains"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>.cook Registry</span>
            </button>

            <button
              onClick={() => setActiveTab("bridge")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                activeTab === "bridge"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Hyperlane Bridge</span>
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                activeTab === "radar"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
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

      {/* Judge & Reviewer Fast-Track Guide Modal */}
      <JudgeGuideModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onActivateDemo={wallet.connectDemoMode}
      />

      {/* Institutional Footer */}
      <footer className="mt-16 border-t border-white/[0.06] bg-[#090a0f] py-6 px-4 text-xs font-mono text-neutral-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">CookieForge</span>
            <span className="text-neutral-600">•</span>
            <span>SVM cApp for Cookie Chain</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
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
