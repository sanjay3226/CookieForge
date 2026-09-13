# 🍪 CookieForge — The Flagship cApp for Cookie Chain

> **Bake, Swap & Inscribe at Sub-Second Speed on the Community-Driven SVM.**  
> Built for the **Cookie Chain Bounty** on Superteam Earn.

[![Cookie Chain](https://img.shields.io/badge/Network-Cookie%20Chain%20SVM-f59e0b)](https://cookiechain.wtf)
[![Genesis](https://img.shields.io/badge/Genesis-9wDaBRDg...-blue)](https://cookiescan.io)
[![Sub--Second](https://img.shields.io/badge/Finality-%3C1.0s-emerald)](https://rpc.cookiescan.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

**CookieForge** is an all-in-one cApp (Cookie Application) designed to showcase the full power of Cookie Chain’s high-performance SVM infrastructure. 

With sub-second transaction finality, negligible gas fees (~$0.000005 per transaction), program deployments costing only pennies (~$0.05), and full Solana compatibility, Cookie Chain is built for experimentation and on-chain culture. **CookieForge** puts these advantages front and center through interactive gamification and essential DeFi tooling.

---

## 🚀 Key Features

### 1. 🥠 On-Chain Fortune Bakery ("Crack & Inscribe")
- **Provable On-Chain Fortunes**: Crack open interactive Fortune Cookies to receive cryptographic degen advice, market predictions, and wisdom.
- **Genesis Memo Program Integration**: Uses Cookie Chain’s genesis Memo program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) to inscribe messages immutably onto the ledger.
- **Custom Memo Inscriptions**: Inscribe your own milestones, alpha leaks, or community notes forever for less than a thousandth of a cent.
- **Rarity Tier Engine**: Every fortune is categorized into *Common*, *Rare*, *Epic*, *Legendary*, or *Degen* with live confetti celebration effects.
- **Bakery Ledger**: Real-time explorer feed of recent on-chain fortunes with instant links to [CookieScan](https://cookiescan.io).

### 2. 🍯 Community Cookie Jar (Public Goods Tip Box)
- Send 1-click micro-tips in native `COOK` to the ecosystem public goods treasury (`8nj4iBHZugPZ4T1NPM47zazSjhp68gHYkX6GbLdmT3AP`).
- Appends an on-chain thank-you memo to the transaction log.

### 3. ⚡ DEX Terminal & Liquidity Aggregator
- Instant swap quoting across all Cookie Chain AMMs via **Cookiebox** (`agg.cookiebox.app`) and **Candy Shop** (`swap.cookiescan.io`).
- Swap between native `COOK` and ecosystem tokens like `bCOOK` (liquid staked), `COOKHOUSE`, `TRASHCOIN`, `NOTHING`, `BUTT`, and `TP`.
- Detailed route visualization, venue detection (Cookiebox DAMM v2, Cookiebox CLMM, CookieSwap BAMM), slippage protection, and sub-second execution.

### 4. 🏷️ .cook Domain & Identity Resolver
- Native integration with **CookOven** (`namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX`).
- Lookup `.cook` names (e.g. `chef.cook`, `baker.cook`) or reverse-resolve base58 wallet addresses into human-readable identities.

### 5. 🌉 Hyperlane Warp Route Portal
- Monitor the 1:1 cross-chain warp route connecting Cookie Chain and Solana Mainnet over [Hyperlane](https://hyperlane.cookiescan.io).
- Live collateral reserve tracking: verifies destination collateral PDA on Cookie Chain (`CL2JoQ5jdTpRNKshWhaTihuooT4qrKdLUiPsqKj3yAKz`) and Solana escrow (`88q7zoKctwAQRsoTxkMJy95sNE3tntuyEhSrhvR1eZwq`).
- Interactive bridge calculator and 1-click bridge launcher.

### 6. 📊 Real-Time Market Radar
- Live token registry and 24h market metrics powered by `https://api.cookiescan.io`.
- Displays real-time prices, 24h changes, market caps, liquidity depths, and holder counts.

### 7. 🔌 First-Class Nightly Wallet & $0 Zero-Cost Demo Mode
- Full support for **[Nightly Wallet](https://nightly.app/)** (required by bounty criteria), plus Phantom and Solflare.
- **1-Click $0 Test Drive**: Judges and users can test drive the full application without spending a single dollar or installing extensions via live RPC transaction simulation!

---

## ⚙️ Technical Specifications & Programs

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Cookie Chain |
| **RPC Endpoint** | `https://rpc.cookiescan.io` |
| **WebSocket** | `https://wss.cookiescan.io` |
| **Chain ID / Domain** | `420042004` |
| **Genesis Hash** | `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2` |
| **Native Token** | `COOK` (9 decimals) |
| **Wrapped COOK Mint** | `So11111111111111111111111111111111111111112` |
| **Solana COOK Mint** | `36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1` (Token-2022) |
| **Memo Program** | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |
| **Name Service (.cook)** | `namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX` |
| **Cookiebox DBC** | `DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf` |
| **Cookiebox DAMM v2** | `DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY` |
| **Hyperlane Mailbox** | `DhiHgUY8Y6mJ4D3MoRnZWAjTBEtSaFFn4CYgc6eDzZ8r` |
| **Explorer** | [cookiescan.io](https://cookiescan.io) |

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- Node.js ≥ 20
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/cookieforge.git
cd cookieforge

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌐 Deploy to Vercel (100% Free)

Deploying CookieForge to Vercel takes less than 2 minutes at $0 cost:

1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: CookieForge initial release for Cookie Chain Bounty"
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/CookieForge.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `CookieForge` repository.
4. Framework Preset: **Vite**.
5. Click **"Deploy"**. Your app will be live at `https://cookieforge.vercel.app`!

---

## 📱 Nightly Wallet Configuration Guide

To interact with Cookie Chain using [Nightly Wallet](https://nightly.app/):

1. Open Nightly Wallet extension.
2. Click **Settings** (Gear icon) → **Networks / Custom RPC**.
3. Select **Solana**.
4. Enter the network details:
   - **Network Name**: Cookie Chain
   - **RPC URL**: `https://rpc.cookiescan.io`
   - **Genesis Hash**: `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2`
   - **Symbol**: `COOK`
5. Connect to **CookieForge** and enjoy sub-second transactions!

---

## 🧵 Submission X (Twitter) Thread

Below is the ready-to-post Twitter thread showcasing CookieForge for the Cookie Chain Bounty:

```text
1/6 🍪 Introducing CookieForge — The ultimate cApp built for the fast, community-driven @TheCookieChain SVM ecosystem!

Bake on-chain fortunes, aggregate DEX swaps, resolve .cook domains & bridge over Hyperlane in sub-seconds.

Try it live: [YOUR_VERCEL_URL]
GitHub: [YOUR_GITHUB_URL]

🧵👇

2/6 🥠 Why build on @TheCookieChain?
- ⚡ Sub-second finality (~0.8s block times)
- 💸 Gas fees less than $0.00001 (fractions of a cent)
- 🛠️ 100% Solana-compatible SVM with 5-cent program deployments
- 🌐 100% community-owned & community-operated infrastructure

3/6 🔮 What can you do in CookieForge?
1️⃣ Fortune Bakery: Crack cryptographic fortune cookies & inscribe custom messages via the genesis Memo Program
2️⃣ Community Cookie Jar: Micro-tip public goods with on-chain receipts
3️⃣ DEX Terminal: Live quote routing across Cookiebox & Candy Shop AMMs

4/6 🏷️ Digital Identity & Bridge:
- .cook Domains: Lookup and verify on-chain CookOven domain handles
- Hyperlane Bridge Portal: Live collateral preflight checks & transfer calculator to bridge COOK 1:1 between Cookie Chain & Solana Mainnet!

5/6 🌉 Need to bridge COOK to get started?
Use the official Hyperlane bridge:
👉 https://hyperlane.cookiescan.io/
Swap SOL ⇄ COOK and experience the fastest SVM in Web3!
Connect with @nightly_app for a native, seamless experience.

6/6 🏆 Built with love for the @TheCookieChain bounty on @SuperteamEarn.
Special thanks to the Cookie Chain community validators and builders!

Let’s bake! 🍪🔥
```

---

## 📄 License
This project is open-source under the [MIT License](./LICENSE).
