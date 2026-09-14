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
  ShieldCheck,
  Award,
  Layers,
  Cpu
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { shortenAddress } from "../utils/format";
import { playSuccessChime } from "../utils/audio";
import { 
  COOKIE_VAULT_PROGRAM_ID,
  getVaultStatePda,
  getBakerProfilePda,
  getFortuneRecordPda,
  getRankInfo,
  createBakeFortuneInstruction
} from "../services/anchorContract";

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
  engineType: "memo" | "anchor";
  rarityTier?: number;
  xpEarned?: number;
}

const PRESET_AXIOMS = [
  "Sub-second SVM finality verified on Cookie Chain.",
  "Decentralized state execution via community validators.",
  "Genesis Memo Inscription: fast culture, negligible fees.",
  "Hyperlane warp route verified collateral lock.",
  "Solana runtime compatibility v4.1.2 confirmed.",
  "Zero-friction experimentation for Web3 builders.",
];

const RARITY_NAMES = ["Common", "Rare", "Epic", "Legendary", "Degen"];
const RARITY_COLORS = [
  "text-neutral-400 border-neutral-700 bg-neutral-800/40",
  "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "text-purple-400 border-purple-500/30 bg-purple-500/10",
  "text-amber-400 border-amber-500/30 bg-amber-500/10",
  "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
];

export const FortuneBakery: React.FC<InscriptionEngineProps> = ({ wallet, connection }) => {
  const [engineType, setEngineType] = useState<"memo" | "anchor">("anchor");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AXIOMS[0]);
  const [useCustom, setUseCustom] = useState(false);
  const [rarityTier, setRarityTier] = useState<number>(3); // Default Legendary
  const [lastReceipt, setLastReceipt] = useState<InscriptionRecord | null>(null);

  // Simulated On-Chain Baker State (persists during user session)
  const [bakerXp, setBakerXp] = useState<number>(150);
  const [bakerFortunesCount, setBakerFortunesCount] = useState<number>(2);

  // Ledger starts empty — entries appear after real or sandbox broadcasts
  const [ledger, setLedger] = useState<InscriptionRecord[]>([]);

  const rankInfo = getRankInfo(bakerXp);

  // PDA Addresses
  const activePubkey = wallet.publicKey || new PublicKey("11111111111111111111111111111111");
  const [vaultStatePda] = getVaultStatePda();
  const [bakerProfilePda] = getBakerProfilePda(activePubkey);
  const [nextFortunePda] = getFortuneRecordPda(activePubkey, bakerFortunesCount);

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
      const tx = new Transaction();
      let xpAwarded = 0;

      if (engineType === "anchor") {
        // Build Anchor Smart Contract instruction with 8-byte discriminator & PDA state
        const anchorIx = await createBakeFortuneInstruction(
          wallet.publicKey,
          payload,
          rarityTier,
          bakerFortunesCount
        );
        tx.add(anchorIx);
        xpAwarded = 100 + (rarityTier * 50);
      } else {
        // Memo v1 Genesis Program instruction
        const memoText = `[CookieChain] ${payload} | t:${Date.now()}`;
        tx.add(createMemoInstruction(memoText, wallet.publicKey));
        // Micro state transition (self-transfer 0.0001 COOK)
        tx.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: 100_000, // 0.0001 COOK
          })
        );
        xpAwarded = 25;
      }

      const res = await wallet.sendTransaction(tx);
      const latency = Date.now() - start;
      playSuccessChime();

      // Fetch confirmed slot from RPC
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
        engineType,
        rarityTier: engineType === "anchor" ? rarityTier : undefined,
        xpEarned: xpAwarded
      };

      setLastReceipt(record);
      setLedger((prev) => [record, ...prev]);
      setBakerXp((prev) => prev + xpAwarded);
      if (engineType === "anchor") {
        setBakerFortunesCount((prev) => prev + 1);
      }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              On-Chain Execution Terminal
            </h2>
          </div>

          {/* Engine Selector Tabs */}
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
            <button
              type="button"
              onClick={() => setEngineType("anchor")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition ${
                engineType === "anchor"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>Anchor Protocol (Rust)</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineType("memo")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition ${
                engineType === "memo"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Genesis Memo v1</span>
            </button>
          </div>
        </div>

        {/* Engine Description Banner */}
        <div className="mt-3.5 rounded-xl border border-white/[0.06] bg-black/30 p-3 text-xs leading-relaxed text-neutral-300">
          {engineType === "anchor" ? (
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-amber-300 font-bold mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Custom SVM Anchor Program (cookie_vault)</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  ID: {shortenAddress(COOKIE_VAULT_PROGRAM_ID.toBase58(), 4)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Inscribes state to a dedicated <strong className="text-neutral-200">FortuneRecord PDA</strong> with SHA-256 integrity hash, updates your on-chain <strong className="text-neutral-200">BakerProfile PDA</strong>, and advances your on-chain reputation tier.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-300 font-bold mb-1">
                <Layers className="h-3.5 w-3.5 text-neutral-400" />
                <span>Genesis SVM Memo Program</span>
                <span className="text-[10px] text-neutral-500 font-normal">
                  ID: MemoSq4g...fcHr
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Broadcasts an immutable UTF-8 transaction memo directly to Cookie Chain's genesis system memo program. Lightweight, sub-second confirmation.
              </p>
            </div>
          )}
        </div>

        {/* On-Chain Baker Status Badge (Anchor Mode) */}
        {engineType === "anchor" && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent p-3.5">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span className="text-neutral-400">Baker Reputation:</span>
                <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${rankInfo.badgeColor}`}>
                  {rankInfo.title}
                </span>
              </div>
              <span className="text-amber-300 font-bold">{bakerXp} XP</span>
            </div>

            <div className="w-full bg-neutral-800/60 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (bakerXp / rankInfo.nextTierXp) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500">
              <span>Fortunes Baked: <strong className="text-neutral-300">{bakerFortunesCount}</strong></span>
              <span>Next Rank: <strong className="text-neutral-300">{rankInfo.nextTierXp} XP</strong></span>
            </div>

            {/* Target PDAs Breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/[0.04] pt-2 text-neutral-400">
              <div>
                <span className="text-neutral-600 block">BakerProfile PDA</span>
                <span className="text-neutral-300">{shortenAddress(bakerProfilePda.toBase58(), 5)}</span>
              </div>
              <div>
                <span className="text-neutral-600 block">Next Fortune PDA (#{bakerFortunesCount})</span>
                <span className="text-neutral-300">{shortenAddress(nextFortunePda.toBase58(), 5)}</span>
              </div>
            </div>
          </div>
        )}

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
                maxLength={128}
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono"
              />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>UTF-8 Inscription (Anchor Limit)</span>
                <span>{customText.length}/128</span>
              </div>
            </div>
          )}

          {/* Rarity Selector (Anchor Protocol Mode) */}
          {engineType === "anchor" && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-400 font-medium">Inscription Rarity Tier:</span>
                <span className="text-[10px] font-mono text-neutral-500">Affects On-Chain XP Grant</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
                {RARITY_NAMES.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setRarityTier(idx)}
                    className={`rounded-lg py-1.5 text-center border transition ${
                      rarityTier === idx
                        ? RARITY_COLORS[idx] + " font-bold shadow"
                        : "border-white/[0.06] bg-black/40 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
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
              <span className="text-[10px] text-neutral-500 uppercase block">Program Architecture</span>
              <span className="text-neutral-300">
                {engineType === "anchor" ? "Rust / Anchor" : "Memo v1"}
              </span>
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
                <span>
                  {engineType === "anchor" 
                    ? "Bake On-Chain via Anchor ($0 Sandbox Mode)"
                    : "Inscribe in Sandbox Mode ($0 Gas · Instant)"}
                </span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>
                  {engineType === "anchor" 
                    ? "Sign & Execute Anchor State Transition"
                    : "Sign & Broadcast Memo Inscription"}
                </span>
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
                {lastReceipt.isSimulated 
                  ? `Sandbox Simulation Settled (${lastReceipt.engineType.toUpperCase()})` 
                  : `Settled On-Chain (${lastReceipt.engineType.toUpperCase()})`}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                {lastReceipt.latencyMs ? `${lastReceipt.latencyMs}ms` : "<800ms"}
              </span>
            </div>

            <p className="text-xs text-neutral-200 font-mono">"{lastReceipt.payload}"</p>

            <div className="mt-2.5 pt-2 border-t border-white/[0.05] text-[11px] font-mono text-neutral-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Program Target:</span>
                <span className="text-neutral-200">
                  {lastReceipt.engineType === "anchor" 
                    ? "cookie_vault (CookVau1t...)" 
                    : "MemoSq4g...fcHr (Memo v1)"}
                </span>
              </div>
              {lastReceipt.xpEarned && (
                <div className="flex justify-between text-amber-300">
                  <span>Reputation XP Earned:</span>
                  <span>+{lastReceipt.xpEarned} XP</span>
                </div>
              )}
              {lastReceipt.isSimulated ? (
                <div className="flex justify-between text-amber-300/80">
                  <span>Execution Pipeline:</span>
                  <span>Zero-Gas Sandbox Mode Active</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
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
            {ledger.length} total entries
          </span>
        </div>

        {ledger.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500">
            <p>No inscriptions broadcast yet.</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Select Anchor or Memo above and click Inscribe.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {ledger.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.05] bg-black/30 p-3 hover:border-white/[0.12] transition"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      item.engineType === "anchor" 
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                        : "bg-white/[0.06] text-neutral-300 border border-white/[0.08]"
                    }`}>
                      {item.engineType.toUpperCase()}
                    </span>
                    <span>{item.isSimulated ? "Sandbox" : `Slot #${item.slot}`}</span>
                  </div>
                  <span>{item.timestamp}</span>
                </div>

                <p className="text-xs text-neutral-300 font-mono line-clamp-2">
                  "{item.payload}"
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-white/[0.04] pt-1.5">
                  <span className={item.isSimulated ? "text-amber-400/70" : ""}>
                    {item.isSimulated ? "[sim] " : ""}{shortenAddress(item.signature, 4)}
                  </span>
                  {item.xpEarned && (
                    <span className="text-amber-400 font-bold">+{item.xpEarned} XP</span>
                  )}
                  {!item.isSimulated && (
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
