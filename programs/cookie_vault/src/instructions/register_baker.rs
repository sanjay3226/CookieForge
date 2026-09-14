use anchor_lang::prelude::*;
use crate::state::{VaultState, BakerProfile, VAULT_STATE_SEED, BAKER_PROFILE_SEED};

#[derive(Accounts)]
pub struct RegisterBaker<'info> {
    #[account(
        mut,
        seeds = [VAULT_STATE_SEED],
        bump = vault_state.bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        init,
        payer = baker,
        space = BakerProfile::LEN,
        seeds = [BAKER_PROFILE_SEED, baker.key().as_ref()],
        bump
    )]
    pub baker_profile: Account<'info, BakerProfile>,

    #[account(mut)]
    pub baker: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterBaker>) -> Result<()> {
    let clock = Clock::get()?;
    let baker_profile = &mut ctx.accounts.baker_profile;
    baker_profile.owner = ctx.accounts.baker.key();
    baker_profile.reputation_xp = 50; // Welcome grant XP
    baker_profile.rank_tier = 0; // Novice
    baker_profile.fortunes_inscribed = 0;
    baker_profile.crumbs_donated = 0;
    baker_profile.joined_timestamp = clock.unix_timestamp;
    baker_profile.bump = ctx.bumps.baker_profile;

    let vault = &mut ctx.accounts.vault_state;
    vault.total_bakers = vault.total_bakers.saturating_add(1);

    msg!(
        "Registered new baker: {} on Cookie Chain. Initial reputation: 50 XP.",
        ctx.accounts.baker.key()
    );
    Ok(())
}
