use anchor_lang::prelude::*;
use crate::state::{VaultState, VAULT_STATE_SEED};

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = VaultState::LEN,
        seeds = [VAULT_STATE_SEED],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault_state;
    vault.authority = ctx.accounts.authority.key();
    vault.total_fortunes = 0;
    vault.total_crumbs_donated = 0;
    vault.total_bakers = 0;
    vault.bump = ctx.bumps.vault_state;

    msg!("CookieForge on-chain vault initialized successfully on Cookie Chain!");
    Ok(())
}
