import { privateKeyToAccount } from 'viem/accounts';
import {
  type PaymentConditions,
  type ExecutionRoute,
  signPaymentConditions,
  type IHSPGateway,
  type IChainAdapter
} from '@meridian/sdk';

export interface ExecutionAgentConfig {
  privateKey: `0x${string}`;
  name?: string;
  feeBps: number; // e.g. 5 bps = 0.05%
  tokenAddress: string;
}

export class ExecutionAgent {
  public account;
  public name: string;
  public feeBps: number;
  public tokenAddress: string;
  private pendingRoutes = new Map<string, { conditions: PaymentConditions; orderPlan: any }>();

  constructor(
    private config: ExecutionAgentConfig,
    private gateway: IHSPGateway,
    private chainAdapter: IChainAdapter
  ) {
    this.account = privateKeyToAccount(config.privateKey);
    this.name = config.name || 'FlashRoute Execution Desk';
    this.feeBps = config.feeBps || 5;
    this.tokenAddress = config.tokenAddress;
  }

  get address(): string {
    return this.account.address;
  }

  /**
   * Strategist requests execution routing quote, returns HSP payment conditions based on notional fee
   */
  async requestRoutingQuote(params: {
    pool: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
  }): Promise<PaymentConditions> {
    const orderId = `exec_order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiry = Math.floor(Date.now() / 1000) + 300;
    const salt = `salt_exec_${Math.random().toString(36).substring(2, 10)}`;

    // Fee in bps of notional: amountIn * feeBps / 10000
    const notionalFee = (BigInt(params.amountIn) * BigInt(this.feeBps)) / 10000n;
    const feeAmount = notionalFee > 10000n ? notionalFee.toString() : '10000'; // minimum 0.01 USDT

    const unsignedConditions: Omit<PaymentConditions, 'signature'> = {
      orderId,
      payee: this.address,
      token: this.tokenAddress,
      amount: feeAmount,
      expiry,
      salt,
      service: 'OPTIMAL_EXECUTION',
      metadata: {
        pool: params.pool,
        amountIn: params.amountIn,
        feeBps: this.feeBps,
        provider: this.name
      }
    };

    const conditions = await signPaymentConditions(unsignedConditions, this.config.privateKey);
    this.pendingRoutes.set(orderId, { conditions, orderPlan: params });
    return conditions;
  }

  /**
   * Releases optimal route and order splits after HSP payment confirms
   */
  async getOptimalRoute(orderId: string): Promise<ExecutionRoute> {
    const pending = this.pendingRoutes.get(orderId);
    if (!pending) {
      throw new Error(`ExecutionAgent: Routing order ${orderId} not found`);
    }

    // Verify settlement
    const receipt = await this.gateway.verifySettlement(orderId);
    if (!receipt || receipt.status !== 'SETTLED') {
      throw new Error(`ExecutionAgent: Settlement not confirmed for ${orderId}`);
    }

    const { orderPlan } = pending;
    this.pendingRoutes.delete(orderId);

    const reserves = await this.chainAdapter.getPoolReserves(orderPlan.pool);
    const amountInBig = BigInt(orderPlan.amountIn);

    // Calculate expected output with pool reserves
    const reserve0 = BigInt(reserves.reserveIn); // HSK
    const reserve1 = BigInt(reserves.reserveOut); // USDT
    const isToken0In = orderPlan.tokenIn.toLowerCase().includes('hsk');
    const reserveIn = isToken0In ? reserve0 : reserve1;
    const reserveOut = isToken0In ? reserve1 : reserve0;

    const amountInWithFee = amountInBig * 997n;
    const expectedOutBig = (amountInWithFee * reserveOut) / (reserveIn * 1000n + amountInWithFee);
    // Apply 0.5% (50 bps) max slippage bound
    const minAmountOutBig = (expectedOutBig * 9950n) / 10000n;

    // Multi-tranche split if amountIn > $500 to minimize single-block price impact
    const isLarge = amountInBig > (500n * 10n ** 6n);
    const splits = isLarge
      ? [
          {
            pool: orderPlan.pool,
            amountIn: ((amountInBig * 60n) / 100n).toString(),
            expectedOut: ((expectedOutBig * 60n) / 100n).toString()
          },
          {
            pool: orderPlan.pool,
            amountIn: ((amountInBig * 40n) / 100n).toString(),
            expectedOut: ((expectedOutBig * 40n) / 100n).toString()
          }
        ]
      : [
          {
            pool: orderPlan.pool,
            amountIn: orderPlan.amountIn,
            expectedOut: expectedOutBig.toString()
          }
        ];

    return {
      routeId: `route_${Date.now()}`,
      path: [orderPlan.tokenIn, orderPlan.tokenOut],
      pools: [orderPlan.pool],
      amountIn: orderPlan.amountIn,
      expectedOut: expectedOutBig.toString(),
      minAmountOut: minAmountOutBig.toString(),
      splits,
      feeBps: this.feeBps,
      executionFeeAmount: pending.conditions.amount
    };
  }
}
