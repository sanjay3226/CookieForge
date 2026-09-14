import { 
  PublicKey, 
  TransactionInstruction, 
  SystemProgram,
  AccountMeta 
} from "@solana/web3.js";

export const COOKIE_VAULT_PROGRAM_ID = new PublicKey(
  "CookVau1t1111111111111111111111111111111111"
);

// Seeds
export const VAULT_STATE_SEED = Buffer.from("vault_state");
export const BAKER_PROFILE_SEED = Buffer.from("baker_profile");
export const FORTUNE_RECORD_SEED = Buffer.from("fortune_record");

// Anchor Discriminators
export const DISCRIMINATORS = {
  initializeVault: new Uint8Array([48, 191, 163, 44, 71, 129, 63, 164]),
  registerBaker: new Uint8Array([204, 18, 142, 60, 203, 112, 177, 241]),
  bakeFortune: new Uint8Array([15, 87, 192, 184, 142, 227, 221, 126]),
  tipVault: new Uint8Array([112, 206, 149, 111, 230, 241, 114, 18]),
};

export interface BakerRankInfo {
  tier: number;
  title: string;
  badgeColor: string;
  nextTierXp: number;
}

export function getRankInfo(xp: number): BakerRankInfo {
  if (xp >= 5000) {
    return { tier: 4, title: "Grand Degen Baker", badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10", nextTierXp: 10000 };
  }
  if (xp >= 2000) {
    return { tier: 3, title: "Master Artisan", badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10", nextTierXp: 5000 };
  }
  if (xp >= 800) {
    return { tier: 2, title: "Pastry Chef", badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", nextTierXp: 2000 };
  }
  if (xp >= 250) {
    return { tier: 1, title: "Apprentice", badgeColor: "text-blue-400 border-blue-500/40 bg-blue-500/10", nextTierXp: 800 };
  }
  return { tier: 0, title: "Novice Baker", badgeColor: "text-neutral-400 border-neutral-700 bg-neutral-800/50", nextTierXp: 250 };
}

// PDA Derivations
export function getVaultStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_STATE_SEED],
    COOKIE_VAULT_PROGRAM_ID
  );
}

export function getBakerProfilePda(baker: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [BAKER_PROFILE_SEED, baker.toBuffer()],
    COOKIE_VAULT_PROGRAM_ID
  );
}

export function getFortuneRecordPda(baker: PublicKey, index: number): [PublicKey, number] {
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(BigInt(index));
  return PublicKey.findProgramAddressSync(
    [FORTUNE_RECORD_SEED, baker.toBuffer(), indexBuf],
    COOKIE_VAULT_PROGRAM_ID
  );
}

// Simple SHA-256 in browser using Web Crypto API
export async function computeFortuneHash(message: string): Promise<Uint8Array> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return new Uint8Array(hashBuffer);
}

// Instruction Builders
export function createRegisterBakerInstruction(baker: PublicKey): TransactionInstruction {
  const [vaultStatePda] = getVaultStatePda();
  const [bakerProfilePda] = getBakerProfilePda(baker);

  const keys: AccountMeta[] = [
    { pubkey: vaultStatePda, isSigner: false, isWritable: true },
    { pubkey: bakerProfilePda, isSigner: false, isWritable: true },
    { pubkey: baker, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: COOKIE_VAULT_PROGRAM_ID,
    data: Buffer.from(DISCRIMINATORS.registerBaker),
  });
}

export async function createBakeFortuneInstruction(
  baker: PublicKey,
  content: string,
  rarityTier: number,
  fortuneIndex: number
): Promise<TransactionInstruction> {
  const [vaultStatePda] = getVaultStatePda();
  const [bakerProfilePda] = getBakerProfilePda(baker);
  const [fortuneRecordPda] = getFortuneRecordPda(baker, fortuneIndex);

  const keys: AccountMeta[] = [
    { pubkey: vaultStatePda, isSigner: false, isWritable: true },
    { pubkey: bakerProfilePda, isSigner: false, isWritable: true },
    { pubkey: fortuneRecordPda, isSigner: false, isWritable: true },
    { pubkey: baker, isSigner: true, isWritable: true },
    { pubkey: baker, isSigner: false, isWritable: false }, // owner
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  // Serialize Anchor arguments: discriminator (8) + string length (4) + string bytes + rarity (1) + hash (32)
  const contentBytes = Buffer.from(content, "utf8");
  const hash = await computeFortuneHash(content);

  const data = Buffer.alloc(8 + 4 + contentBytes.length + 1 + 32);
  let offset = 0;

  DISCRIMINATORS.bakeFortune.forEach((byte) => {
    data.writeUInt8(byte, offset++);
  });

  data.writeUInt32LE(contentBytes.length, offset);
  offset += 4;

  contentBytes.copy(data, offset);
  offset += contentBytes.length;

  data.writeUInt8(rarityTier, offset++);

  Buffer.from(hash).copy(data, offset);

  return new TransactionInstruction({
    keys,
    programId: COOKIE_VAULT_PROGRAM_ID,
    data,
  });
}

export function createTipVaultInstruction(
  baker: PublicKey,
  lamports: number
): TransactionInstruction {
  const [vaultStatePda] = getVaultStatePda();
  const [bakerProfilePda] = getBakerProfilePda(baker);

  const keys: AccountMeta[] = [
    { pubkey: vaultStatePda, isSigner: false, isWritable: true },
    { pubkey: bakerProfilePda, isSigner: false, isWritable: true },
    { pubkey: baker, isSigner: true, isWritable: true },
    { pubkey: baker, isSigner: false, isWritable: false }, // owner
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const data = Buffer.alloc(8 + 8);
  let offset = 0;

  DISCRIMINATORS.tipVault.forEach((byte) => {
    data.writeUInt8(byte, offset++);
  });

  data.writeBigUInt64LE(BigInt(lamports), offset);

  return new TransactionInstruction({
    keys,
    programId: COOKIE_VAULT_PROGRAM_ID,
    data,
  });
}
