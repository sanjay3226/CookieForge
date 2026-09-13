import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Settings } from "lucide-react";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fields = [
    { label: "Network Name", value: COOKIE_CHAIN_CONFIG.name },
    { label: "RPC Endpoint", value: COOKIE_CHAIN_CONFIG.rpcUrl },
    { label: "WebSocket URL", value: COOKIE_CHAIN_CONFIG.wssUrl },
    { label: "Genesis Hash", value: COOKIE_CHAIN_CONFIG.genesisHash },
    { label: "Chain Domain / ID", value: String(COOKIE_CHAIN_CONFIG.domain) },
    { label: "Currency Symbol", value: COOKIE_CHAIN_CONFIG.symbol },
    { label: "Block Explorer", value: COOKIE_CHAIN_CONFIG.explorerUrl },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0f1218] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-amber-400" />
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            Nightly Network RPC Parameters
          </h3>
        </div>
        <p className="text-xs text-neutral-400 font-mono mb-4">
          Settings → Networks / Custom RPC → Solana → Add Network
        </p>

        <div className="space-y-2">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/40 p-2.5 text-xs font-mono"
            >
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">{f.label}</span>
                <span className="text-neutral-200 break-all">{f.value}</span>
              </div>

              <button
                onClick={() => copyToClipboard(f.value, f.label)}
                className="ml-2 shrink-0 rounded p-1 text-neutral-400 hover:bg-white/[0.05] hover:text-amber-400 transition"
                title="Copy"
              >
                {copiedField === f.label ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2 font-mono">
          <a
            href={COOKIE_CHAIN_CONFIG.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-white/[0.08] bg-black/40 py-2 text-xs text-neutral-300 hover:text-white transition"
          >
            <span>Documentation</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 py-2 text-xs font-bold text-neutral-950 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
