import React, { useState } from "react";
import { 
  Terminal, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  FileText,
  Sparkles,
  ArrowUpRight,
  FlaskConical,
  Zap,
  Info
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { shortenAddress } from "../utils/format";
import { playSuccessChime } from "../utils/audio";

interface InscriptionEngineProps {
  connection: Connection;
  wallet: {
    connected: boolean;
    publicKey: any;
    balanceCook: number;
    isSimulationMode: boolean;
    connectNightly: () => Promise<void>;
    connectDemoMode: () => void;
    sendTransaction: (tx: Transaction) => Promise<{ signature: string; isSimulated?: boolean }>;
  };
}

export interface InscriptionRecord {
  id: string;
  payload: string;
  slot: number;
  timestamp: string;
  signature: string;
  isSimulated?: boolean;
  latencyMs?: number;
}

const PRESET_AXIOMS = [
  "Sub-second SVM finality verified on Cookie Chain.",
  "Decentralized state execution via community validators.",
  "Genesis Memo Inscription: fast culture, negligible fees.",
  "Hyperlane warp route verified collateral lock.",
  "Solana runtime compatibility v4.1.2 confirmed.",
  "Zero-friction experimentation for Web3 builders.",
];

export const FortuneBakery: React.FC<InscriptionEngineProps> = ({ wallet, connection }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AXIOMS[0]);
  const [useCustom, setUseCustom] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<InscriptionRecord | null>(null);

  // Ledger starts empty — entries appear after real or sandbox broadcasts
  const [ledger, setLedger] = useState<InscriptionRecord[]>([]);

  const handleInscribe = async () => {
    if (!wallet.connected) {
      wallet.connectDemoMode();
      return;
    }

    const payload = useCustom && customText.trim() ? customText.trim() : selectedPreset;
    if (!payload) return;

    setIsBroadcasting(true);
    const start = Date.now();

    try {
      const memoText = `[CookieChain] ${payload} | t:${Date.now()}`;
      const tx = new Transaction();

      // Memo v1 instruction (Genesis SVM program)
      tx.add(createMemoInstruction(memoText, wallet.publicKey));

      // Micro state transition (self-transfer 0.0001 COOK)
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 100_000, // 0.0001 COOK
        })
      );

      const res = await wallet.sendTransaction(tx);
      const latency = Date.now() - start;
      playSuccessChime();

      // Fetch real slot from RPC if on real network
      let confirmedSlot = 0;
      try {
        confirmedSlot = await connection.getSlot();
      } catch {
        // RPC fallback
      }

      const record: InscriptionRecord = {
        id: Math.random().toString(36).substring(2, 9),
        payload,
        slot: confirmedSlot,
        timestamp: new Date().toLocaleTimeString(),
        signature: res.signature,
        isSimulated: res.isSimulated ?? false,
        latencyMs: latency,
      };

      setLastReceipt(record);
      setLedger((prev) => [record, ...prev]);
      if (useCustom) setCustomText("");
    } catch (err: any) {
      console.error("Inscription error:", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Execution Terminal */}
      <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-6 backdrop-blur-xl shadow-xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              On-Chain Inscription Engine
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {wallet.isSimulationMode && (
              <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                0-Gas Sandbox
              </span>
            )}
            <span className="font-mono text-[10px] text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              Memo v1 Program
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
          Execute an immutable UTF-8 transaction memo to Cookie Chain’s genesis program (
          <span className="font-mono text-neutral-300">MemoSq...fcHr</span>). Demonstrates sub-second finality, negligible gas, and full SVM compatibility.
        </p>

        {/* Input Controls */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Payload Type:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition ${
                  !useCustom ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Network Axiom
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition ${
                  useCustom ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Custom String
              </button>
            </div>
          </div>

          {!useCustom ? (
            <div className="space-y-1.5">
              {PRESET_AXIOMS.map((axiom) => (
                <div
                  key={axiom}
                  onClick={() => setSelectedPreset(axiom)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition font-mono ${
                    selectedPreset === axiom
                      ? "border-amber-500/40 bg-amber-500/5 text-amber-200 shadow-sm"
                      : "border-white/[0.05] bg-black/30 text-neutral-400 hover:border-white/[0.12] hover:text-neutral-300"
                  }`}
                >
                  "{axiom}"
                </div>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom milestone, cryptographic hash, or note..."
                rows={3}
                maxLength={140}
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono"
              />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>UTF-8 Byte Inscription</span>
                <span>{customText.length}/140</span>
              </div>
            </div>
          )}

          {/* Telemetry Bar */}
          <div className="rounded-xl border border-white/[0.05] bg-black/20 p-3 text-[11px] font-mono text-neutral-400 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Fee Estimate</span>
              <span className="text-emerald-400 font-semibold">0.000005 COOK</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Finality Benchmark</span>
              <span className="text-amber-300 font-semibold">&lt;800ms</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">SVM Program</span>
              <span className="text-neutral-300">Memo v1</span>
            </div>
          </div>

          {/* Broadcast CTA */}
          <button
            onClick={handleInscribe}
            disabled={isBroadcasting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] py-3 text-xs font-bold text-neutral-950 transition disabled:opacity-50 shadow-lg shadow-amber-500/10"
          >
            {isBroadcasting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Broadcasting to Cookie Chain...</span>
              </>
            ) : wallet.isSimulationMode ? (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>Inscribe in Sandbox Mode ($0 Gas · Instant)</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Sign & Broadcast Inscription</span>
              </>
            )}
          </button>
        </div>

        {/* Execution Receipt */}
        {lastReceipt && (
          <div className={`mt-5 rounded-xl border p-4 animate-in fade-in ${
            lastReceipt.isSimulated
              ? "border-amber-500/30 bg-amber-500/[0.04]"
              : "border-emerald-500/30 bg-emerald-500/[0.04]"
          }`}>
            <div className={`flex items-center justify-between text-xs pb-2 border-b mb-2.5 ${
              lastReceipt.isSimulated
                ? "text-amber-400 border-amber-500/20"
                : "text-emerald-400 border-emerald-500/20"
            }`}>
              <span className="flex items-center gap-1.5 font-bold">
                {lastReceipt.isSimulated ? (
                  <FlaskConical className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {lastReceipt.isSimulated ? "Sandbox Simulation Settled" : "Transaction Settled On-Chain"}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                {lastReceipt.latencyMs ? `${lastReceipt.latencyMs}ms` : "<800ms"}
              </span>
            </div>

            <p className="text-xs text-neutral-200 font-mono">"{lastReceipt.payload}"</p>

            {lastReceipt.isSimulated ? (
              <div className="mt-2.5 pt-2 border-t border-white/[0.05] text-[11px] font-mono text-amber-300/80 space-y-1">
                <div className="flex justify-between">
                  <span>Execution Mode:</span>
                  <span className="text-amber-300">Zero-Gas Sandbox Simulation</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Program:</span>
                  <span className="text-neutral-300">MemoSq...fcHr (Memo v1)</span>
                </div>
                <p className="text-[10px] text-neutral-400 pt-1">
                  Connect Nightly or Phantom wallet above to broadcast live on Cookie Chain Mainnet RPC.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 font-mono border-t border-white/[0.05] pt-2">
                <span>Sig: {shortenAddress(lastReceipt.signature, 5)}</span>
                <a
                  href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${lastReceipt.signature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline"
                >
                  <span>Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ledger Feed */}
      <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-300">
              Verified Ledger Feed
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {ledger.filter(i => !i.isSimulated).length} on-chain
            {ledger.filter(i => i.isSimulated).length > 0 && ` · ${ledger.filter(i => i.isSimulated).length} sandbox`}
          </span>
        </div>

        {ledger.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            <p>No inscriptions broadcast yet.</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Click Inscribe above to test sub-second finality.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {ledger.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.05] bg-black/30 p-3 hover:border-white/[0.12] transition"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-1">
                  <span>{item.isSimulated ? "Sandbox Session" : `Slot #${item.slot}`}</span>
                  <span>{item.timestamp}</span>
                </div>

                <p className="text-xs text-neutral-300 font-mono line-clamp-2">
                  "{item.payload}"
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-white/[0.04] pt-1.5">
                  <span className={item.isSimulated ? "text-amber-400/70" : ""}>
                    {item.isSimulated ? "[sandbox] " : ""}{shortenAddress(item.signature, 4)}
                  </span>
                  {item.isSimulated ? (
                    <span className="text-amber-400/60 text-[10px]">Simulated</span>
                  ) : (
                    <a
                      href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${item.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-0.5 text-neutral-400 hover:text-amber-400 transition"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
