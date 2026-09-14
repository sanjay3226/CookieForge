use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("CookVau1t1111111111111111111111111111111111");

#[program]
pub mod cookie_vault {
    use super::*;

    /// Initialize the global CookieForge protocol vault state PDA.
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Register a new on-chain BakerProfile PDA for the signing wallet.
    pub fn register_baker(ctx: Context<RegisterBaker>) -> Result<()> {
        instructions::register_baker::handler(ctx)
    }

    /// Inscribe a cryptographic on-chain fortune, mint a FortuneRecord PDA, and level up baker XP.
    pub fn bake_fortune(
        ctx: Context<BakeFortune>,
        content: String,
        rarity_tier: u8,
        fortune_hash: [u8; 32],
    ) -> Result<()> {
        instructions::bake_fortune::handler(ctx, content, rarity_tier, fortune_hash)
    }

    /// Send a native COOK tip to the community vault PDA and earn crumb reputation XP.
    pub fn tip_vault(ctx: Context<TipVault>, lamports: u64) -> Result<()> {
        instructions::tip_vault::handler(ctx, lamports)
    }
}
