# 🌐 Meridian — Agent-Native Finance Network
### Built for HSK Chain Horizon Hackathon

> **"The first on-chain agent economy where a trading agent pays its own research team, risk desk, and execution desk, within limits you set in plain English and enforce on-chain."**

---

## 🚀 Live Deployment — HSK Chain Testnet (chainId 133)

Meridian is **deployed and live** on HashKey Chain testnet. A natural-language command to the Strategist compiles to a **real on-chain `setPolicy()` transaction** — verified end-to-end.

| Contract | Address |
| :--- | :--- |
| **PolicyVault** | `0xbF3f9756a67E99213cEaa236447F2b7f6EA4Ea47` |
| MandateRegistry | `0xFCaB43BCE57D977880e4a7d87747999829398A7f` |
| PnLAttestation | `0x237EaE2c99CdF59263AaF6713da3A1dd2E8F89c7` |
| ReputationRegistry | `0x22f84214Df4101F1FDD7C8AAF28995dAab6EE31a` |
| Test USDT / HSK / WETH | `0x25863c…80381` · `0x30C938…792f` · `0xa36369…CF95e` |
| MockHSKSwap | `0xDf5589911aA39A7eA7fc659d818453EcB3be3bF5` |

- **Explorer:** `https://testnet-explorer.hskchain.net/address/0xbF3f9756a67E99213cEaa236447F2b7f6EA4Ea47`
- **Proof tx (policy write via AI):** `0x32011f117a02ad637f272c89ab61e3a60ee69a67ceeaff0fe7a81d406f77f0d9`
- Full address book: [`deployments/hsktestnet.json`](deployments/hsktestnet.json) · deploy guide: [`DEPLOY.md`](DEPLOY.md)

**Run it (90 seconds):**
```bash
npm install && npm run start:server   # → http://localhost:3001
```
Open the app, **connect any EVM wallet** (multi-wallet via EIP-6963), and command the Strategist — the vault obeys on-chain. With no `.env`, it runs a fully-featured demo; with `.env` set it reads/writes the live contracts above.

---

## 🎯 Dual-Track Integration

Meridian unites the two hackathon tracks into one closed-loop economy:
- **Track 1: AI Agent Trading**: Autonomous DEX market monitoring, on-chain signal generation, multi-pool order execution, independent risk audits, and natural-language policy compilation on **HSKSwap**.
- **Track 2: Agent Payments & A2A Settlement (HSP)**: Autonomous agent-to-agent micro-payments powered by **HashKey Settlement Protocol (HSP) Payment Mandates** settled on **HSK Chain**.

```
                +---------------------------------------+
                |        User (Chat & Dashboard)        |
                +---------------------------------------+
                                   | Natural Language Command
                                   v
                  +-----------------------------------+
                  |   Strategist Agent (User Owned)   |
                  |  - Compiles plain English policy  |
                  |  - Operates via Session Keys      |
                  +-----------------------------------+
                     /              |              \
      A2A + Mandate /  A2A + Mandate|  A2A + Mandate\
                   v                v                v
          +--------------+  +--------------+  +------------------+
          | Signal Agent |  |  Risk Agent  |  | Execution Agent  |
          | Sells alpha  |  | Vetoes size/ |  | Best route &     |
          | & flow data  |  | slippage     |  | order splitting  |
          +--------------+  +--------------+  +------------------+
                   \                |                /
                    \               |               /
                     v              v              v
         +------------------------------------------------------+
         |     HSP Gateway: Mandate Verification & Settlement   |
         +------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------------+
|                             HSK Chain Mainnet                                 |
|                                                                               |
|  [PolicyVault]          [MandateRegistry]    [PnLAttestation]   [Reputation] |
|  - Per-trade caps       - Replay protection  - Auditor signed   - Identity   |
|  - Daily loss limits    - Unique nonces        PnL hashes       - Staking    |
|  - Bounded session keys - Allowlist check    - High-water mark  - Slashing   |
|                                                                               |
|                                   [HSKSwap DEX]                               |
|                         Autonomous Swaps & Liquidity                          |
+-------------------------------------------------------------------------------+
                                   ^
                                   |
                  +-----------------------------------+
                  |     Auditor Agent (Independent)   |
                  |  - Replays swaps & balances       |
                  |  - Publishes signed PnL proof     |
                  +-----------------------------------+
```

---

## 👥 The Five Agent Roles

Meridian features five specialized agent services. The user only ever talks to the Strategist:

| Agent Role | Responsibility | HSP Payment Model |
| :--- | :--- | :--- |
| **Strategist** | Runs autonomous loop on HSKSwap, compiles user chat into deterministic policy, builds payment mandates with session key | Pays all other agents via PolicyVault |
| **Signal Agent** | Generates cross-pool spread capture, arbitrage, and momentum signals | Per-signal micro-payment (e.g. 0.05 USDT) + optional performance share |
| **Risk Agent** | Independently calculates pool price impact, slippage, and reserves depth. Can **RESIZE** or **VETO** trades | Per-check fee (e.g. 0.02 USDT) |
| **Execution Agent** | Computes optimal multi-hop routes and splits large orders to eliminate MEV sandwich attacks | Per-execution fee in bps of notional (e.g. 5 bps) |
| **Auditor Agent** | Replays vault swap receipts, generates cryptographically signed epoch PnL attestations, updates reputation | Per-epoch attestation fee |

---

## 🛡️ Security & Threat Model

1. **Prompt Injection Resilience**: The LLM is restricted to parsing conversational instructions into strict, schema-validated JSON actions (validated via Zod). The LLM never holds keys or constructs transactions.
2. **Bounded Authority via Session Keys**: Strategist uses a session key bounded by `PolicyVault.sol`. An agent can only trade allowlisted tokens on allowlisted pools, up to strict per-trade caps and daily loss limits.
3. **Double-Spend & Replay Protection**: Each HSP Payment Mandate requires a unique order ID, sequential payer nonce, and timestamp expiry recorded on `MandateRegistry.sol`.
4. **"No Payment, No Data" Guarantee**: Merchant agents release alpha signals or route splits *only* after verifying on-chain settlement receipts with the HSP Gateway.
5. **Provable PnL (Audited High-Water Mark)**: Performance fees are held in escrow and released only if attested net profit exceeds the high-water mark.

---

## 📜 Smart Contracts (`contracts/`)

- [`PolicyVault.sol`](contracts/PolicyVault.sol): Holds user capital. Enforces per-trade size caps, daily loss limits, daily agent fee budgets, and payee allowlists. Enables instant emergency pausing.
- [`MandateRegistry.sol`](contracts/MandateRegistry.sol): Records every HSP payment mandate approved and executed by the vault with replay protection and expiry checks.
- [`ReputationRegistry.sol`](contracts/ReputationRegistry.sol): Open marketplace directory for agents with staking, Auditor-driven scoring (0-1000), and stake slashing for malicious data.
- [`PnLAttestation.sol`](contracts/PnLAttestation.sol): Stores epoch PnL hashes signed by the Auditor. Manages escrowed performance fees governed by high-water mark rules.

---

## 🔌 Open Model Context Protocol (MCP) Layer

Meridian exposes two native MCP servers complying with the official `@modelcontextprotocol/sdk`:

### 1. `meridian-pay-mcp`
- `create_payment_conditions`: Generate merchant payment conditions with EIP-712 cryptographic signature.
- `build_mandate`: Construct and sign an HSP Payment Mandate using session keys.
- `submit_mandate`: Submit signed mandate to HSP gateway for on-chain settlement.
- `verify_settlement`: Check on-chain settlement status and retrieve cryptographic receipt.
- `list_payments`: Inspect the agent spend ledger.

### 2. `meridian-trade-mcp`
- `set_policy`: Compile plain-English instructions ("max 500 USDT per trade, 100 USDT daily loss") into on-chain PolicyVault limits.
- `get_quote`: Query live pool prices and reserve depth on HSKSwap.
- `propose_trade`: Simulate and validate trade bounds against policy before execution.
- `get_positions`: Check PolicyVault balances and asset allocations.
- `get_pnl`: Retrieve verified PnL curve, win rate, and Auditor attestations.
- `list_agents`: Browse the open agent marketplace directory.

---

## 🚀 Quickstart & Commands

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Run E2E Test Suite
Executes the full test suite verifying closed-loop payments, risk vetoes, policy bounds, replay protection, and auditor signatures:
```bash
npm test
```

### Run Live Interactive Demo
Runs a complete walk-through of natural language policy compilation, closed-loop agent payment settlement, HSKSwap DEX execution, and auditor attestation:
```bash
npm run demo:e2e
```

### Start Central Backend API & WebSocket Server
Starts the Express REST API and live WebSocket feed on `http://localhost:3001`:
```bash
npm run start:server
```

### Run MCP Servers
```bash
npm run mcp:pay    # Launches meridian-pay-mcp over stdio
npm run mcp:trade  # Launches meridian-trade-mcp over stdio
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Send natural language instruction to Strategist ("Cut risk in half", "Stop trading", etc.) |
| `GET` | `/api/policy` | Retrieve current PolicyVault limits & status |
| `POST` | `/api/policy` | Direct PolicyVault parameter update |
| `GET` | `/api/positions` | Query PolicyVault asset balances |
| `GET` | `/api/agents` | List marketplace agents, reputation scores, and pricing |
| `GET` | `/api/trades` | Retrieve trade history and execution hashes |
| `GET` | `/api/mandates` | Query HSP payment spend ledger |
| `GET` | `/api/pnl` | Realized PnL, win rate, max drawdown, and Auditor attestations |
| `POST` | `/api/loop/step` | Trigger a single closed-loop agent cycle manually |
| `POST` | `/api/loop/start` | Start autonomous periodic trade loop |
| `POST` | `/api/loop/stop` | Stop autonomous trade loop |
| `POST` | `/api/attest` | Generate and record epoch attestation signed by Auditor |
| `WS` | `/ws` | Live WebSocket stream of agent events, mandates, and trades |

---

## 🖥️ Front End (`web/`)

A no-build, multi-page marketing site **plus** a live developer console — plain HTML/CSS/JS + three.js (0.160.0), styled after the HashKey look (light, bold type, purple brand). Served same-origin by the Express server.

**Marketing site** (light theme, shared design system in `web/assets/site.css` + `web/assets/site.js` which injects the nav/footer on every page):
- [`index.html`](web/index.html) — home, with a 3D agent-network hero and live network stats.
- [`how-it-works.html`](web/how-it-works.html) — architecture + the full trade/settlement/attestation lifecycle.
- [`agents.html`](web/agents.html) — the five agents and the staked, Auditor-scored marketplace.
- [`security.html`](web/security.html) — threat model + the four on-chain contracts.
- [`developers.html`](web/developers.html) — MCP servers, SDK, REST/WebSocket API, quickstart.

**Console** ([`app.html`](web/app.html), dark product app, routes `/app` · `/console` · `/developer`):
- ChatGPT/Claude-style agent workspace: sidebar (Strategist Chat, Agent Marketplace, Trades, HSP Mandates, PnL & Policy), centered greeting + composer, inline action-result cards, slash commands.
- **On-chain wallet connect**: EIP-1193 (MetaMask) connect + add/switch to **HashKey Chain** (id `177`, rpc `https://mainnet.hsk.xyz`, explorer `https://explorer.hsk.xyz`).
- **Hop** 🐰 — a draggable 3D purple bunny mascot (three.js) that reacts while you chat with the agents.
- Wired to `/api/chat`, `/api/positions`, `/api/pnl`, `/api/policy`, `/api/agents`, `/api/trades`, `/api/mandates`, `/api/loop/*`, `/api/attest`; falls back to a deterministic demo mode (mirroring `chat-parser.ts`) when the backend is offline.

### Run it
```bash
npm run start:server      # then open http://localhost:3001/
```
The whole site + API are same-origin (no CORS setup). `API_BASE` in the pages auto-detects port 3001; change it if you host the backend elsewhere.

---

## 🏆 Hackathon Alignment

- **Dual-Track Synergy**: Track 1 (HSKSwap DEX trading) creates the real economic demand that makes Track 2 (HSP agent-to-agent payment mandates) a necessary reality.
- **Security by Design**: Solves prompt injection, unbounded keys, and unaudited PnL through hard on-chain smart contract boundaries.
- **Open Infrastructure**: Standardized MCP interfaces and merchant SDK enable any developer or third-party agent to accept HSP payments or plug into the network.
