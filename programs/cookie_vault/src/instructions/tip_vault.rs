use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::errors::CookieForgeError;
use crate::state::{VaultState, BakerProfile, VAULT_STATE_SEED, BAKER_PROFILE_SEED};

#[derive(Accounts)]
pub struct TipVault<'info> {
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

    #[account(mut)]
    pub baker: Signer<'info>,

    /// CHECK: Validated by has_one constraint on baker_profile
    pub owner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<TipVault>, lamports: u64) -> Result<()> {
    require!(lamports > 0, CookieForgeError::ZeroTipAmount);

    // CPI transfer lamports from baker into the vault_state PDA
    let cpi_accounts = Transfer {
        from: ctx.accounts.baker.to_account_info(),
        to: ctx.accounts.vault_state.to_account_info(),
    };
    let cpi_program = ctx.accounts.system_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    transfer(cpi_ctx, lamports)?;

    // Update global vault metrics
    let vault = &mut ctx.accounts.vault_state;
    vault.total_crumbs_donated = vault.total_crumbs_donated.saturating_add(lamports);

    // Update Baker Profile & award on-chain crumb XP
    let profile = &mut ctx.accounts.baker_profile;
    profile.crumbs_donated = profile.crumbs_donated.saturating_add(lamports);

    // 1 XP per 100_000 lamports (0.0001 COOK)
    let xp_earned = (lamports / 100_000).max(10);
    profile.reputation_xp = profile.reputation_xp.saturating_add(xp_earned);
    profile.rank_tier = profile.compute_rank();

    msg!(
        "Baker {} contributed {} lamports to community vault PDA. +{} XP earned. New rank: {}",
        ctx.accounts.baker.key(),
        lamports,
        xp_earned,
        profile.rank_tier
    );

    Ok(())
}
