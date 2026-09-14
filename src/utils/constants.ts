// Cookie Chain Network Constants & Program Identifiers

export const COOKIE_CHAIN_CONFIG = {
  name: "Cookie Chain",
  symbol: "COOK",
  decimals: 9,
  domain: 420042004,
  genesisHash: "9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2",
  rpcUrl: "https://rpc.cookiescan.io",
  wssUrl: "https://wss.cookiescan.io",
  explorerUrl: "https://cookiescan.io",
  bridgeUrl: "https://hyperlane.cookiescan.io",
  telegramUrl: "https://t.me/TheCookieNetChain",
  docsUrl: "https://docs.cookiechain.wtf",
  homepageUrl: "https://www.cookiechain.wtf",
  xUrl: "https://x.com/TheCookieChain",
} as const;

export const COOKIE_APIS = {
  scanApi: "https://api.cookiescan.io",
  swapApi: "https://swap.cookiescan.io/api",
  cookieboxAggApi: "https://agg.cookiebox.app",
} as const;

export const COOKIE_PROGRAMS = {
  // Core System & Token Programs
  splToken: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  token2022: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  associatedToken: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  memo: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  nameService: "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",

  // Cookiebox & Meteora AMMs
  cookieboxDbc: "DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf",
  cookieboxDammV2: "DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY",
  cookieboxClmm: "CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs",

  // Hyperlane Bridge Mailbox
  bridgeMailbox: "DhiHgUY8Y6mJ4D3MoRnZWAjTBEtSaFFn4CYgc6eDzZ8r",
  bridgeWarpCookie: "Aa9wq46NB7qkg1amnBuMRsV1DunmkPHuoRLWZgWiBKdn",

  // CookieForge Custom Anchor Program
  cookieVault: "CookVau1t1111111111111111111111111111111111",
} as const;

export const KNOWN_MINTS = {
  // Native COOK wrapped mint on Cookie Chain (identical string to wSOL on Solana)
  COOK: "So11111111111111111111111111111111111111112",
  // Solana side Token-2022 mint for bridged COOK
  COOK_SOLANA: "36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1",
  // bCOOK (Liquid Staked COOK)
  bCOOK: "Ctgd1omtw7cWAWYh4SZXUT29dcmncBkMofm7cLrMpVa",
  // Popular community tokens
  COOKHOUSE: "C4yVWDrwXeEUapmw3BkvktHBxCSsM8MfJ3aPVuFonFi5",
  TRASHCOIN: "GNFqCqaU9R2jas4iaKEFZM5hiX5AHxBL7rPHTCpX5T6z",
  NOTHING: "9wEgip8YAmZgrmcrtTY9p88oEakHvdom7ZQWw4jaSXBK",
  BUTT: "3aoM3BvURMMGFA1PREhEQHGgjCzV7tXgooZwLo9s1ymN",
  TGOR: "9gc8u3oTiyk7hKxdV3cSRFJ3gC3HRpYGzrRUG6ZLJC6X",
  TP: "2grrGoPKrTqFcLz4LQ3Jhqs7FeRqeeTKDf6KtneN74ZA",
  MAG: "HEcE248MYuJ49ukkTSLuNjv4Ha7J2juzwRK1o3ng93xh",
} as const;

// CookieForge Creator & Builder Wallet
export const CREATOR_WALLET = "Hgee1YpsE7vDnGsmEgdGEvti85UE5tKEwLrtmJeJVym2";

// Community public goods tip jar / treasury (Defaults to Creator Builder Vault)
export const COMMUNITY_COOKIE_JAR = "Hgee1YpsE7vDnGsmEgdGEvti85UE5tKEwLrtmJeJVym2";
