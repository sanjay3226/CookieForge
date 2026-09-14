use anchor_lang::prelude::*;
use crate::errors::CookieForgeError;
use crate::state::{
    VaultState, 
    BakerProfile, 
    FortuneRecord, 
    VAULT_STATE_SEED, 
    BAKER_PROFILE_SEED, 
    FORTUNE_RECORD_SEED
};

#[derive(Accounts)]
pub struct BakeFortune<'info> {
    #[account(
        mut,
        seeds = [VAULT_STATE_SEED],
        bump = vault_state.bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [BAKER_PROFILE_SEED, baker.key().as_ref()],
        bump = baker_profile.bump,
        has_one = owner @ CookieForgeError::Unauthorized
    )]
    pub baker_profile: Account<'info, BakerProfile>,

    #[account(
        init,
        payer = baker,
        space = FortuneRecord::LEN,
        seeds = [
            FORTUNE_RECORD_SEED, 
            baker.key().as_ref(), 
            &baker_profile.fortunes_inscribed.to_le_bytes()
        ],
        bump
    )]
    pub fortune_record: Account<'info, FortuneRecord>,

    #[account(mut)]
    pub baker: Signer<'info>,

    /// CHECK: Validated by has_one constraint on baker_profile
    pub owner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<BakeFortune>,
    content: String,
    rarity_tier: u8,
    fortune_hash: [u8; 32],
) -> Result<()> {
    require!(!content.trim().is_empty(), CookieForgeError::EmptyMessage);
    require!(
        content.len() <= FortuneRecord::MAX_CONTENT_LEN,
        CookieForgeError::MessageTooLong
    );
    require!(rarity_tier <= 4, CookieForgeError::InvalidRarity);

    let clock = Clock::get()?;
    let current_slot = clock.slot;
    let unix_ts = clock.unix_timestamp;

    // Populate FortuneRecord PDA
    let fortune = &mut ctx.accounts.fortune_record;
    fortune.baker = ctx.accounts.baker.key();
    fortune.fortune_index = ctx.accounts.baker_profile.fortunes_inscribed;
    fortune.fortune_hash = fortune_hash;
    fortune.rarity_tier = rarity_tier;
    fortune.content = content.clone();
    fortune.slot = current_slot;
    fortune.timestamp = unix_ts;
    fortune.bump = ctx.bumps.fortune_record;

    // Update BakerProfile metrics & on-chain XP
    let profile = &mut ctx.accounts.baker_profile;
    profile.fortunes_inscribed = profile.fortunes_inscribed.saturating_add(1);

    // Dynamic XP formula: 100 base + (50 * rarity_tier)
    let xp_earned = 100u64.saturating_add((rarity_tier as u64).saturating_mul(50));
    profile.reputation_xp = profile.reputation_xp.saturating_add(xp_earned);
    profile.rank_tier = profile.compute_rank();

    // Increment global vault counter
    let vault = &mut ctx.accounts.vault_state;
    vault.total_fortunes = vault.total_fortunes.saturating_add(1);

    msg!(
        "Baked on-chain fortune #{} for baker {}. Slot: {}, Rarity: {}, XP gained: +{}",
        fortune.fortune_index,
        ctx.accounts.baker.key(),
        current_slot,
        rarity_tier,
        xp_earned
    );

    Ok(())
}
