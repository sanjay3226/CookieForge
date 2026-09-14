use anchor_lang::prelude::*;

pub const VAULT_STATE_SEED: &[u8] = b"vault_state";
pub const BAKER_PROFILE_SEED: &[u8] = b"baker_profile";
pub const FORTUNE_RECORD_SEED: &[u8] = b"fortune_record";

#[account]
pub struct VaultState {
    /// Protocol governance authority
    pub authority: Pubkey,
    /// Total number of fortunes inscribed across Cookie Chain
    pub total_fortunes: u64,
    /// Cumulative tips contributed to community public goods (in lamports)
    pub total_crumbs_donated: u64,
    /// Total registered bakers on the network
    pub total_bakers: u64,
    /// PDA bump seed
    pub bump: u8,
}

impl VaultState {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct BakerProfile {
    /// Wallet address of the baker
    pub owner: Pubkey,
    /// Cumulative reputation XP earned from baking and public goods contributions
    pub reputation_xp: u64,
    /// On-chain rank: 0=Novice, 1=Apprentice, 2=Pastry Chef, 3=Master Artisan, 4=Grand Degen
    pub rank_tier: u8,
    /// Total fortunes minted by this baker
    pub fortunes_inscribed: u64,
    /// Total crumbs donated by this baker (in lamports)
    pub crumbs_donated: u64,
    /// First registered timestamp
    pub joined_timestamp: i64,
    /// PDA bump seed
    pub bump: u8,
}

impl BakerProfile {
    pub const LEN: usize = 8 + 32 + 8 + 1 + 8 + 8 + 8 + 1;

    pub fn compute_rank(&self) -> u8 {
        if self.reputation_xp >= 5000 {
            4 // Grand Degen Baker
        } else if self.reputation_xp >= 2000 {
            3 // Master Artisan
        } else if self.reputation_xp >= 800 {
            2 // Pastry Chef
        } else if self.reputation_xp >= 250 {
            1 // Apprentice
        } else {
            0 // Novice Baker
        }
    }
}

#[account]
pub struct FortuneRecord {
    /// Authoring baker public key
    pub baker: Pubkey,
    /// Local user fortune index
    pub fortune_index: u64,
    /// 32-byte cryptographic SHA-256 hash of the fortune content
    pub fortune_hash: [u8; 32],
    /// Rarity tier: 0=Common, 1=Rare, 2=Epic, 3=Legendary, 4=Degen
    pub rarity_tier: u8,
    /// UTF-8 inscribed payload string (max 128 bytes)
    pub content: String,
    /// Cookie Chain confirmed slot
    pub slot: u64,
    /// Inscription unix timestamp
    pub timestamp: i64,
    /// PDA bump seed
    pub bump: u8,
}

impl FortuneRecord {
    pub const MAX_CONTENT_LEN: usize = 128;
    pub const LEN: usize = 8 + 32 + 8 + 32 + 1 + (4 + Self::MAX_CONTENT_LEN) + 8 + 8 + 1;
}
