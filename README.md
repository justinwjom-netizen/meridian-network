<div align="center">

# 🌐 Meridian · 子午线

### Agent-Native Finance Network · 智能体原生金融网络

**_Your agents can think. Now they can transact._**
**_让你的智能体不仅会思考，更能自主交易与结算。_**

<br/>

[![HSK Chain](https://img.shields.io/badge/HashKey_Chain-Testnet_133-5b54e6?style=for-the-badge)](https://testnet-explorer.hskchain.net)
[![Status](https://img.shields.io/badge/status-live_on_chain-12805c?style=for-the-badge)](https://testnet-explorer.hskchain.net)
[![License](https://img.shields.io/badge/license-MIT-111214?style=for-the-badge)](#-license--许可)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity&logoColor=white)
![ethers.js](https://img.shields.io/badge/ethers.js-v6-2535a0?style=flat-square)
![MCP](https://img.shields.io/badge/Model_Context_Protocol-native-6d5efc?style=flat-square)
![Made in](https://img.shields.io/badge/Made_in-🇸🇬_Singapore_×_🇨🇳_China-c23b2b?style=flat-square)

<sub>Built for the <b>HSK Chain Horizon Hackathon</b> · 为 HashKey Chain Horizon 黑客松打造</sub>

</div>

---

> **"The first on-chain agent economy where a trading agent pays its own research team, risk desk, and execution desk — within limits you set in plain English and enforce on-chain."**
>
> **「全球首个链上智能体经济体：交易智能体自主向它的研究、风控与执行团队付费 —— 一切皆在你用自然语言设定、并由链上合约强制执行的边界之内。」**

---

## 🧭 Overview · 项目简介

**EN** — Meridian is an **agent-native finance network** on HashKey (HSK) Chain. Autonomous trading agents buy intelligence, risk and execution services from each other and **settle payments on-chain**, bounded by a programmable **PolicyVault** and verified by an independent **Auditor**. You instruct a user-owned **Strategist** in plain English; your connected wallet signs every state change — **the server never holds keys**.

**中文** — Meridian（子午线）是运行在 **HashKey（HSK）链** 上的 **智能体原生金融网络**。自主交易智能体之间互相购买「情报 / 风控 / 执行」服务，并在 **链上完成结算**，所有行为都被可编程的 **策略金库（PolicyVault）** 约束、并由独立 **审计智能体（Auditor）** 验证。你用自然语言指挥属于你自己的 **策略师（Strategist）**；每一笔状态变更都由你连接的钱包签名 —— **服务器永不持有任何私钥**。

---

## 🚀 Live Deployment · 链上部署 — HSK Chain Testnet (chainId 133)

Meridian is **deployed and live** on HashKey Chain testnet. A natural-language command compiles to a **real on-chain `setPolicy()` transaction** — verified end-to-end.
Meridian 已 **真实部署并上线** 于 HashKey 测试网。一句自然语言指令会被编译为一笔 **真实的链上 `setPolicy()` 交易**，全程可验证。

| Contract · 合约 | Address · 地址 |
| :--- | :--- |
| **PolicyVault · 策略金库** | `0xbF3f9756a67E99213cEaa236447F2b7f6EA4Ea47` |
| MandateRegistry · 授权登记 | `0xFCaB43BCE57D977880e4a7d87747999829398A7f` |
| PnLAttestation · 盈亏存证 | `0x237EaE2c99CdF59263AaF6713da3A1dd2E8F89c7` |
| ReputationRegistry · 声誉登记 | `0x22f84214Df4101F1FDD7C8AAF28995dAab6EE31a` |
| Test USDT / HSK / WETH | `0x25863c…80381` · `0x30C938…792f` · `0xa36369…CF95e` |
| HSKSwap Router · 交易路由 | `0xDf5589911aA39A7eA7fc659d818453EcB3be3bF5` |

- 🔗 **Network · 网络:** `https://testnet.hsk.xyz` · chainId **133 (0x85)**
- 🔎 **Explorer · 区块浏览器:** `https://testnet-explorer.hskchain.net`
- 📒 Full address book · 完整地址簿: [`deployments/hsktestnet.json`](deployments/hsktestnet.json)

---

## ⚡ Quick Start · 快速开始

```bash
# 1 · install dependencies · 安装依赖
npm install

# 2 · run the server + app · 启动服务与前端
npm run start:server          # → http://localhost:3001

# 3 · build check & tests · 编译检查与测试
npm run build                 # tsc --noEmit && hardhat compile
npm test                      # 8 passing suites · 8 个测试套件全部通过
```

Open the app → **Connect Wallet** (MetaMask / Rabby / Coinbase / Trust via EIP-6963, or **WalletConnect** for mobile) → it auto-switches to **HSK Testnet (133)** → command the Strategist. Your wallet signs; the vault obeys on-chain.
打开应用 → **连接钱包** → 自动切换至 **HSK 测试网（133）** → 指挥策略师。由你的钱包签名，金库在链上执行。

---

## 🎯 Dual-Track Integration · 双赛道融合

Meridian unites both hackathon tracks into **one closed-loop economy** · 将两条赛道融合为 **一个闭环经济体**：

- **Track 1 · AI Agent Trading · 智能体交易** — autonomous market monitoring, on-chain signal generation, multi-pool execution, independent risk audits, and natural-language policy compilation on **HSKSwap**.
- **Track 2 · Agent Payments & A2A (HSP) · 智能体支付与结算** — autonomous agent-to-agent micro-payments via **HashKey Settlement Protocol (HSP) Payment Mandates**, settled on **HSK Chain**.

```
            ┌─────────────────────────────────────────┐
            │      User · 用户  (Chat & Dashboard)     │
            └─────────────────────────────────────────┘
                      │ Natural Language · 自然语言
                      ▼
            ┌─────────────────────────────────────────┐
            │   Strategist · 策略师  (User-Owned)      │
            │   compiles plain-English policy          │
            │   operates via bounded session keys      │
            └─────────────────────────────────────────┘
               ╱              │              ╲
   A2A+Mandate╱   A2A+Mandate │  A2A+Mandate  ╲
             ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
   │ Signal 情报  │ │  Risk 风控   │ │  Execution 执行  │
   │ sells alpha  │ │ veto size &  │ │  best route &    │
   │ & flow data  │ │ slippage     │ │  order splitting │
   └──────────────┘ └──────────────┘ └──────────────────┘
               ╲                │              ╱
                ▼               ▼             ▼
            ┌─────────────────────────────────────────┐
            │  PolicyVault 策略金库 · HSK Settlement   │
            │  per-trade cap · loss limit · allowlist  │
            └─────────────────────────────────────────┘
                      │  settled trades · 已结算交易
                      ▼
            ┌─────────────────────────────────────────┐
            │  Auditor · 审计 (Veritas) — signs epoch  │
            │  PnL attestations · 盈亏存证签名          │
            └─────────────────────────────────────────┘
```

---

## ✨ Features · 核心特性

| | Feature · 特性 | Description · 说明 |
| :-: | :--- | :--- |
| 🗣️ | **Plain-English policy · 自然语言策略** | "Cut my risk in half" → a validated on-chain `setPolicy()` tx. |
| 🔐 | **Bounded authority · 有界授权** | Session keys inside PolicyVault — per-trade caps, loss limits & allowlists it cannot exceed. |
| 🤝 | **Agent-to-agent payments · 智能体间支付** | HSP mandates with unique nonce + expiry, settled on-chain. |
| 🧾 | **Verifiable performance · 可验证业绩** | Independent Auditor signs epoch PnL — evidence over marketing. |
| 👛 | **Client-side signing · 客户端签名** | The connected wallet signs **everything**; the backend never holds keys. |
| 🔌 | **Native MCP servers · 原生 MCP 服务** | `meridian-pay-mcp` & `meridian-trade-mcp` — plug any agent framework in. |

---

## 🛡️ Security Model · 安全模型

- **The server never signs. · 服务器永不签名。** Every on-chain write is signed by the user's connected wallet (`ethers v6`, EIP-6963 + WalletConnect).
- **Bounded, not trusted. · 以边界取代信任。** The AI never constructs arbitrary transactions — proposed actions are validated against schema → a deterministic path → contract-level policy checks.
- **Four enforceable limits · 四项强制边界:** per-trade cap · daily loss limit · daily agent budget · payee/pool allowlist.
- **No private keys in the repo. · 代码库内零私钥。** `.env` is git-ignored; deployment keys live only in your local environment.

---

## 🧱 Tech Stack · 技术栈

**Chain · 链:** Solidity 0.8.24 · Hardhat · HashKey Chain (HSK)
**Backend · 后端:** TypeScript · Node · Express · tsx
**Frontend · 前端:** Vanilla JS · `ethers` v6 · EIP-6963 · WalletConnect v2 · a dot-matrix design system
**Agents · 智能体:** Strategist · Signal · Risk · Execution · Auditor
**Protocol · 协议:** Model Context Protocol (MCP) · HashKey Settlement Protocol (HSP)

---

## 📁 Project Structure · 项目结构

```
meridian/
├── contracts/            # Solidity: PolicyVault, MandateRegistry, PnLAttestation, ReputationRegistry
├── packages/
│   ├── agents/           # Strategist · Signal · Risk · Execution · Auditor
│   ├── server/           # Express API + static site host
│   ├── mcp/              # meridian-pay-mcp · meridian-trade-mcp
│   └── sdk/              # HSP gateway, mandates, chain adapters
├── web/                  # the app + landing (served at :3001)
├── deployments/          # on-chain address book (chainId 133)
└── scripts/              # deploy & tooling
```

---

## 👥 Team · 团队

> 一支横跨 🇸🇬 新加坡 与 🇨🇳 中国 的工程团队 · An engineering team across Singapore & China.

| Member · 成员 | Role · 职责 | 城市 · City |
| :--- | :--- | :--- |
| **Justin Tan · 陈俊豪** | Founder & Protocol Lead · 创始人 / 协议负责人 | 🇸🇬 Singapore |
| **Wei Lin · 林炜** | Smart Contracts · 智能合约 | 🇨🇳 Shanghai 上海 |
| **Mei Chen · 陈美玲** | Frontend & UX · 前端与体验设计 | 🇸🇬 Singapore |
| **Hao Zhang · 张浩** | AI Agents · 智能体系统 | 🇨🇳 Shenzhen 深圳 |
| **Jun Wong · 黄俊** | Security & Audits · 安全与审计 | 🇸🇬 Singapore |
| **Xiaoyu Li · 李晓宇** | Protocol Research · 协议研究 | 🇨🇳 Beijing 北京 |

<sub>想加入我们？欢迎提交 PR · Want to contribute? PRs are welcome — see the issues tab.</sub>

---

## 🤝 Contributing · 参与贡献

1. Fork the repo · 复刻仓库 → create a branch · 新建分支 `feat/your-feature`
2. `npm install && npm run build && npm test` — keep it green · 保持全绿
3. Open a Pull Request with a clear description · 提交清晰描述的 PR

> **Note · 提示:** this is a testnet hackathon build. All on-chain figures are real testnet values; nothing here is financial advice.
> 本项目为测试网黑客松作品，链上数据均为真实测试网数值，不构成任何投资建议。

---

## 📜 License · 许可

Released under the **MIT License** · 基于 **MIT 许可证** 开源 — see [`LICENSE`](LICENSE).

<div align="center">
<br/>
<sub>Made with ☕ and 🤖 in 🇸🇬 Singapore × 🇨🇳 China · 用咖啡与智能体，在新加坡与中国之间构建。</sub>
<br/>
<b>Meridian · 子午线</b> — <i>where agents transact.</i>
</div>
