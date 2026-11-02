import { keccak256, encodeAbiParameters, parseAbiParameters, stringToHex } from 'viem';
import type { PolicyConfig } from '../types/index.js';
import type { IChainAdapter, SwapExecutionResult, PaymentExecutionResult } from './chain-adapter.js';

export class MockChainAdapter implements IChainAdapter {
  private balances = new Map<string, Map<string, bigint>>(); // address => (token => balance)
  private policies = new Map<string, PolicyConfig>();
  private dailySpend = new Map<string, bigint>();
  private dailyLoss = new Map<string, bigint>();
  private usedNonces = new Set<string>();
  private executedOrders = new Set<string>();
  private poolLiquidity = new Map<string, {
    token0: string;
    token1: string;
    reserve0: bigint;
    reserve1: bigint;
    rate: number;
  }>();
  private txCounter = 2000;

  constructor() {
    // Setup default mock pools on HSKSwap
    this.poolLiquidity.set('0xpool_hsk_usdt', {
      token0: '0xtoken_hsk',
      token1: '0xtoken_usdt',
      reserve0: 5_000_000n * 10n ** 18n,   // 5M HSK
      reserve1: 12_500_000n * 10n ** 6n,  // 12.5M USDT ($2.50 per HSK)
      rate: 2.50
    });

    this.poolLiquidity.set('0xpool_eth_usdt', {
      token0: '0xtoken_weth',
      token1: '0xtoken_usdt',
      reserve0: 10_000n * 10n ** 18n,      // 10K ETH
      reserve1: 32_000_000n * 10n ** 6n,  // 32M USDT ($3,200 per ETH)
      rate: 3200.0
    });

    this.poolLiquidity.set('0xpool_wbtc_usdt', {
      token0: '0xtoken_wbtc',
      token1: '0xtoken_usdt',
      reserve0: 1_000n * 10n ** 8n,        // 1K WBTC
      reserve1: 88_000_000n * 10n ** 6n,  // 88M USDT ($88,000 per WBTC)
      rate: 88000.0
    });
  }

  setBalance(address: string, token: string, amount: bigint) {
    const addr = address.toLowerCase();
    const tok = token.toLowerCase();
    if (!this.balances.has(addr)) {
      this.balances.set(addr, new Map());
    }
    this.balances.get(addr)!.set(tok, amount);
  }

  async getBalances(address: string, tokens: string[]): Promise<Record<string, string>> {
    const addr = address.toLowerCase();
    const result: Record<string, string> = {};
    const userMap = this.balances.get(addr);
    for (const tok of tokens) {
      const balance = userMap ? userMap.get(tok.toLowerCase()) || 0n : 0n;
      result[tok] = balance.toString();
    }
    return result;
  }

  async getPoolReserves(pool: string): Promise<{ reserveIn: string; reserveOut: string; rate: number }> {
    const poolData = this.poolLiquidity.get(pool.toLowerCase()) || {
      token0: '0xtoken_hsk',
      token1: '0xtoken_usdt',
      reserve0: 5_000_000n * 10n ** 18n,
      reserve1: 12_500_000n * 10n ** 6n,
      rate: 2.5
    };
    return {
      reserveIn: poolData.reserve0.toString(),
      reserveOut: poolData.reserve1.toString(),
      rate: poolData.rate
    };
  }

  async getPolicy(vault: string): Promise<PolicyConfig> {
    const v = vault.toLowerCase();
    if (!this.policies.has(v)) {
      this.policies.set(v, {
        perTradeCap: (500n * 10n ** 6n).toString(),       // 500 USDT cap per trade
        dailyLossLimit: (100n * 10n ** 6n).toString(),    // 100 USDT daily loss limit
        dailyAgentSpendCap: (20n * 10n ** 6n).toString(), // 20 USDT daily agent spend
        maxSlippageBps: 100,                              // 1%
        allowedPayees: [],
        allowedTokens: ['0xtoken_usdt', '0xtoken_hsk', '0xtoken_weth'],
        allowedPools: ['0xpool_hsk_usdt', '0xpool_eth_usdt'],
        isPaused: false
      });
    }
    return this.policies.get(v)!;
  }

  async updatePolicy(vault: string, update: Partial<PolicyConfig>): Promise<{ txHash: string }> {
    const current = await this.getPolicy(vault);
    const updated: PolicyConfig = {
      ...current,
      ...update
    };
    this.policies.set(vault.toLowerCase(), updated);
    this.txCounter++;
    return { txHash: `0xhsk_policy_${this.txCounter}` };
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
    const policy = await this.getPolicy(params.vault);
    if (policy.isPaused) {
      throw new Error('PolicyVault: Vault is paused');
    }

    // 1. Payee allowlist check (empty list = no allowlist enforced in mock/demo mode)
    if (policy.allowedPayees.length > 0 && !policy.allowedPayees.map(p => p.toLowerCase()).includes(params.payee.toLowerCase())) {
      throw new Error(`PolicyVault: Payee ${params.payee} is not in allowed payees list`);
    }
    // Always allow in mock mode when allowedPayees is empty (demo / no allowlist configured)

    // 2. Daily agent spend cap check
    const currentSpend = this.dailySpend.get(params.vault.toLowerCase()) || 0n;
    const requestedSpend = BigInt(params.amount);
    const cap = BigInt(policy.dailyAgentSpendCap);
    if (currentSpend + requestedSpend > cap) {
      throw new Error(`PolicyVault: Daily agent spend cap exceeded. Current: ${currentSpend}, Requested: ${requestedSpend}, Cap: ${cap}`);
    }

    // 3. Replay protection
    const nonceKey = `${params.vault.toLowerCase()}:${params.nonce}`;
    if (this.usedNonces.has(nonceKey)) {
      throw new Error(`MandateRegistry: Nonce ${params.nonce} already used`);
    }
    if (this.executedOrders.has(params.orderId)) {
      throw new Error(`MandateRegistry: Order ${params.orderId} already executed`);
    }

    // Deduct balance
    const vaultBal = (this.balances.get(params.vault.toLowerCase())?.get(params.token.toLowerCase())) || 0n;
    if (vaultBal < requestedSpend) {
      throw new Error(`PolicyVault: Insufficient balance in vault. Balance: ${vaultBal}, Needed: ${requestedSpend}`);
    }

    this.balances.get(params.vault.toLowerCase())!.set(params.token.toLowerCase(), vaultBal - requestedSpend);
    const payeeBal = (this.balances.get(params.payee.toLowerCase())?.get(params.token.toLowerCase())) || 0n;
    this.setBalance(params.payee, params.token, payeeBal + requestedSpend);

    this.dailySpend.set(params.vault.toLowerCase(), currentSpend + requestedSpend);
    this.usedNonces.add(nonceKey);
    this.executedOrders.add(params.orderId);

    this.txCounter++;
    const mandateHash = keccak256(stringToHex(`mandate_${params.orderId}_${params.nonce}`));
    return {
      txHash: `0xhsk_pay_${this.txCounter}`,
      mandateHash
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
    const policy = await this.getPolicy(params.vault);
    if (policy.isPaused) {
      throw new Error('PolicyVault: Vault is paused');
    }

    // Check pool allowlist (empty list = no allowlist enforced in mock/demo mode)
    if (policy.allowedPools.length > 0 && !policy.allowedPools.map(p => p.toLowerCase()).includes(params.pool.toLowerCase())) {
      throw new Error(`PolicyVault: Pool ${params.pool} is not in allowed pools`);
    }

    // Check per-trade cap
    const amountInBig = BigInt(params.amountIn);
    if (amountInBig > BigInt(policy.perTradeCap)) {
      throw new Error(`PolicyVault: Trade amount ${params.amountIn} exceeds perTradeCap ${policy.perTradeCap}`);
    }

    // Check daily loss limit
    const currentLoss = this.dailyLoss.get(params.vault.toLowerCase()) || 0n;
    if (currentLoss > BigInt(policy.dailyLossLimit)) {
      throw new Error(`PolicyVault: Daily loss limit exceeded: ${currentLoss} > ${policy.dailyLossLimit}`);
    }

    // Compute swap output using Uniswap v2 constant product formula: x * y = k
    const pool = this.poolLiquidity.get(params.pool.toLowerCase()) || {
      token0: '0xtoken_hsk',
      token1: '0xtoken_usdt',
      reserve0: 5_000_000n * 10n ** 18n,
      reserve1: 12_500_000n * 10n ** 6n,
      rate: 2.5
    };

    const isToken0In = params.tokenIn.toLowerCase() === pool.token0.toLowerCase() || params.tokenIn.toLowerCase().includes('hsk');
    const reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
    const reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;

    // Uniswap v2: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
    const amountInWithFee = amountInBig * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    const amountOut = numerator / denominator;

    if (amountOut < BigInt(params.minAmountOut)) {
      throw new Error(`HSKSwap: Slippage exceeded minAmountOut. Expected: >= ${params.minAmountOut}, got: ${amountOut}`);
    }

    // Update pool reserves
    if (isToken0In) {
      pool.reserve0 += amountInBig;
      pool.reserve1 -= amountOut;
    } else {
      pool.reserve1 += amountInBig;
      pool.reserve0 -= amountOut;
    }

    this.txCounter++;
    return {
      txHash: `0xhsk_swap_${this.txCounter}`,
      amountOut: amountOut.toString(),
      effectiveRate: Number(amountOut) / Number(amountInBig)
    };
  }
}
