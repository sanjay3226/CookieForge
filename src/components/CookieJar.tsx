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
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f16]/95 p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
              Builder & Creator Treasury
            </h3>
            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300 font-bold">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Vault: <span className="text-neutral-200 font-bold">{shortenAddress(CREATOR_WALLET, 6)}</span>
          </p>
        </div>

        <a
          href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/address/${CREATOR_WALLET}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-amber-400 hover:border-amber-500/30 transition"
        >
          <span>Explorer</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 space-y-3.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-400 font-mono">Select Tip Amount:</span>
          <span className="font-mono text-neutral-500 text-[11px]">Direct On-Chain Transfer</span>
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
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.99] py-3 text-xs font-bold text-neutral-950 transition disabled:opacity-50 shadow-lg shadow-amber-500/10"
        >
          {isSending ? (
            <span>Signing & Transferring...</span>
          ) : !wallet.connected ? (
            <>
              <Wallet className="h-4 w-4" />
              <span>Connect Nightly to Tip Builder</span>
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              <span>Send {tipAmount} COOK to Creator Vault</span>
            </>
          )}
        </button>

        {receipt && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 text-xs text-emerald-400 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Grant Dispatched on Cookie Chain!</span>
            </div>
            <a
              href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${receipt.signature}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:underline font-mono text-[11px] font-bold"
            >
              <span>CookieScan</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
