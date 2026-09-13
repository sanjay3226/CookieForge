import React, { useState } from "react";
import { Coins, ExternalLink, Send, CheckCircle2, ShieldCheck, ArrowUpRight, FlaskConical } from "lucide-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { createMemoInstruction } from "../utils/memo";
import { COMMUNITY_COOKIE_JAR, COOKIE_CHAIN_CONFIG } from "../utils/constants";
import { shortenAddress } from "../utils/format";
import { playSuccessChime } from "../utils/audio";

interface CommunityTreasuryProps {
  wallet: {
    connected: boolean;
    publicKey: any;
    balanceCook: number;
    isSimulationMode: boolean;
    sendTransaction: (tx: Transaction) => Promise<{ signature: string; isSimulated?: boolean }>;
    connectDemoMode: () => void;
  };
}

interface TreasuryReceipt {
  isSimulated: boolean;
  signature: string;
  amount: string;
}

export const CookieJar: React.FC<CommunityTreasuryProps> = ({ wallet }) => {
  const [tipAmount, setTipAmount] = useState("0.1");
  const [isSending, setIsSending] = useState(false);
  const [receipt, setReceipt] = useState<TreasuryReceipt | null>(null);

  const handleSendTip = async () => {
    if (!wallet.connected) {
      wallet.connectDemoMode();
      return;
    }

    const num = parseFloat(tipAmount);
    if (isNaN(num) || num <= 0) return;

    setIsSending(true);
    setReceipt(null);

    try {
      const lamports = Math.floor(num * 1_000_000_000);
      const recipient = new PublicKey(COMMUNITY_COOKIE_JAR);

      const tx = new Transaction();
      tx.add(
        createMemoInstruction(
          `[PublicGoods] Grant: ${num} COOK | CookieForge`,
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
        isSimulated: res.isSimulated ?? wallet.isSimulationMode,
        signature: res.signature,
        amount: tipAmount,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f1218]/90 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
            Ecosystem Public Goods Treasury
          </h3>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Vault: {shortenAddress(COMMUNITY_COOKIE_JAR, 5)}
          </p>
        </div>
        <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
          Non-Custodial
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-400">Select Allocation:</span>
          <span className="font-mono text-neutral-500 text-[11px]">Direct Transfer</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["0.05", "0.1", "0.5", "1.0"].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setTipAmount(amt);
                setReceipt(null);
              }}
              className={`rounded-lg py-1.5 font-mono text-xs transition border ${
                tipAmount === amt
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold"
                  : "border-white/[0.06] bg-black/30 text-neutral-400 hover:text-white"
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
            }}
            placeholder="Custom amount"
            className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none font-mono"
          />
          <span className="absolute right-3 top-2 text-xs font-mono text-neutral-500">COOK</span>
        </div>

        <button
          onClick={handleSendTip}
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
        >
          {isSending ? (
            <span>Broadcasting Transaction...</span>
          ) : (
            <>
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {wallet.isSimulationMode
                  ? `Simulate ${tipAmount} COOK Grant (Sandbox)`
                  : `Contribute ${tipAmount} COOK to Treasury`}
              </span>
            </>
          )}
        </button>

        {receipt && (
          <div className="animate-in fade-in">
            {receipt.isSimulated ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>Sandbox Grant Dispatched</span>
                </div>
                <p className="text-neutral-300 font-sans text-[11px]">
                  Simulated transfer of {receipt.amount} COOK to Community Vault. Zero real funds moved.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 text-xs text-emerald-400">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Grant Dispatched On-Chain</span>
                </div>
                <a
                  href={`${COOKIE_CHAIN_CONFIG.explorerUrl}/tx/${receipt.signature}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-0.5 text-amber-400 hover:underline font-mono text-[10px]"
                >
                  <span>CookieScan</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
