import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  MockChainAdapter,
  type PolicyConfig
} from '@meridian/sdk';
import { parseUserCommand } from '@meridian/agents';

const server = new Server(
  {
    name: 'meridian-trade-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const chainAdapter = new MockChainAdapter();
const DEFAULT_VAULT = '0xvault_user_primary';

// Fund mock vault
chainAdapter.setBalance(DEFAULT_VAULT, '0xtoken_usdt', 10000n * 10n ** 6n); // 10,000 USDT
chainAdapter.setBalance(DEFAULT_VAULT, '0xtoken_hsk', 5000n * 10n ** 18n);  // 5,000 HSK

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'set_policy',
        description: 'Set on-chain policy limits using plain English instructions or structured parameters (trade caps, loss limits, spend budget)',
        inputSchema: {
          type: 'object',
          properties: {
            naturalLanguageInstruction: { type: 'string', description: 'Plain English command (e.g. "Trade ETH-style majors, max 500 USDT per trade, 100 USDT daily loss limit")' },
            perTradeCap: { type: 'string', description: 'Optional explicit trade cap in raw units' },
            dailyLossLimit: { type: 'string', description: 'Optional explicit daily loss limit' },
            dailyAgentSpendCap: { type: 'string', description: 'Optional daily fee budget' }
          }
        }
      },
      {
        name: 'get_quote',
        description: 'Get spot price and pool depth from HSKSwap pools (e.g. HSK/USDT, ETH/USDT)',
        inputSchema: {
          type: 'object',
          properties: {
            pool: { type: 'string', description: 'Pool address or key (e.g. 0xpool_hsk_usdt, 0xpool_eth_usdt)' }
          },
          required: ['pool']
        }
      },
      {
        name: 'propose_trade',
        description: 'Simulate a trade against PolicyVault limits and pool depth before execution',
        inputSchema: {
          type: 'object',
          properties: {
            pool: { type: 'string' },
            tokenIn: { type: 'string' },
            tokenOut: { type: 'string' },
            amountIn: { type: 'string' }
          },
          required: ['pool', 'tokenIn', 'tokenOut', 'amountIn']
        }
      },
      {
        name: 'get_positions',
        description: 'Query PolicyVault asset balances and current active holdings',
        inputSchema: {
          type: 'object',
          properties: {
            vaultAddress: { type: 'string', description: 'Optional vault address' }
          }
        }
      },
      {
        name: 'get_pnl',
        description: 'Retrieve current realized PnL, win rate, and verified Auditor attestations',
        inputSchema: {
          type: 'object',
          properties: {
            vaultAddress: { type: 'string' }
          }
        }
      },
      {
        name: 'list_agents',
        description: 'List specialist AI agents in the Meridian marketplace (Signal, Risk, Execution, Auditor) with prices and reputation',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'set_policy') {
      const { naturalLanguageInstruction, perTradeCap, dailyLossLimit, dailyAgentSpendCap } = args as any;
      let update: Partial<PolicyConfig> = {};

      if (naturalLanguageInstruction) {
        const action = parseUserCommand(naturalLanguageInstruction);
        if (action.action === 'UPDATE_POLICY') {
          update = action.params;
        }
      }

      if (perTradeCap) update.perTradeCap = perTradeCap;
      if (dailyLossLimit) update.dailyLossLimit = dailyLossLimit;
      if (dailyAgentSpendCap) update.dailyAgentSpendCap = dailyAgentSpendCap;

      const res = await chainAdapter.updatePolicy(DEFAULT_VAULT, update);
      const current = await chainAdapter.getPolicy(DEFAULT_VAULT);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'POLICY_UPDATED',
            txHash: res.txHash,
            policy: current
          }, null, 2)
        }]
      };
    }

    if (name === 'get_quote') {
      const { pool } = args as any;
      const reserves = await chainAdapter.getPoolReserves(pool);
      return {
        content: [{ type: 'text', text: JSON.stringify(reserves, null, 2) }]
      };
    }

    if (name === 'propose_trade') {
      const { pool, tokenIn, tokenOut, amountIn } = args as any;
      const policy = await chainAdapter.getPolicy(DEFAULT_VAULT);
      const reserves = await chainAdapter.getPoolReserves(pool);

      const amountBig = BigInt(amountIn);
      const capBig = BigInt(policy.perTradeCap);
      const allowed = amountBig <= capBig;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            proposedAmount: amountIn,
            perTradeCap: policy.perTradeCap,
            withinLimits: allowed,
            estimatedRate: reserves.rate,
            poolDepth: reserves.reserveIn,
            status: allowed ? 'APPROVED_BY_POLICY' : 'REJECTED_EXCEEDS_CAP'
          }, null, 2)
        }]
      };
    }

    if (name === 'get_positions') {
      const vault = (args as any)?.vaultAddress || DEFAULT_VAULT;
      const balances = await chainAdapter.getBalances(vault, ['0xtoken_usdt', '0xtoken_hsk', '0xtoken_weth']);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            vault,
            balances,
            formatted: {
              usdt: `${Number(BigInt(balances['0xtoken_usdt']) / 10n ** 6n)} USDT`,
              hsk: `${Number(BigInt(balances['0xtoken_hsk']) / 10n ** 18n)} HSK`
            }
          }, null, 2)
        }]
      };
    }

    if (name === 'get_pnl') {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            cumulativePnL: '+342.50 USDT',
            winRate: '78.5%',
            totalTrades: 24,
            maxDrawdownBps: 180,
            attestations: [
              {
                epochId: 1,
                realizedPnL: '+180.20 USDT',
                auditorSignatureVerified: true
              },
              {
                epochId: 2,
                realizedPnL: '+162.30 USDT',
                auditorSignatureVerified: true
              }
            ]
          }, null, 2)
        }]
      };
    }

    if (name === 'list_agents') {
      const agents = [
        {
          name: 'AlphaFlow Quant Signal Desk',
          role: 'SIGNAL',
          address: '0x1111111111111111111111111111111111111111',
          pricing: '0.05 USDT per signal',
          score: 890,
          stake: '500 HSK',
          tasksCompleted: 342
        },
        {
          name: 'Sentinel Risk Desk',
          role: 'RISK',
          address: '0x2222222222222222222222222222222222222222',
          pricing: '0.02 USDT per check',
          score: 940,
          stake: '1000 HSK',
          tasksCompleted: 410
        },
        {
          name: 'FlashRoute Execution Desk',
          role: 'EXECUTION',
          address: '0x3333333333333333333333333333333333333333',
          pricing: '5 bps of notional',
          score: 915,
          stake: '750 HSK',
          tasksCompleted: 289
        },
        {
          name: 'Veritas On-Chain Auditor',
          role: 'AUDITOR',
          address: '0x4444444444444444444444444444444444444444',
          pricing: '1.00 USDT per epoch attestation',
          score: 980,
          stake: '2500 HSK',
          tasksCompleted: 85
        }
      ];

      return {
        content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
      isError: true
    };
  }
});

export async function runTradeMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Meridian Trade MCP server running on stdio');
}

if (process.argv[1] && process.argv[1].endsWith('trade-server.ts')) {
  runTradeMcpServer().catch(console.error);
}
