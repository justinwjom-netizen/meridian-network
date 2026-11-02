import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  signPaymentConditions,
  buildPaymentMandate,
  HSPGateway,
  type PaymentConditions,
  type PaymentMandate
} from '@meridian/sdk';

const server = new Server(
  {
    name: 'meridian-pay-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const gateway = new HSPGateway();
const TEST_MERCHANT_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d' as `0x${string}`;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_payment_conditions',
        description: 'Generate merchant payment conditions for an agent service with EIP-712 cryptographic signature',
        inputSchema: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Name of the service (e.g. ALPHA_SIGNAL, RISK_AUDIT)' },
            amount: { type: 'string', description: 'Amount in raw units (e.g. 50000 for 0.05 USDT)' },
            token: { type: 'string', description: 'Token address or 0x0 for native HSK' },
            payee: { type: 'string', description: 'Merchant agent address' },
            expirySeconds: { type: 'number', description: 'Validity duration in seconds' }
          },
          required: ['service', 'amount']
        }
      },
      {
        name: 'build_mandate',
        description: 'Build and sign an HSP Payment Mandate from merchant payment conditions',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: { type: 'object', description: 'Payment conditions returned by merchant' },
            vaultAddress: { type: 'string', description: 'PolicyVault address paying the fee' },
            nonce: { type: 'number', description: 'Sequential payer nonce' },
            sessionPrivateKey: { type: 'string', description: 'Strategist session private key' }
          },
          required: ['conditions', 'vaultAddress', 'nonce', 'sessionPrivateKey']
        }
      },
      {
        name: 'submit_mandate',
        description: 'Submit a signed HSP Payment Mandate to the gateway for on-chain verification and settlement',
        inputSchema: {
          type: 'object',
          properties: {
            mandate: { type: 'object', description: 'Signed PaymentMandate object' }
          },
          required: ['mandate']
        }
      },
      {
        name: 'verify_settlement',
        description: 'Verify if an orderId has been settled on-chain and retrieve cryptographic settlement receipt',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: 'Unique order identifier' }
          },
          required: ['orderId']
        }
      },
      {
        name: 'list_payments',
        description: 'List all settled payments in the agent spend ledger',
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
    if (name === 'create_payment_conditions') {
      const { service, amount, token = '0xtoken_usdt', payee = '0x1234567890123456789012345678901234567890', expirySeconds = 300 } = args as any;
      const orderId = `mcp_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const expiry = Math.floor(Date.now() / 1000) + expirySeconds;
      const salt = `mcp_salt_${Math.random().toString(36).substring(2, 8)}`;

      const conditions = await signPaymentConditions(
        {
          orderId,
          payee,
          token,
          amount,
          expiry,
          salt,
          service
        },
        TEST_MERCHANT_KEY
      );

      return {
        content: [{ type: 'text', text: JSON.stringify(conditions, null, 2) }]
      };
    }

    if (name === 'build_mandate') {
      const { conditions, vaultAddress, nonce, sessionPrivateKey } = args as any;
      const mandate = await buildPaymentMandate(
        conditions as PaymentConditions,
        vaultAddress,
        nonce,
        sessionPrivateKey as `0x${string}`
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(mandate, null, 2) }]
      };
    }

    if (name === 'submit_mandate') {
      const { mandate } = args as any;
      const receipt = await gateway.submitMandate(mandate as PaymentMandate);
      return {
        content: [{ type: 'text', text: JSON.stringify(receipt, null, 2) }]
      };
    }

    if (name === 'verify_settlement') {
      const { orderId } = args as any;
      const receipt = await gateway.verifySettlement(orderId);
      return {
        content: [{ type: 'text', text: JSON.stringify(receipt, null, 2) }]
      };
    }

    if (name === 'list_payments') {
      const payments = await gateway.listSettlements();
      return {
        content: [{ type: 'text', text: JSON.stringify(payments, null, 2) }]
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

export async function runPayMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Meridian Pay MCP server running on stdio');
}

if (process.argv[1] && process.argv[1].endsWith('pay-server.ts')) {
  runPayMcpServer().catch(console.error);
}
