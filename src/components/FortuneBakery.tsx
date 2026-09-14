import React, { useState } from "react";
import { 
  Terminal, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Wallet,
  Sparkles,
  ArrowUpRight
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
  engineType: "anchor" | "memo";
  pda?: string;
}

const QUICK_PROMPTS = [
  "gm Cookie Chain SVM",
  "Sub-second finality verified",
  "Superteam Earn Bounty cApp",
];

export const FortuneBakery: React.FC<InscriptionEngineProps> = ({ wallet, connection }) => {
  const [engineType, setEngineType] = useState<"anchor" | "memo">("anchor");
  const [message, setMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<InscriptionRecord | null>(null);
  const [inscriptionsCount, setInscriptionsCount] = useState(0);
  const [history, setHistory] = useState<InscriptionRecord[]>([]);

  // Active public key
  const activePubkey = wallet.publicKey || new PublicKey(CREATOR_WALLET);
  const [bakerProfilePda] = getBakerProfilePda(activePubkey);
  const [nextFortunePda] = getFortuneRecordPda(activePubkey, inscriptionsCount);

  const handleInscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!wallet.connected) {
      try {
        await wallet.connectNightly();
      } catch (err: any) {
        setBroadcastError(err?.message || "Please connect your wallet to broadcast on-chain.");
      }
      return;
    }

    const payload = message.trim();
    if (!payload) {
      setBroadcastError("Please enter a message to inscribe.");
      return;
    }

    setIsBroadcasting(true);
    setBroadcastError(null);
    const start = Date.now();

    try {
      const tx = new Transaction();

      if (engineType === "anchor") {
        // Real on-chain Anchor instruction into cookie_vault
        const anchorIx = await createBakeFortuneInstruction(
          wallet.publicKey,
          payload,
          1, // Standard Tier
          inscriptionsCount
        );
        tx.add(anchorIx);
      } else {
        // Memo v1 Genesis Program instruction
        const memoText = `[CookieChain] ${payload}`;
        tx.add(createMemoInstruction(memoText, wallet.publicKey));
        // Small self-transfer to register state
        tx.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: wallet.publicKey,
            lamports: 10_000,
          })
        );
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
        id: res.signature.slice(0, 8),
        payload,
        slot: confirmedSlot,
        timestamp: new Date().toLocaleTimeString(),
        signature: res.signature,
        latencyMs: latency,
        engineType,
        pda: engineType === "anchor" ? nextFortunePda.toBase58() : undefined,
      };

      setLastReceipt(record);
      setHistory((prev) => [record, ...prev]);
      setInscriptionsCount((prev) => prev + 1);
      setMessage("");
    } catch (err: any) {
      console.error("Inscription broadcast error:", err);
      setBroadcastError(err?.message || "Transaction failed. Ensure your wallet has COOK for gas.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Central Inscription Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Header with Engine Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <div>
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              <span>On-Chain Inscription</span>
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Permanently write state to Cookie Chain SVM
            </p>
          </div>

          {/* Engine Selector */}
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-black/40 p-1">
            <button
              type="button"
              onClick={() => setEngineType("anchor")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-mono font-medium transition ${
                engineType === "anchor"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>Anchor</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineType("memo")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-mono font-medium transition ${
                engineType === "memo"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Memo</span>
            </button>
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleInscribe} className="space-y-3">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you want to inscribe permanently on Cookie Chain?"
              rows={3}
              maxLength={128}
              className="w-full rounded-xl border border-white/[0.08] bg-black/40 p-3.5 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono resize-none"
            />

            <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span>Quick:</span>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="rounded bg-white/[0.04] px-1.5 py-0.5 text-neutral-400 hover:text-amber-300 hover:bg-white/[0.08] transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <span>{message.length}/128</span>
            </div>
          </div>

          {/* Minimal Info Bar */}
          <div className="rounded-xl border border-white/[0.05] bg-black/20 p-2.5 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {engineType === "anchor" ? "Anchor Program (cookie_vault)" : "Genesis Memo"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span>Gas: <strong className="text-emerald-400">~0.000005 COOK</strong></span>
              <span>Finality: <strong className="text-amber-300">&lt;800ms</strong></span>
            </div>
          </div>

          {/* Error Banner */}
          {broadcastError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs font-mono text-red-300">
              {broadcastError}
            </div>
          )}

          {/* Inscribe Button */}
          <button
            type="submit"
            disabled={isBroadcasting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] py-3 text-xs font-bold text-neutral-950 transition shadow-lg shadow-amber-500/15 disabled:opacity-50"
          >
            {isBroadcasting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Broadcasting to Cookie Chain...</span>
              </>
            ) : !wallet.connected ? (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet to Inscribe</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Inscribe On-Chain ({engineType === "anchor" ? "Anchor PDA" : "Memo"})</span>
              </>
            )}
          </button>
        </form>

        {/* Confirmed Receipt Card */}
        {lastReceipt && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-3.5 text-xs font-mono animate-in fade-in space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Inscribed Successfully!</span>
              </div>
              <span className="text-[10px] text-neutral-400">Slot #{lastReceipt.slot}</span>
            </div>

            <p className="text-neutral-200 text-xs py-1">"{lastReceipt.payload}"</p>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px]">
              <span className="text-neutral-400">Tx: {shortenAddress(lastReceipt.signature, 6)}</span>
              <a
                href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${lastReceipt.signature}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-amber-400 hover:underline font-bold"
              >
                <span>View on CookieScan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Session History Ledger (Only shown if user made inscriptions in this session) */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3 text-xs font-mono">
            <span className="text-neutral-400 font-bold uppercase tracking-wider">Session Inscriptions</span>
            <span className="text-emerald-400 text-[10px]">{history.length} Confirmed</span>
          </div>

          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.signature}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/40 p-2.5 text-xs font-mono"
              >
                <div className="truncate max-w-[280px]">
                  <span className="text-neutral-200">"{h.payload}"</span>
                  <span className="text-[10px] text-neutral-500 ml-2">Slot #{h.slot}</span>
                </div>

                <a
                  href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${h.signature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:underline text-[11px] shrink-0 ml-2"
                >
                  <span>CookieScan</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
