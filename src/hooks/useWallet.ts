// Multi-Wallet Hook with First-Class Nightly Support & $0 Zero-Cost Simulation Mode
import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { COOKIE_CHAIN_CONFIG } from "../utils/constants";

export type WalletType = "nightly" | "phantom" | "solflare" | "demo";

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  walletName: string | null;
  walletType: WalletType | null;
  balanceCook: number;
  isSimulationMode: boolean;
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
  // Ephemeral demo keypair for $0 zero-cost interactive testing
  const [demoKeypair, setDemoKeypair] = useState<Keypair | null>(() => Keypair.generate());

  const [state, setState] = useState<WalletState>(() => {
    const kp = Keypair.generate();
    return {
      connected: true,
      connecting: false,
      publicKey: kp.publicKey,
      walletName: "Cookie Tester ($0 Sandbox)",
      walletType: "demo",
      balanceCook: 420.69,
      isSimulationMode: true,
    };
  });

  // Refresh balance
  const refreshBalance = useCallback(async (pubkey: PublicKey) => {
    try {
      const lamports = await connection.getBalance(pubkey);
      setState((s) => ({ ...s, balanceCook: lamports / 1_000_000_000 }));
    } catch {
      // ignore
    }
  }, [connection]);

  // Connect to Nightly Wallet
  const connectNightly = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true }));
    try {
      const nightly = window.nightly?.solana;
      if (!nightly) {
        window.open("https://nightly.app/", "_blank");
        throw new Error("Nightly wallet extension not detected! Please install Nightly from nightly.app.");
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
        isSimulationMode: false,
      });
      refreshBalance(pk);
    } catch (err: any) {
      setState((s) => ({ ...s, connecting: false }));
      throw err;
    }
  }, [refreshBalance]);

  // Connect to Phantom or Solflare
  const connectStandard = useCallback(async (type: "phantom" | "solflare") => {
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
        throw new Error(`${name} wallet not detected. Please install extension or use Nightly.`);
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
        isSimulationMode: false,
      });
      refreshBalance(pk);
    } catch (err) {
      setState((s) => ({ ...s, connecting: false }));
      throw err;
    }
  }, [refreshBalance]);

  // Connect Zero-Cost Demo/Simulation Mode
  const connectDemoMode = useCallback(() => {
    const kp = Keypair.generate();
    setDemoKeypair(kp);
    setState({
      connected: true,
      connecting: false,
      publicKey: kp.publicKey,
      walletName: "Cookie Tester ($0 Sandbox)",
      walletType: "demo",
      balanceCook: 420.69, // Demo balance for free testing
      isSimulationMode: true,
    });
  }, []);

  const resetDemoBalance = useCallback(() => {
    setState((s) => ({
      ...s,
      balanceCook: 420.69,
    }));
  }, []);

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
      isSimulationMode: false,
    });
    setDemoKeypair(null);
  }, [state.walletType]);

  // Sign and send transaction wrapper
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<{ signature: string; isSimulated?: boolean }> => {
      if (!state.publicKey) throw new Error("Wallet not connected");

      // In $0 Simulation Mode:
      if (state.isSimulationMode || state.walletType === "demo") {
        try {
          const { blockhash } = await connection.getLatestBlockhash("confirmed");
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = state.publicKey;
          if (demoKeypair) {
            transaction.sign(demoKeypair);
          }
          // Attempt RPC simulation check
          const sim = await connection.simulateTransaction(transaction);
          // AccountNotFound is expected on mainnet RPC for freshly generated 0-balance demo keys
          if (sim.value.err && sim.value.err !== "AccountNotFound") {
            console.info("RPC Simulation trace:", sim.value.logs);
          }
        } catch {
          // Graceful fallback for offline / network spikes
        }

        // Sub-second simulated finality delay
        await new Promise((r) => setTimeout(r, 600));

        // Deduct a tiny demo gas fee or tip from demo balance
        setState((s) => ({
          ...s,
          balanceCook: Math.max(0, s.balanceCook - 0.0001),
        }));

        // Generate a base58 simulated signature
        const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        const pseudoSig = Array.from({ length: 88 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        return { signature: pseudoSig, isSimulated: true };
      }

      // Real Wallet Transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
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

      // Confirm with sub-second finality
      await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature },
        "confirmed"
      );

      refreshBalance(state.publicKey);
      return { signature, isSimulated: false };
    },
    [state, connection, demoKeypair, refreshBalance]
  );

  return {
    ...state,
    connectNightly,
    connectStandard,
    connectDemoMode,
    resetDemoBalance,
    disconnect,
    sendTransaction,
    refreshBalance: () => state.publicKey && refreshBalance(state.publicKey),
  };
}
