import React, { useState, useCallback } from "react";
import {
  Send,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Layers,
  Info,
} from "lucide-react";
import { Transaction, SystemProgram, PublicKey, Connection } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { COOKIE_CHAIN_CONFIG, CREATOR_WALLET } from "../utils/constants";
import { shortenAddress } from "../utils/format";
import { playSuccessChime } from "../utils/audio";

interface Props {
  connection: Connection;
  wallet: {
    connected: boolean;
    connecting: boolean;
    publicKey: PublicKey | null;
    balanceCook: number;
    connectNightly: () => Promise<void>;
    sendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
  };
}

interface InscriptionRecord {
  payload: string;
  slot: number;
  timestamp: string;
  signature: string;
  latencyMs: number;
}

const EXAMPLES = [
  "gm Cookie Chain 🍪",
  "Building on-chain with CookieForge",
  "Superteam Earn Bounty — Hello World",
];

export const FortuneBakery: React.FC<Props> = ({ wallet, connection }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<InscriptionRecord | null>(null);
  const [history, setHistory] = useState<InscriptionRecord[]>([]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!wallet.connected) {
      try { await wallet.connectNightly(); }
      catch (err: any) { setError(err?.message || "Please connect your wallet first."); }
      return;
    }

    const text = message.trim();
    if (!text) { setError("Please type a message first."); return; }
    if (text.length > 128) { setError("Message is too long (max 128 characters)."); return; }

    setIsSending(true);
    setError(null);
    const t0 = Date.now();

    try {
      // Always use the on-chain Memo program — guaranteed to work on Cookie Chain
      // The memo program (MemoSq4...) is a standard Solana-compatible program
      const tx = new Transaction();

      // Tag the memo so it shows up in the explorer with CookieForge branding
      tx.add(
        createMemoInstruction(
          `[CookieForge] ${text}`,
          wallet.publicKey!
        )
      );

      // Attach a self-transfer dust so it registers as a transfer in explorer views
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey!,
          toPubkey: wallet.publicKey!,
          lamports: 1_000, // 0.000001 COOK
        })
      );

      const { signature } = await wallet.sendTransaction(tx);
      const latency = Date.now() - t0;

      // Play success audio
      playSuccessChime();

      // Best-effort slot fetch
      let slot = 0;
      try { slot = await connection.getSlot("confirmed"); } catch {}

      const rec: InscriptionRecord = {
        payload: text,
        slot,
        timestamp: new Date().toLocaleTimeString(),
        signature,
        latencyMs: latency,
      };

      setReceipt(rec);
      setHistory((prev) => [rec, ...prev.slice(0, 9)]);
      setMessage("");
    } catch (err: any) {
      const msg: string = err?.message || "";
      // Surface a human-readable error
      if (msg.includes("rejected") || msg.includes("User rejected") || msg.includes("cancelled")) {
        setError("You cancelled the transaction.");
      } else if (msg.includes("insufficient") || msg.includes("0x1")) {
        setError("Not enough COOK for the fee. Your balance is too low.");
      } else if (msg.includes("blockhash")) {
        setError("Network timeout — please try again.");
      } else {
        setError(msg || "Transaction failed. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  }, [message, wallet, connection]);

  return (
    <div className="space-y-4">
      {/* Main Write Card */}
      <div className="card p-6">
        <div className="pb-4 border-b border-white/[0.07] mb-5">
          <h2 className="text-xl font-bold text-white"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Write a Message to the Blockchain
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            Your message is stored permanently on Cookie Chain. It lives forever — verifiable by anyone.
          </p>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Message textarea */}
          <div>
            <textarea
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(null); }}
              placeholder="Type anything — a note, a declaration, a gm, a URL…"
              rows={3}
              maxLength={128}
              disabled={isSending}
              className="field resize-none font-sans text-sm leading-relaxed"
            />
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#475569]">
              {/* Example suggestions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span>Try:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => { setMessage(ex); setError(null); }}
                    className="rounded bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 hover:text-amber-300 hover:border-amber-500/30 transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <span className={message.length > 110 ? "text-red-400 font-semibold" : ""}>{message.length}/128</span>
            </div>
          </div>

          {/* Cost info strip */}
          <div className="rounded-xl border border-white/[0.05] bg-black/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#475569]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Network: <strong className="text-[#94a3b8]">Cookie Chain SVM · Mainnet</strong></span>
            </span>
            <span>Fee: <strong className="text-emerald-400">~0.000001 COOK</strong></span>
            <span>Confirms in: <strong className="text-amber-300">&lt;1 second</strong></span>
          </div>

          {/* How it works note */}
          <div className="flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] px-3 py-2.5 text-[11px] text-[#60a5fa]">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Uses the <strong>Memo program</strong> — a standard Solana instruction that embeds any UTF-8 text permanently into a transaction on Cookie Chain.
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300 anim-fade-in flex items-start justify-between gap-2">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-white shrink-0 text-lg leading-none">×</button>
            </div>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isSending || (!wallet.connected && wallet.connecting)}
            className="btn-primary w-full py-3.5 text-sm"
          >
            {isSending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending to Cookie Chain…
              </>
            ) : !wallet.connected ? (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet &amp; Publish
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish Forever On-Chain
              </>
            )}
          </button>
        </form>

        {/* Success Receipt */}
        {receipt && (
          <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 anim-scale-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold"
                   style={{ fontFamily: "Georgia, serif" }}>
                <CheckCircle2 className="h-5 w-5" />
                <span>Published forever ✓</span>
              </div>
              <span className="text-[11px] font-mono text-[#475569]">
                {receipt.latencyMs}ms · block {receipt.slot.toLocaleString()}
              </span>
            </div>

            <blockquote className="text-[#e2e8f0] text-sm border-l-2 border-emerald-500/40 pl-3 italic"
                        style={{ fontFamily: "Georgia, serif" }}>
              "{receipt.payload}"
            </blockquote>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#475569] pt-1 border-t border-white/[0.05]">
              <span>{shortenAddress(receipt.signature, 10)}</span>
              <a
                href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${receipt.signature}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Session History */}
      {history.length > 0 && (
        <div className="card p-4 anim-fade-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
              Published this session
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {history.length} on-chain
            </span>
          </div>

          <div className="space-y-1.5">
            {history.map((h) => (
              <a
                key={h.signature}
                href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${h.signature}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2 text-xs group hover:border-amber-500/20 hover:bg-amber-500/[0.02] transition"
              >
                <span className="text-[#94a3b8] truncate max-w-[280px] font-sans">"{h.payload}"</span>
                <div className="flex items-center gap-1 text-[#475569] group-hover:text-amber-400 transition shrink-0 ml-2 font-mono">
                  <span className="text-[10px]">{shortenAddress(h.signature, 4)}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* About the Memo Program */}
      <div className="card p-4 anim-fade-up">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 grid place-items-center shrink-0">
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>
              How does this work?
            </h3>
            <p className="text-[12px] text-[#64748b] leading-relaxed">
              CookieForge writes your message as a <strong className="text-[#94a3b8]">Memo instruction</strong> directly
              into a Cookie Chain transaction. The Memo program is a built-in standard on all Solana-compatible
              chains — your text is stored in the transaction forever, readable from any block explorer.
            </p>
            <a
              href={`${COOKIE_CHAIN_CONFIG.explorerUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-mono text-amber-400 hover:underline"
            >
              Browse past inscriptions on CookieScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
