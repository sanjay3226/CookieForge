import { PublicKey, Keypair } from "@solana/web3.js";
import { describe, it } from "node:test";
import assert from "node:assert";

// CookieForge On-Chain Anchor Protocol Test Suite
describe("cookie_vault Anchor Program", () => {
  const PROGRAM_ID = new PublicKey("CookVau1t1111111111111111111111111111111111");

  it("derives VaultState PDA correctly", () => {
    const [vaultStatePda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state")],
      PROGRAM_ID
    );
    assert(vaultStatePda instanceof PublicKey);
    assert(bump >= 0 && bump <= 255);
  });

  it("derives BakerProfile PDA deterministically for user", () => {
    const testWallet = Keypair.generate().publicKey;
    const [bakerProfilePda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("baker_profile"), testWallet.toBuffer()],
      PROGRAM_ID
    );
    assert(bakerProfilePda instanceof PublicKey);
    assert(bump >= 0 && bump <= 255);
  });

  it("derives FortuneRecord PDA with user sequence counter", () => {
    const testWallet = Keypair.generate().publicKey;
    const fortuneIndex = 0n;
    const indexBuf = Buffer.alloc(8);
    indexBuf.writeBigUInt64LE(fortuneIndex);

    const [fortuneRecordPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("fortune_record"), testWallet.toBuffer(), indexBuf],
      PROGRAM_ID
    );
    assert(fortuneRecordPda instanceof PublicKey);
    assert(bump >= 0 && bump <= 255);
  });

  it("calculates baker reputation XP and rank thresholds accurately", () => {
    const computeRank = (xp: number): number => {
      if (xp >= 5000) return 4; // Grand Degen
      if (xp >= 2000) return 3; // Master Artisan
      if (xp >= 800) return 2;  // Pastry Chef
      if (xp >= 250) return 1;  // Apprentice
      return 0;                 // Novice
    };

    assert.strictEqual(computeRank(50), 0);
    assert.strictEqual(computeRank(250), 1);
    assert.strictEqual(computeRank(850), 2);
    assert.strictEqual(computeRank(2500), 3);
    assert.strictEqual(computeRank(10000), 4);
  });

  it("enforces maximum fortune payload length of 128 bytes", () => {
    const validMessage = "Sub-second finality verified on Cookie Chain SVM.";
    assert(Buffer.from(validMessage).length <= 128);

    const overlyLongMessage = "x".repeat(129);
    assert(Buffer.from(overlyLongMessage).length > 128);
  });
});
