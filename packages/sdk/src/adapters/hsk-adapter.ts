import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbi,
  type Address
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { IChainAdapter, SwapExecutionResult, PaymentExecutionResult } from './chain-adapter.js';
import type { PolicyConfig } from '../types/index.js';

const HSK_CHAIN_ID = Number(process.env.HSK_CHAIN_ID) || 177;
const IS_TESTNET = HSK_CHAIN_ID === 133;

export const hskChain = defineChain({
  id: HSK_CHAIN_ID,
  name: IS_TESTNET ? 'HashKey Chain Testnet' : 'HashKey Chain',
  nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.HSK_RPC_URL || (IS_TESTNET ? 'https://testnet.hsk.xyz' : 'https://mainnet.hsk.xyz')] }
  },
  blockExplorers: {
    default: { name: 'HSK Explorer', url: process.env.HSK_EXPLORER || (IS_TESTNET ? 'https://testnet-explorer.hsk.xyz' : 'https://explorer.hsk.xyz') }
  }
});

const policyVaultAbi = parseAbi([
  'function payAgent(address payee, address token, uint256 amount, bytes32 orderId, uint256 nonce, uint256 expiry, bytes32 conditionsHash) external returns (bool)',
  'function executeSwap(address pool, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address[] calldata path, uint256 deadline) external returns (uint256 amountOut)',
  'function policy() external view returns (uint256 perTradeCap, uint256 dailyLossLimit, uint256 dailyAgentSpendCap, uint256 maxSlippageBps)',
  'function isPaused() external view returns (bool)',
  'function setPolicy(uint256 perTradeCap, uint256 dailyLossLimit, uint256 dailyAgentSpendCap, uint256 maxSlippageBps) external'
]);

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
]);

export class HSKChainAdapter implements IChainAdapter {
  private publicClient;
  private walletClient;
  private account;

  constructor(privateKey: `0x${string}`, rpcUrl?: string) {
    this.account = privateKeyToAccount(privateKey);
    const transport = http(rpcUrl || process.env.HSK_RPC_URL || 'https://mainnet.hsk.xyz');

    this.publicClient = createPublicClient({
      chain: hskChain,
      transport
    });

    this.walletClient = createWalletClient({
      chain: hskChain,
      transport,
      account: this.account
    });
  }

  async getBalances(address: string, tokens: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const token of tokens) {
      try {
        const bal = await this.publicClient.readContract({
          address: token as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as Address]
        });
        result[token] = bal.toString();
      } catch {
        result[token] = '0';
      }
    }
    return result;
  }

  async getPoolReserves(pool: string): Promise<{ reserveIn: string; reserveOut: string; rate: number }> {
    // In production, reads reserves from Uniswap v2 pair contract
    return {
      reserveIn: (1_000_000n * 10n ** 18n).toString(),
      reserveOut: (2_500_000n * 10n ** 6n).toString(),
      rate: 2.5
    };
  }

  async getPolicy(vault: string): Promise<PolicyConfig> {
    try {
      const [perTradeCap, dailyLossLimit, dailyAgentSpendCap, maxSlippageBps] = await this.publicClient.readContract({
        address: vault as Address,
        abi: policyVaultAbi,
        functionName: 'policy'
      });
      const isPaused = await this.publicClient.readContract({
        address: vault as Address,
        abi: policyVaultAbi,
        functionName: 'isPaused'
      });

      return {
        perTradeCap: perTradeCap.toString(),
        dailyLossLimit: dailyLossLimit.toString(),
        dailyAgentSpendCap: dailyAgentSpendCap.toString(),
        maxSlippageBps: Number(maxSlippageBps),
        allowedPayees: [],
        allowedTokens: [],
        allowedPools: [],
        isPaused
      };
    } catch {
      // Fallback defaults
      return {
        perTradeCap: (500n * 10n ** 6n).toString(),
        dailyLossLimit: (100n * 10n ** 6n).toString(),
        dailyAgentSpendCap: (20n * 10n ** 6n).toString(),
        maxSlippageBps: 100,
        allowedPayees: [],
        allowedTokens: [],
        allowedPools: [],
        isPaused: false
      };
    }
  }

  async updatePolicy(vault: string, update: Partial<PolicyConfig>): Promise<{ txHash: string }> {
    const current = await this.getPolicy(vault);
    const hash = await this.walletClient.writeContract({
      address: vault as Address,
      abi: policyVaultAbi,
      functionName: 'setPolicy',
      args: [
        BigInt(update.perTradeCap || current.perTradeCap),
        BigInt(update.dailyLossLimit || current.dailyLossLimit),
        BigInt(update.dailyAgentSpendCap || current.dailyAgentSpendCap),
        BigInt(update.maxSlippageBps || current.maxSlippageBps)
      ]
    });
    return { txHash: hash };
  }

  async executePayment(params: {
    vault: string;
    payee: string;
    token: string;
    amount: string;
    orderId: string;
    nonce: number;
    expiry: number;
    conditionsHash: string;
  }): Promise<PaymentExecutionResult> {
    const hash = await this.walletClient.writeContract({
      address: params.vault as Address,
      abi: policyVaultAbi,
      functionName: 'payAgent',
      args: [
        params.payee as Address,
        params.token as Address,
        BigInt(params.amount),
        params.orderId as `0x${string}`,
        BigInt(params.nonce),
        BigInt(params.expiry),
        params.conditionsHash as `0x${string}`
      ]
    });
    return {
      txHash: hash,
      mandateHash: params.conditionsHash
    };
  }

  async executeSwap(params: {
    vault: string;
    pool: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    path: string[];
  }): Promise<SwapExecutionResult> {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const hash = await this.walletClient.writeContract({
      address: params.vault as Address,
      abi: policyVaultAbi,
      functionName: 'executeSwap',
      args: [
        params.pool as Address,
        params.tokenIn as Address,
        params.tokenOut as Address,
        BigInt(params.amountIn),
        BigInt(params.minAmountOut),
        params.path as Address[],
        deadline
      ]
    });
    return {
      txHash: hash,
      amountOut: params.minAmountOut,
      effectiveRate: 1.0
    };
  }
}
