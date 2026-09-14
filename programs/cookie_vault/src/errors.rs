use anchor_lang::prelude::*;

#[error_code]
pub enum CookieForgeError {
    #[msg("Fortune message content exceeds maximum allowable length of 128 bytes.")]
    MessageTooLong,

    #[msg("Fortune message payload cannot be empty.")]
    EmptyMessage,

    #[msg("Specified rarity tier index is invalid (must be between 0 and 4).")]
    InvalidRarity,

    #[msg("Contribution to the community vault must be greater than zero.")]
    ZeroTipAmount,

    #[msg("Signer is not authorized to execute this administrative action.")]
    Unauthorized,

    #[msg("Baker profile is not yet registered on Cookie Chain.")]
    ProfileNotRegistered,

    #[msg("Numerical overflow occurred during XP or balance calculation.")]
    MathOverflow,
}
