// Multi-Wallet Hook with Native Nightly, Phantom & Solflare Support on Cookie Chain SVM
import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

export type WalletType = "nightly" | "phantom" | "solflare";

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  walletName: string | null;
  walletType: WalletType | null;
  balanceCook: number;
}

declare global {
  interface Window {
    nightly?: {
      solana?: {
        publicKey: { toBase58: () => string; toBuffer: () => Uint8Array };
        connect: () => Promise<{ publicKey: any }>;
        disconnect: () => Promise<void>;
        signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
        signTransaction: (tx: Transaction) => Promise<Transaction>;
        isConnected?: boolean;
      };
    };
    phantom?: {
      solana?: {
        publicKey: { toBase58: () => string };
        connect: () => Promise<{ publicKey: any }>;
        disconnect: () => Promise<void>;
        signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
        signTransaction: (tx: Transaction) => Promise<Transaction>;
        isPhantom?: boolean;
        isConnected?: boolean;
      };
    };
    solflare?: {
      publicKey: { toBase58: () => string };
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
      signTransaction: (tx: Transaction) => Promise<Transaction>;
      isConnected?: boolean;
    };
    solana?: any;
  }
}

export function useWallet(connection: Connection) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    walletName: null,
    walletType: null,
    balanceCook: 0,
  });

  // Refresh live balance from Cookie Chain RPC
  const refreshBalance = useCallback(
    async (pubkey: PublicKey) => {
      try {
        const lamports = await connection.getBalance(pubkey, "confirmed");
        setState((s) => ({ ...s, balanceCook: lamports / 1_000_000_000 }));
      } catch {
        // RPC fallback
      }
    },
    [connection]
  );

  // Auto-detect previously authorized Nightly connection
  useEffect(() => {
    if (window.nightly?.solana?.isConnected && window.nightly.solana.publicKey) {
      try {
        const pk = new PublicKey(window.nightly.solana.publicKey.toBase58());
        setState({
          connected: true,
          connecting: false,
          publicKey: pk,
          walletName: "Nightly Wallet",
          walletType: "nightly",
          balanceCook: 0,
        });
        refreshBalance(pk);
      } catch {
        // ignore
      }
    }
  }, [refreshBalance]);

  // Connect to Nightly Wallet
  const connectNightly = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true }));
    try {
      const nightly = window.nightly?.solana;
      if (!nightly) {
        window.open("https://nightly.app/", "_blank");
        throw new Error(
          "Nightly Wallet extension not detected! Please install Nightly from nightly.app."
        );
      }
      const res = await nightly.connect();
      const pk = new PublicKey(res.publicKey.toBase58());
      setState({
        connected: true,
        connecting: false,
        publicKey: pk,
        walletName: "Nightly Wallet",
        walletType: "nightly",
        balanceCook: 0,
      });
      refreshBalance(pk);
    } catch (err: any) {
      setState((s) => ({ ...s, connecting: false }));
      throw err;
    }
  }, [refreshBalance]);

  // Connect to Phantom or Solflare
  const connectStandard = useCallback(
    async (type: "phantom" | "solflare") => {
      setState((s) => ({ ...s, connecting: true }));
      try {
        let provider: any = null;
        let name = "";
        if (type === "phantom") {
          provider = window.phantom?.solana || window.solana;
          name = "Phantom";
        } else {
          provider = window.solflare;
          name = "Solflare";
        }

        if (!provider) {
          throw new Error(
            `${name} wallet not detected. Please install the extension or use Nightly.`
          );
        }

        await provider.connect();
        const pk = new PublicKey(provider.publicKey.toBase58());
        setState({
          connected: true,
          connecting: false,
          publicKey: pk,
          walletName: name,
          walletType: type,
          balanceCook: 0,
        });
        refreshBalance(pk);
      } catch (err) {
        setState((s) => ({ ...s, connecting: false }));
        throw err;
      }
    },
    [refreshBalance]
  );

  const disconnect = useCallback(async () => {
    try {
      if (state.walletType === "nightly" && window.nightly?.solana) {
        await window.nightly.solana.disconnect();
      } else if (state.walletType === "phantom" && window.phantom?.solana) {
        await window.phantom.solana.disconnect();
      } else if (state.walletType === "solflare" && window.solflare) {
        await window.solflare.disconnect();
      }
    } catch {
      // ignore
    }
    setState({
      connected: false,
      connecting: false,
      publicKey: null,
      walletName: null,
      walletType: null,
      balanceCook: 0,
    });
  }, [state.walletType]);

  // Real On-Chain Transaction Dispatcher to Cookie Chain RPC
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<{ signature: string }> => {
      if (!state.publicKey) {
        throw new Error("Wallet not connected. Please connect your Nightly or SVM wallet.");
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(
        "confirmed"
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = state.publicKey;

      let signature = "";
      if (state.walletType === "nightly" && window.nightly?.solana) {
        const res = await window.nightly.solana.signAndSendTransaction(transaction);
        signature = res.signature;
      } else if (state.walletType === "phantom" && window.phantom?.solana) {
        const res = await window.phantom.solana.signAndSendTransaction(transaction);
        signature = res.signature;
      } else if (state.walletType === "solflare" && window.solflare) {
        const res = await window.solflare.signAndSendTransaction(transaction);
        signature = res.signature;
      } else {
        throw new Error("No compatible wallet signer found.");
      }

      // Confirm transaction on Cookie Chain SVM
      await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature },
        "confirmed"
      );

      refreshBalance(state.publicKey);
      return { signature };
    },
    [state, connection, refreshBalance]
  );

  return {
    ...state,
    connectNightly,
    connectStandard,
    disconnect,
    sendTransaction,
    refreshBalance: () => state.publicKey && refreshBalance(state.publicKey),
  };
}
