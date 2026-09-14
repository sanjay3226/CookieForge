import { useState } from "react";
import { 
  ArrowRightLeft, 
  Globe, 
  BarChart3, 
  Layers,
  Zap,
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

  const [activeTab, setActiveTab] = useState<"inscribe" | "gateways" | "domains" | "swap" | "radar">("inscribe");
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Bar */}
      <Header
        chainState={chainState}
        wallet={wallet}
        onOpenNetworkGuide={() => setIsNetworkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Minimal Hero Header */}
        <div className="mb-6 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cookie Chain SVM</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300">Anchor Runtime v0.30</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
            CookieForge
          </h1>
          <p className="mt-1 text-xs text-neutral-400 font-mono">
            Smart contract state inscriptions on Cookie Chain SVM
          </p>

          {/* Clean Micro Metrics */}
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Finality: <strong className="text-amber-300">&lt;800ms</strong></span>
            </span>
            <span className="text-neutral-700">•</span>
            <span>Avg Gas: <strong className="text-emerald-400">0.000005 COOK</strong></span>
            <span className="text-neutral-700">•</span>
            <span>Anchor: <strong className="text-neutral-300">CookVau1t...1111</strong></span>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex gap-1 rounded-2xl border border-white/[0.08] bg-[#0c0f16] p-1 shadow-lg font-mono text-xs">
            <button
              onClick={() => setActiveTab("inscribe")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                activeTab === "inscribe"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Inscribe</span>
            </button>

            <button
              onClick={() => setActiveTab("gateways")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                activeTab === "gateways"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Gateways</span>
            </button>

            <button
              onClick={() => setActiveTab("domains")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                activeTab === "domains"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>.cook</span>
            </button>

            <button
              onClick={() => setActiveTab("swap")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                activeTab === "swap"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>DEX</span>
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition ${
                activeTab === "radar"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Markets</span>
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

          {activeTab === "gateways" && (
            <div className="py-2">
              <BridgeCompanion connection={connection} />
            </div>
          )}

          {activeTab === "domains" && (
            <div className="py-2">
              <DomainResolver connection={connection} />
            </div>
          )}

          {activeTab === "swap" && (
            <div className="py-2">
              <SwapTerminal wallet={wallet} />
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

      {/* Minimal Footer */}
      <footer className="mt-16 border-t border-white/[0.06] bg-[#07090e] py-6 px-4 text-xs font-mono text-neutral-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-200">CookieForge</span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-400">
              Creator:{" "}
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
            <a href={COOKIE_CHAIN_CONFIG.docsUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">Docs</a>
            <a href={COOKIE_CHAIN_CONFIG.explorerUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">Explorer</a>
            <a href={COOKIE_CHAIN_CONFIG.bridgeUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">Bridge</a>
            <a href={COOKIE_CHAIN_CONFIG.telegramUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">Telegram</a>
            <a href={COOKIE_CHAIN_CONFIG.xUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">X (@TheCookieChain)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
