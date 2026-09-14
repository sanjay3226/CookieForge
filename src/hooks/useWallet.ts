// Multi-Wallet Hook with Native Nightly, Phantom & Solflare Support on Cookie Chain SVM
import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export type WalletType = "nightly" | "phantom" | "solflare" | "injected";

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
      solana?: any;
    };
    phantom?: {
      solana?: any;
    };
    solflare?: any;
    solana?: any;
  }
}

// Bulletproof public key extractor across all wallet extensions and SDK versions
async function extractPublicKey(res: any, provider: any): Promise<PublicKey> {
  // First attempt: check direct returned payload or provider properties
  let candidate =
    res?.publicKey ||
    provider?.publicKey ||
    provider?.account?.publicKey ||
    res?.account?.publicKey ||
    res?.address ||
    provider?.address ||
    provider?.selectedAddress ||
    (res && typeof res.toBase58 === "function" ? res : null) ||
    (typeof res === "string" && res.length >= 32 ? res : null);

  // If candidate is still not resolved, wait 120ms tick in case wallet updates state asynchronously
  if (!candidate && provider) {
    await new Promise((r) => setTimeout(r, 120));
    candidate =
      provider?.publicKey ||
      provider?.account?.publicKey ||
      provider?.address ||
      provider?.selectedAddress;
  }

  if (!candidate) {
    throw new Error(
      "Wallet connection approved, but no account address was returned. Please make sure your wallet is unlocked and an account is selected."
    );
  }

  try {
    if (candidate instanceof PublicKey) {
      return candidate;
    }
    if (typeof candidate === "string") {
      return new PublicKey(candidate);
    }
    if (typeof candidate.toBase58 === "function") {
      return new PublicKey(candidate.toBase58());
    }
    if (typeof candidate.toString === "function") {
      const str = candidate.toString();
      if (str && str !== "[object Object]") {
        return new PublicKey(str);
      }
    }
    return new PublicKey(candidate);
  } catch (e: any) {
    throw new Error(`Failed to parse wallet address: ${e.message || "Invalid public key"}`);
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

  // Auto-detect previously authorized Nightly / Phantom / Solflare connection
  useEffect(() => {
    const nightly = window.nightly?.solana || (window.solana?.isNightly ? window.solana : null);
    const phantom = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
    const solflare = window.solflare;

    const checkExisting = async () => {
      if (nightly?.isConnected && nightly?.publicKey) {
        try {
          const pk = await extractPublicKey(null, nightly);
          setState({
            connected: true,
            connecting: false,
            publicKey: pk,
            walletName: "Nightly Wallet",
            walletType: "nightly",
            balanceCook: 0,
          });
          refreshBalance(pk);
          return;
        } catch {
          // ignore
        }
      }

      if (phantom?.isConnected && phantom?.publicKey) {
        try {
          const pk = await extractPublicKey(null, phantom);
          setState({
            connected: true,
            connecting: false,
            publicKey: pk,
            walletName: "Phantom",
            walletType: "phantom",
            balanceCook: 0,
          });
          refreshBalance(pk);
          return;
        } catch {
          // ignore
        }
      }

      if (solflare?.isConnected && solflare?.publicKey) {
        try {
          const pk = await extractPublicKey(null, solflare);
          setState({
            connected: true,
            connecting: false,
            publicKey: pk,
            walletName: "Solflare",
            walletType: "solflare",
            balanceCook: 0,
          });
          refreshBalance(pk);
        } catch {
          // ignore
        }
      }
    };

    checkExisting();
  }, [refreshBalance]);

  // Connect to Nightly Wallet (Native Cookie Chain SVM)
  const connectNightly = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true }));
    try {
      const nightly = window.nightly?.solana || (window.solana?.isNightly ? window.solana : null);
      if (!nightly) {
        window.open("https://nightly.app/", "_blank");
        throw new Error(
          "Nightly Wallet extension not detected! Please install Nightly from nightly.app and reload this page."
        );
      }

      const res = await nightly.connect();
      const pk = await extractPublicKey(res, nightly);

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
      if (
        err?.code === 4001 ||
        err?.message?.toLowerCase().includes("reject") ||
        err?.message?.toLowerCase().includes("cancel") ||
        err?.message?.toLowerCase().includes("closed")
      ) {
        throw new Error("Connection request cancelled.");
      }
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
          provider = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
          name = "Phantom";
        } else {
          provider = window.solflare || (window.solana?.isSolflare ? window.solana : null);
          name = "Solflare";
        }

        if (!provider) {
          if (type === "phantom") {
            window.open("https://phantom.app/", "_blank");
          } else {
            window.open("https://solflare.com/", "_blank");
          }
          throw new Error(
            `${name} wallet extension not detected. Please install ${name} or use Nightly Wallet.`
          );
        }

        const res = await provider.connect();
        const pk = await extractPublicKey(res, provider);

        setState({
          connected: true,
          connecting: false,
          publicKey: pk,
          walletName: name,
          walletType: type,
          balanceCook: 0,
        });
        refreshBalance(pk);
      } catch (err: any) {
        setState((s) => ({ ...s, connecting: false }));
        if (
          err?.code === 4001 ||
          err?.message?.toLowerCase().includes("reject") ||
          err?.message?.toLowerCase().includes("cancel") ||
          err?.message?.toLowerCase().includes("closed")
        ) {
          throw new Error("Connection request cancelled.");
        }
        throw err;
      }
    },
    [refreshBalance]
  );

  // Connect to generic Injected SVM Wallet (Backpack, OKX, etc.)
  const connectInjected = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true }));
    try {
      const provider = window.solana;
      if (!provider) {
        throw new Error(
          "No browser SVM/Solana wallet detected. Please install Nightly, Phantom, or Solflare."
        );
      }

      const res = await provider.connect();
      const pk = await extractPublicKey(res, provider);

      const detectedName = provider.isNightly
        ? "Nightly Wallet"
        : provider.isPhantom
        ? "Phantom"
        : provider.isSolflare
        ? "Solflare"
        : provider.isBackpack
        ? "Backpack"
        : "SVM Wallet";

      setState({
        connected: true,
        connecting: false,
        publicKey: pk,
        walletName: detectedName,
        walletType: "injected",
        balanceCook: 0,
      });
      refreshBalance(pk);
    } catch (err: any) {
      setState((s) => ({ ...s, connecting: false }));
      if (
        err?.code === 4001 ||
        err?.message?.toLowerCase().includes("reject") ||
        err?.message?.toLowerCase().includes("cancel") ||
        err?.message?.toLowerCase().includes("closed")
      ) {
        throw new Error("Connection request cancelled.");
      }
      throw err;
    }
  }, [refreshBalance]);

  const disconnect = useCallback(async () => {
    try {
      const nightly = window.nightly?.solana || (window.solana?.isNightly ? window.solana : null);
      const phantom = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
      const solflare = window.solflare || (window.solana?.isSolflare ? window.solana : null);
      const injected = window.solana;

      if (state.walletType === "nightly" && nightly) {
        await nightly.disconnect();
      } else if (state.walletType === "phantom" && phantom) {
        await phantom.disconnect();
      } else if (state.walletType === "solflare" && solflare) {
        await solflare.disconnect();
      } else if (state.walletType === "injected" && injected?.disconnect) {
        await injected.disconnect();
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

      const nightly = window.nightly?.solana || (window.solana?.isNightly ? window.solana : null);
      const phantom = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
      const solflare = window.solflare || (window.solana?.isSolflare ? window.solana : null);
      const injected = window.solana;

      const provider =
        (state.walletType === "nightly" ? nightly : null) ||
        (state.walletType === "phantom" ? phantom : null) ||
        (state.walletType === "solflare" ? solflare : null) ||
        injected;

      if (!provider) {
        throw new Error("No compatible wallet signer found.");
      }

      let signature = "";
      if (typeof provider.signAndSendTransaction === "function") {
        const res = await provider.signAndSendTransaction(transaction);
        signature = typeof res === "string" ? res : res.signature;
      } else if (typeof provider.signTransaction === "function") {
        const signedTx = await provider.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });
      } else {
        throw new Error("Connected wallet does not support transaction signing.");
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
    connectInjected,
    disconnect,
    sendTransaction,
    refreshBalance: () => state.publicKey && refreshBalance(state.publicKey),
  };
}
