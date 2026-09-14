import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  FileText,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Layers,
  Cpu,
  Wallet
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { COOKIE_CHAIN_CONFIG, CREATOR_WALLET } from "../utils/constants";
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
    connecting: boolean;
    publicKey: any;
    balanceCook: number;
    connectNightly: () => Promise<void>;
    sendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
  };
}

export interface InscriptionRecord {
  id: string;
  payload: string;
  slot: number;
  timestamp: string;
  signature: string;
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
  const [engineType, setEngineType] = useState<"anchor" | "memo">("anchor");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AXIOMS[0]);
  const [useCustom, setUseCustom] = useState(false);
  const [rarityTier, setRarityTier] = useState<number>(3); // Default Legendary
  const [lastReceipt, setLastReceipt] = useState<InscriptionRecord | null>(null);

  // Live Baker XP & Count state
  const [bakerXp, setBakerXp] = useState<number>(250);
  const [bakerFortunesCount, setBakerFortunesCount] = useState<number>(1);
  const [ledger, setLedger] = useState<InscriptionRecord[]>([]);

  const rankInfo = getRankInfo(bakerXp);

  // Active public key (defaults to creator wallet if disconnected)
  const activePubkey = wallet.publicKey || new PublicKey(CREATOR_WALLET);
  const [vaultStatePda] = getVaultStatePda();
  const [bakerProfilePda] = getBakerProfilePda(activePubkey);
  const [nextFortunePda] = getFortuneRecordPda(activePubkey, bakerFortunesCount);

  const handleInscribe = async () => {
    if (!wallet.connected) {
      try {
        await wallet.connectNightly();
      } catch (e: any) {
        setBroadcastError(e?.message || "Please connect your wallet to inscribe fortunes.");
      }
      return;
    }

    const payload = useCustom && customText.trim() ? customText.trim() : selectedPreset;
    if (!payload) return;

    setIsBroadcasting(true);
    setBroadcastError(null);
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
        // Real micro state transition (self-transfer 0.00001 COOK)
        tx.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: 10_000,
          })
        );
        xpAwarded = 25;
      }

      const res = await wallet.sendTransaction(tx);
      const latency = Date.now() - start;
      playSuccessChime();

      let confirmedSlot = 0;
      try {
        confirmedSlot = await connection.getSlot("confirmed");
      } catch {
        // ignore
      }

      const record: InscriptionRecord = {
        id: res.signature.slice(0, 10),
        payload,
        slot: confirmedSlot,
        timestamp: new Date().toLocaleTimeString(),
        signature: res.signature,
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
      console.error("On-chain inscription error:", err);
      setBroadcastError(err?.message || "Transaction broadcast failed. Verify wallet balance on Cookie Chain.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Execution Terminal */}
      <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-6 backdrop-blur-xl shadow-2xl">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Terminal className="h-4.5 w-4.5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                On-Chain Inscription Terminal
              </h2>
              <span className="text-[10px] text-neutral-500 font-mono">
                Direct RPC execution to Cookie Chain SVM
              </span>
            </div>
          </div>

          {/* Engine Selector Tabs */}
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-black/50 p-1">
            <button
              type="button"
              onClick={() => setEngineType("anchor")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-medium transition ${
                engineType === "anchor"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Anchor Program</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineType("memo")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-medium transition ${
                engineType === "memo"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Genesis Memo</span>
            </button>
          </div>
        </div>

        {/* Engine Description Banner */}
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/40 p-3.5 text-xs leading-relaxed text-neutral-300">
          {engineType === "anchor" ? (
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] text-amber-300 font-bold mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>On-Chain Anchor Program: cookie_vault</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {shortenAddress(COOKIE_VAULT_PROGRAM_ID.toBase58(), 4)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Inscribes immutable state to a dedicated <strong className="text-neutral-200">FortuneRecord PDA</strong> with SHA-256 integrity hash and levels up your on-chain <strong className="text-neutral-200">BakerProfile PDA</strong>.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] text-neutral-200 font-bold mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-neutral-400" />
                  <span>Genesis Memo Program (MemoSq4g...fcHr)</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Genesis Native</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Direct SVM execution using Cookie Chain's built-in genesis memo processor with sub-second confirmation and &lt;$0.00001 gas fees.
              </p>
            </div>
          )}
        </div>

        {/* On-Chain Baker Status Badge (Anchor Mode) */}
        {engineType === "anchor" && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span className="text-neutral-400">On-Chain Baker Rank:</span>
                <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold ${rankInfo.badgeColor}`}>
                  {rankInfo.title}
                </span>
              </div>
              <span className="text-amber-300 font-bold">{bakerXp} XP</span>
            </div>

            <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/[0.05]">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (bakerXp / rankInfo.nextTierXp) * 100)}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>Bakes Recorded: <strong className="text-neutral-200">{bakerFortunesCount}</strong></span>
              <span>Next Tier: <strong className="text-neutral-200">{rankInfo.nextTierXp} XP</strong></span>
            </div>

            {/* Target PDAs Breakdown */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/[0.06] pt-2 text-neutral-400">
              <div>
                <span className="text-neutral-500 block">BakerProfile PDA</span>
                <span className="text-neutral-300 font-bold">{shortenAddress(bakerProfilePda.toBase58(), 5)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Next Fortune PDA (#{bakerFortunesCount})</span>
                <span className="text-neutral-300 font-bold">{shortenAddress(nextFortunePda.toBase58(), 5)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium font-mono">Payload Type:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`rounded-lg px-3 py-1 font-mono text-[11px] transition ${
                  !useCustom ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Network Axiom
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`rounded-lg px-3 py-1 font-mono text-[11px] transition ${
                  useCustom ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold" : "text-neutral-400 hover:text-white"
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
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-200 shadow-sm"
                      : "border-white/[0.05] bg-black/40 text-neutral-400 hover:border-white/[0.12] hover:text-neutral-200"
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
                placeholder="Enter custom milestone, cryptographic hash, or alpha..."
                rows={3}
                maxLength={128}
                className="w-full rounded-xl border border-white/[0.08] bg-black/50 p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono shadow-inner"
              />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>UTF-8 Inscription (128 bytes max)</span>
                <span>{customText.length}/128</span>
              </div>
            </div>
          )}

          {/* Rarity Selector (Anchor Protocol Mode) */}
          {engineType === "anchor" && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-neutral-400 font-medium">Inscription Rarity Tier:</span>
                <span className="text-[10px] text-neutral-500">Determines XP Multiplier</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
                {RARITY_NAMES.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setRarityTier(idx)}
                    className={`rounded-xl py-2 text-center border transition ${
                      rarityTier === idx
                        ? RARITY_COLORS[idx] + " font-bold shadow-md"
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
          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3 text-[11px] font-mono text-neutral-400 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Fee Estimate</span>
              <span className="text-emerald-400 font-bold">0.000005 COOK</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Finality</span>
              <span className="text-amber-300 font-bold">&lt;800ms</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Target</span>
              <span className="text-neutral-200 font-bold">
                {engineType === "anchor" ? "Anchor Program" : "Memo v1"}
              </span>
            </div>
          </div>

          {/* Error Message if any */}
          {broadcastError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-mono text-red-300 animate-in fade-in">
              {broadcastError}
            </div>
          )}

          {/* Broadcast CTA */}
          <button
            onClick={handleInscribe}
            disabled={isBroadcasting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] py-3.5 text-xs font-bold text-neutral-950 transition disabled:opacity-50 shadow-xl shadow-amber-500/15"
          >
            {isBroadcasting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Broadcasting to Cookie Chain Mainnet...</span>
              </>
            ) : !wallet.connected ? (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Nightly Wallet to Inscribe</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Sign & Execute on Cookie Chain</span>
              </>
            )}
          </button>
        </div>

        {/* Execution Receipt */}
        {lastReceipt && (
          <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-emerald-500/20 text-emerald-400 mb-2.5">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmed on Cookie Chain SVM</span>
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                {lastReceipt.latencyMs ? `${lastReceipt.latencyMs}ms` : "<800ms"}
              </span>
            </div>

            <p className="text-xs text-neutral-200 font-mono">"{lastReceipt.payload}"</p>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] font-mono text-neutral-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Confirmed Slot:</span>
                <span className="text-neutral-200 font-bold">#{lastReceipt.slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Program Target:</span>
                <span className="text-neutral-200">
                  {lastReceipt.engineType === "anchor" ? "cookie_vault (Anchor)" : "Memo v1 (Genesis)"}
                </span>
              </div>
              {lastReceipt.xpEarned && (
                <div className="flex justify-between text-amber-300">
                  <span>Reputation XP Earned:</span>
                  <span className="font-bold">+{lastReceipt.xpEarned} XP</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/[0.04]">
                <span>Signature: {shortenAddress(lastReceipt.signature, 6)}</span>
                <a
                  href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${lastReceipt.signature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline font-bold"
                >
                  <span>Verify on CookieScan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Feed */}
      <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-neutral-200">
              Verified On-Chain Ledger
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
            Live Mainnet Feed
          </span>
        </div>

        {ledger.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-neutral-500">
            <p>No transactions broadcast in this session.</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Connect your Nightly wallet and execute an inscription.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {ledger.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-black/40 p-3 hover:border-white/[0.14] transition"
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
                    <span>Slot #{item.slot}</span>
                  </div>
                  <span>{item.timestamp}</span>
                </div>

                <p className="text-xs text-neutral-200 font-mono line-clamp-2">
                  "{item.payload}"
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-white/[0.04] pt-1.5">
                  <span>{shortenAddress(item.signature, 5)}</span>
                  {item.xpEarned && (
                    <span className="text-amber-400 font-bold">+{item.xpEarned} XP</span>
                  )}
                  <a
                    href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${item.signature}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-0.5 text-neutral-400 hover:text-amber-400 transition font-medium"
                  >
                    <span>CookieScan</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
