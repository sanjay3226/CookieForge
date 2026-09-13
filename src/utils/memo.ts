// Helper to build SVM Memo v1 instruction for on-chain fortune baking & inscriptions
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { COOKIE_PROGRAMS } from "./constants";

/**
 * Creates an instruction that writes a UTF-8 string memo to Cookie Chain
 */
export function createMemoInstruction(
  memoText: string,
  signerPubkey: PublicKey
): TransactionInstruction {
  const memoProgramId = new PublicKey(COOKIE_PROGRAMS.memo);
  return new TransactionInstruction({
    keys: [{ pubkey: signerPubkey, isSigner: true, isWritable: true }],
    programId: memoProgramId,
    data: Buffer.from(memoText, "utf-8"),
  });
}
