# Going Live — Meridian on HSK Chain

This takes Meridian from DEMO (in-memory mock chain) to LIVE (deployed contracts + real AI).

> **Do a testnet dry run first.** Same commands, different `.env`. Never deploy unproven contracts to mainnet with real HSK.

---

## 0. What you must provide

| Thing | Where to get it | `.env` key |
|---|---|---|
| Deployer wallet (funded with HSK gas) | Your wallet | `DEPLOYER_PRIVATE_KEY` |
| Agent keys (strategist + 4 desks) | Generate fresh (see below) | `STRATEGIST_SESSION_KEY`, `SIGNAL_KEY`, … |
| Real token addresses (USDT/HSK/WETH) | HashKey Chain docs / explorer | `USDT_ADDRESS`, `HSK_ADDRESS`, `WETH_ADDRESS` |
| HSKSwap router (+ pools) | HashKey / HSKSwap docs | `HSKSWAP_ROUTER`, `HSKSWAP_POOL_*` |
| Groq API key (free) | https://console.groq.com | `GROQ_API_KEY` |

Generate agent keys:
```bash
node -e "const {Wallet}=require('ethers'); for(const n of ['OWNER','STRATEGIST','SIGNAL','RISK','EXECUTION','AUDITOR']){const w=Wallet.createRandom(); console.log(n, w.privateKey, w.address);}"
```

---

## 1. Install & configure
```bash
npm install
cp .env.example .env     # then fill it in
```

## 2. Compile contracts
```bash
npm run compile
```

## 3. Deploy

```bash
npm run deploy:local     # dry run on an in-memory chain (no real funds)
npm run deploy:testnet   # HSK testnet (needs HSK_TESTNET_RPC + faucet HSK)
npm run deploy           # HSK mainnet (177) — real funds
```

The script deploys `MandateRegistry`, `PnLAttestation`, `ReputationRegistry`, `PolicyVault`,
wires token/pool allowlists + the Strategist session key + agent payees, and writes
`deployments/<network>.json`. **Copy the printed `PolicyVault` address into `.env` as `VAULT_ADDRESS`.**

## 4. Run live
```bash
npm run start:server     # http://localhost:3001  (now shows [chain] LIVE)
```

The server auto-switches to the **real HSK adapter** when `HSK_RPC_URL + VAULT_ADDRESS + a key`
are present, and the **Strategist uses Groq** when `GROQ_API_KEY` is set (otherwise the safe
deterministic parser). The frontend needs no change — it already talks to the API.

---

## Safety notes
- The LLM only emits **schema-validated JSON actions** (Zod) — it never holds keys or builds transactions. Prompt injection cannot escape the schema.
- On-chain writes happen **only** in LIVE mode; a simulated success is never substituted for a failed transaction.
- A compromised agent can lose at most the policy caps, never the vault.
- Fund the vault with tokens and verify `/api/positions` before enabling the autonomous loop.
