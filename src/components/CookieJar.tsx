import React, { useState } from "react";
import { Coins, ExternalLink, Send, CheckCircle2, ShieldCheck, ArrowUpRight, Wallet } from "lucide-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { CREATOR_WALLET, COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { shortenAddress } from "../utils/format";
import { playSuccessChime } from "../utils/audio";

interface CommunityTreasuryProps {
  wallet: {
    connected: boolean;
    publicKey: any;
    balanceCook: number;
    sendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
    connectNightly: () => Promise<void>;
  };
}

interface TreasuryReceipt {
  signature: string;
  amount: string;
}

export const CookieJar: React.FC<CommunityTreasuryProps> = ({ wallet }) => {
  const [tipAmount, setTipAmount] = useState("0.1");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TreasuryReceipt | null>(null);

  const handleSendTip = async () => {
    if (!wallet.connected) {
      try {
        await wallet.connectNightly();
      } catch (e: any) {
        setErrorMessage(e?.message || "Please connect your wallet first.");
      }
      return;
    }

    const num = parseFloat(tipAmount);
    if (isNaN(num) || num <= 0) return;

    setIsSending(true);
    setReceipt(null);
    setErrorMessage(null);

    try {
      const lamports = Math.floor(num * 1_000_000_000);
      const recipient = new PublicKey(CREATOR_WALLET);

      const tx = new Transaction();
      tx.add(
        createMemoInstruction(
          `[BuilderGrant] Tip: ${num} COOK to Sanjay | CookieForge`,
          wallet.publicKey
        )
      );
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      const res = await wallet.sendTransaction(tx);
      playSuccessChime();

      setReceipt({
        signature: res.signature,
        amount: tipAmount,
      });
    } catch (err: any) {
      console.error("Tip transfer error:", err);
      setErrorMessage(err?.message || "Failed to send tip. Ensure sufficient COOK balance.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Tip the Creator
          </h3>
          <p className="text-[11px] text-[#64748b] mt-0.5 font-mono">
            Send COOK directly to Sanjay on-chain
          </p>
        </div>

        <a
          href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${CREATOR_WALLET}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] font-mono text-[#475569] hover:text-amber-400 transition"
        >
          <span>{shortenAddress(CREATOR_WALLET, 4)}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#94a3b8] font-mono">Choose amount:</span>
          <span className="font-mono text-[#475569] text-[10px]">Sent on-chain directly</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["0.05", "0.1", "0.5", "1.0"].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setTipAmount(amt);
                setReceipt(null);
                setErrorMessage(null);
              }}
              className={`rounded-xl py-2 font-mono text-xs transition border ${
                tipAmount === amt
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold shadow-md"
                  : "border-white/[0.06] bg-black/40 text-neutral-400 hover:text-white"
              }`}
            >
              {amt} COOK
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="number"
            step="0.01"
            value={tipAmount}
            onChange={(e) => {
              setTipAmount(e.target.value);
              setReceipt(null);
              setErrorMessage(null);
            }}
            placeholder="Custom amount"
            className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono shadow-inner"
          />
          <span className="absolute right-3.5 top-2.5 text-xs font-mono text-amber-400 font-bold">COOK</span>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-mono text-red-300">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleSendTip}
          disabled={isSending}
          className="btn-primary w-full py-3"
        >
          {isSending ? (
            <span>Sending…</span>
          ) : !wallet.connected ? (
            <>
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet to Send Tip</span>
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              <span>Send {tipAmount} COOK</span>
            </>
          )}
        </button>

        {receipt && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-3 text-xs text-emerald-400 anim-scale-in">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Tip sent!</span>
            </div>
            <a
              href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${receipt.signature}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:underline font-mono text-[11px] font-bold"
            >
              <span>View on Explorer</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
