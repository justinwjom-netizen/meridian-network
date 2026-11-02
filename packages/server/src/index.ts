import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import {
  MockChainAdapter,
  HSKChainAdapter,
  HSPGateway,
  type IChainAdapter,
  type SettlementReceipt
} from '@meridian/sdk';
import {
  SignalAgent,
  RiskAgent,
  ExecutionAgent,
  AuditorAgent,
  StrategistAgent
} from '@meridian/agents';
import { MeridianDatabase } from './db/index.js';

// Setup Keys — real keys come from .env in LIVE mode; these dev keys drive DEMO mode.
const k = (name: string, fallback: string) => (process.env[name] || fallback) as `0x${string}`;
const STRATEGIST_KEY = k('STRATEGIST_SESSION_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const SIGNAL_KEY = k('SIGNAL_KEY', '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const RISK_KEY = k('RISK_KEY', '0x5de4111afa1a4b9317654424337614f33270f8b921f1a3072a783066e794b57f');
const EXECUTION_KEY = k('EXECUTION_KEY', '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6');
const AUDITOR_KEY = k('AUDITOR_KEY', '0x47e179ec3400487117025389d33e654e28e001f9450ec974f471e8c60e042799');

const VAULT_ADDRESS = process.env.VAULT_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

// LIVE mode: an HSK RPC + an executor key + a deployed vault are all present.
const LIVE = !!(process.env.HSK_RPC_URL && process.env.VAULT_ADDRESS && (process.env.VAULT_OWNER_KEY || process.env.STRATEGIST_SESSION_KEY));

export function createApp() {
  const db = new MeridianDatabase('./data');

  let chainAdapter: IChainAdapter;
  if (LIVE) {
    const executorKey = (process.env.VAULT_OWNER_KEY || process.env.STRATEGIST_SESSION_KEY) as `0x${string}`;
    chainAdapter = new HSKChainAdapter(executorKey, process.env.HSK_RPC_URL);
    console.log(`[chain] LIVE — HSK Chain via ${process.env.HSK_RPC_URL}, vault ${VAULT_ADDRESS}`);
  } else {
    const mock = new MockChainAdapter();
    mock.setBalance(VAULT_ADDRESS, '0xtoken_usdt', 10_000n * 10n ** 6n); // 10,000 USDT
    mock.setBalance(VAULT_ADDRESS, '0xtoken_hsk', 5_000n * 10n ** 18n);  // 5,000 HSK
    mock.setBalance(VAULT_ADDRESS, '0xtoken_weth', 5n * 10n ** 18n);      // 5 WETH
    chainAdapter = mock;
    console.log('[chain] DEMO — in-memory mock adapter (set HSK_RPC_URL + VAULT_ADDRESS + keys in .env for LIVE)');
  }

  const gateway = new HSPGateway({
    onChainExecutor: async (mandate) => {
      // Execute payment from PolicyVault via chain adapter
      const res = await chainAdapter.executePayment({
        vault: mandate.payer,
        payee: mandate.payee,
        token: mandate.token,
        amount: mandate.amount,
        orderId: mandate.orderId,
        nonce: mandate.nonce,
        expiry: mandate.expiry,
        conditionsHash: mandate.conditionsHash
      });
      return res.txHash;
    }
  });

  // Initialize Specialist Agents
  const signalAgent = new SignalAgent(
    {
      privateKey: SIGNAL_KEY,
      priceAmount: (50000).toString(), // 0.05 USDT
      tokenAddress: '0xtoken_usdt'
    },
    gateway
  );

  const riskAgent = new RiskAgent(
    {
      privateKey: RISK_KEY,
      auditFeeAmount: (20000).toString(), // 0.02 USDT
      tokenAddress: '0xtoken_usdt'
    },
    gateway,
    chainAdapter
  );

  const executionAgent = new ExecutionAgent(
    {
      privateKey: EXECUTION_KEY,
      feeBps: 5,
      tokenAddress: '0xtoken_usdt'
    },
    gateway,
    chainAdapter
  );

  const auditorAgent = new AuditorAgent({
    privateKey: AUDITOR_KEY
  });

  // Initialize Strategist Agent
  const strategistAgent = new StrategistAgent(
    {
      sessionPrivateKey: STRATEGIST_KEY,
      vaultAddress: VAULT_ADDRESS,
      name: 'Strategist User Agent'
    },
    gateway,
    chainAdapter,
    signalAgent,
    riskAgent,
    executionAgent,
    auditorAgent
  );

  // App & WebSocket setup
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve the Meridian front end (web/) same-origin with the API.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webDir = path.resolve(__dirname, '../../../web');
  app.use(express.static(webDir));
  // Clean routes → static HTML files (public site + application shell)
  const pageRoutes: Record<string, string> = {
    '/app': 'app.html', '/console': 'app.html',
    '/app/trading': 'app-trading.html',
    '/app/agents': 'app-agents.html',
    '/app/mandates': 'app-mandates.html',
    '/app/vault': 'app-vault.html',
    '/app/positions': 'app-positions.html',
    '/app/performance': 'app-performance.html',
    '/app/activity': 'app-activity.html',
    '/app/settings': 'app-settings.html',
    '/how-it-works': 'how-it-works.html',
    '/security': 'security.html',
    '/developers': 'developers.html', '/developer': 'developers.html',
    '/docs': 'docs.html',
    '/marketplace': 'marketplace.html'
  };
  for (const [route, file] of Object.entries(pageRoutes)) {
    app.get(route, (_req: Request, res: Response) => res.sendFile(path.join(webDir, file)));
  }
  app.get('/app/agents/:id', (req: Request, res: Response) => res.sendFile(path.join(webDir, 'app-agent.html')));
  app.get('/app/mandates/:id', (req: Request, res: Response) => res.sendFile(path.join(webDir, 'app-mandate.html')));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  const broadcast = (type: string, data: any) => {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  };

  // Wire events from Strategist to DB & WebSocket
  strategistAgent.onEvent((event) => {
    db.addEvent(event.type, event.data);
    broadcast(event.type, event.data);

    if (event.type === 'MANDATE_SETTLED') {
      db.addMandate(event.data);
    }
    if (event.type === 'TRADE_EXECUTED') {
      db.addTrade({
        txHash: event.data.txHash,
        timestamp: Date.now(),
        pair: 'HSK/USDT',
        action: 'BUY',
        amountIn: event.data.amountIn,
        amountOut: event.data.amountOut,
        realizedPnL: event.data.pnl,
        signalAgent: signalAgent.address,
        riskAgent: riskAgent.address,
        executionAgent: executionAgent.address
      });
      // Update agent scores
      const sigRep = auditorAgent.evaluateAgentReputation(signalAgent.address);
      db.updateAgentScore(signalAgent.address, sigRep.delta);
    }
  });

  // --- API Endpoints ---

  // Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'OK',
      network: 'HSK Chain (Horizon Hackathon)',
      vault: VAULT_ADDRESS,
      version: '1.0.0',
      uptimeSeconds: process.uptime()
    });
  });

  // Chat with Strategist (Natural-Language Policy & Control)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message string is required' });
      }

      const result = await strategistAgent.parseOnly(message);
      const action = result.action;

      // For RUN_TRADE or loop commands, actually execute a cycle
      if (action.action === 'UNKNOWN') {
        const lower = message.toLowerCase();
        if (lower.includes('run') || lower.includes('trade') || lower.includes('execute') || lower.includes('cycle') || lower.includes('go')) {
          try {
            const cycle = await strategistAgent.runTradeCycle('HSK/USDT');
            return res.json({
              action: { action: 'RUN_TRADE', userExplanation: `Trade cycle executed: ${cycle.summary}` },
              reply: `Trade cycle executed: ${cycle.summary}`,
              cycleResult: cycle
            });
          } catch (err: any) {
            return res.json({
              action: result.action,
              reply: `Trade cycle failed: ${err.message}`
            });
          }
        }
      }

      // For PnL queries, fetch real data
      if (action.action === 'QUERY_PNL') {
        const trades = db.getTrades();
        let pnl = 0n;
        let wins = 0;
        for (const t of trades) { const p = BigInt(t.realizedPnL); pnl += p; if (p > 0n) wins++; }
        const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) + '%' : '0.0%';
        return res.json({
          action,
          reply: `Your realized PnL: ${(Number(pnl) / 1e6).toFixed(2)} USDT across ${trades.length} trades. Win rate: ${winRate}. Latest attestation: ${db.getAttestations()[0]?.epochId || 'none yet'}.`
        });
      }

      // For agent queries, list real agents
      if (action.action === 'QUERY_AGENTS') {
        const agents = db.getAgents();
        const names = agents.map((a: any) => `${a.name} (score: ${a.score}/1000)`).join(', ');
        return res.json({
          action,
          reply: `Active marketplace agents: ${names}.`
        });
      }

      // Trigger trade cycle directly from chat
      if (action.action === 'RUN_TRADE') {
        const cycle = await strategistAgent.runTradeCycle('HSK/USDT');
        return res.json({
          action,
          cycle,
          reply: `⚡ Trade cycle executed! Swap Tx: ${cycle.swapTxHash || 'Vetoed/None'}. Paid ${cycle.mandatesSettled.length} agent mandates via HSP. Realized PnL: ${(Number(cycle.pnl) / 1e6).toFixed(2)} USDT.`
        });
      }

      // Start loop directly from chat
      if (action.action === 'LOOP_START') {
        if (!intervalTimer) {
          intervalTimer = setInterval(async () => {
            try {
              await strategistAgent.runTradeCycle('HSK/USDT');
            } catch (err: any) {
              console.error('[Loop Runner Error]', err.message);
            }
          }, 30000);
        }
        return res.json({
          action,
          reply: '🔄 Autonomous loop started. Running full trade cycle every 30 seconds on HSKSwap.'
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PolicyVault info & settings
  app.get('/api/policy', async (_req: Request, res: Response) => {
    try {
      const policy = await chainAdapter.getPolicy(VAULT_ADDRESS);
      res.json({
        vaultAddress: VAULT_ADDRESS,
        policy,
        formatted: {
          perTradeCap: `${Number(BigInt(policy.perTradeCap) / 10n ** 6n)} USDT`,
          dailyLossLimit: `${Number(BigInt(policy.dailyLossLimit) / 10n ** 6n)} USDT`,
          dailyAgentSpendCap: `${Number(BigInt(policy.dailyAgentSpendCap) / 10n ** 6n)} USDT`,
          maxSlippageBps: `${policy.maxSlippageBps} bps (${policy.maxSlippageBps / 100}%)`,
          isPaused: policy.isPaused
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Policy changes are NEVER signed by the server. The connected user's wallet
  // signs PolicyVault.setPolicy() client-side (see web/assets/web3.js). This
  // endpoint intentionally refuses to write so no transaction can be sent
  // without the user's own approval and gas.
  app.post('/api/policy', (_req: Request, res: Response) => {
    res.status(405).json({
      error: 'Server-side signing is disabled by design.',
      detail: 'Policy updates must be signed by your connected wallet. The frontend calls MWEB3.setPolicy(), which prompts your wallet and pays your own gas.',
      clientSigned: true
    });
  });

  // Vault positions & balances
  app.get('/api/positions', async (_req: Request, res: Response) => {
    try {
      const usdtT = process.env.USDT_ADDRESS || '0xtoken_usdt';
      const hskT = process.env.HSK_ADDRESS || '0xtoken_hsk';
      const wethT = process.env.WETH_ADDRESS || '0xtoken_weth';
      const balances = await chainAdapter.getBalances(VAULT_ADDRESS, [usdtT, hskT, wethT]);
      res.json({
        vault: VAULT_ADDRESS,
        balances,
        formatted: {
          usdt: `${Number(BigInt(balances[usdtT] || '0') / 10n ** 6n)} USDT`,
          hsk: `${Number(BigInt(balances[hskT] || '0') / 10n ** 18n)} HSK`,
          weth: `${(Number(BigInt(balances[wethT] || '0') / 10n ** 15n) / 1000).toFixed(3)} WETH`
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Agents Directory
  app.get('/api/agents', (_req: Request, res: Response) => {
    res.json(db.getAgents());
  });

  // Trade History
  app.get('/api/trades', (_req: Request, res: Response) => {
    res.json(db.getTrades());
  });

  // Spend Ledger (HSP Payment Mandates)
  app.get('/api/mandates', (_req: Request, res: Response) => {
    res.json(db.getMandates());
  });

  // PnL & Attestations
  app.get('/api/pnl', (_req: Request, res: Response) => {
    const trades = db.getTrades();
    let cumulativePnL = 0n;
    let winningTrades = 0;

    for (const trade of trades) {
      const pnl = BigInt(trade.realizedPnL);
      cumulativePnL += pnl;
      if (pnl > 0n) winningTrades++;
    }

    const winRate = trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) + '%' : '0.0%';

    res.json({
      cumulativePnLRaw: cumulativePnL.toString(),
      cumulativePnLUsdt: `${(Number(cumulativePnL) / 10 ** 6).toFixed(2)} USDT`,
      totalTrades: trades.length,
      winRate,
      attestations: db.getAttestations(),
      recentTrades: trades.slice(0, 10)
    });
  });

  // Trigger a single FULL trade cycle (pays agents + executes swap + records PnL)
  app.post('/api/loop/step', async (req: Request, res: Response) => {
    try {
      const pair = req.body?.pair || 'HSK/USDT';
      const result = await strategistAgent.runTradeCycle(pair);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auditor Attestation Generator
  app.post('/api/attest', async (_req: Request, res: Response) => {
    try {
      const attestation = await auditorAgent.generateEpochAttestation(VAULT_ADDRESS);
      db.addAttestation(attestation);
      broadcast('ATTESTATION_PUBLISHED', attestation);
      res.json(attestation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Loop runner state
  let intervalTimer: NodeJS.Timeout | null = null;

  app.post('/api/loop/start', (req: Request, res: Response) => {
    const intervalMs = req.body?.intervalMs || 15000;
    if (intervalTimer) {
      clearInterval(intervalTimer);
    }

    // The autonomous loop runs full trade cycles: signal → risk → execute → mandate settlement.
    // Each cycle pays agents from the PolicyVault, executes a real swap, and records PnL.
    intervalTimer = setInterval(async () => {
      try {
        const pair = ['HSK/USDT', 'WETH/USDT', 'HSK/WETH'][Math.floor(Math.random() * 2)];
        const result = await strategistAgent.runTradeCycle(pair);
        broadcast('TRADE_CYCLE_COMPLETE', result);
        // Every 5 cycles, trigger an auditor attestation
        if (Math.random() < 0.2) {
          const attest = await auditorAgent.generateEpochAttestation(VAULT_ADDRESS);
          db.addAttestation(attest);
          broadcast('ATTESTATION_PUBLISHED', attest);
        }
      } catch (err) {
        console.error('Error in trade loop:', err);
      }
    }, intervalMs);

    broadcast('LOOP_STATUS', { running: true, intervalMs });
    res.json({ status: 'RUNNING', intervalMs });
  });

  app.post('/api/loop/stop', (_req: Request, res: Response) => {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
    broadcast('LOOP_STATUS', { running: false });
    res.json({ status: 'STOPPED' });
  });

  // Live event log
  app.get('/api/events', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    res.json(db.getEvents(limit));
  });

  return { app, server, strategistAgent, auditorAgent, chainAdapter, gateway };
}

if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  const { server } = createApp();
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Meridian Backend API Server running on port ${PORT}`);
    console.log(` WebSocket Feed available at ws://localhost:${PORT}/ws`);
    console.log(` HSK Chain Horizon Hackathon - Agent Native Finance`);
    console.log(`====================================================`);
  });
}
