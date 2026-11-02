import { privateKeyToAccount } from 'viem/accounts';
import {
  type PaymentConditions,
  type RiskVerdict,
  signPaymentConditions,
  type IHSPGateway,
  type IChainAdapter
} from '@meridian/sdk';

export interface RiskAgentConfig {
  privateKey: `0x${string}`;
  name?: string;
  auditFeeAmount: string; // e.g. 20000 = 0.02 USDT
  tokenAddress: string;
}

export class RiskAgent {
  public account;
  public name: string;
  public auditFeeAmount: string;
  public tokenAddress: string;
  private pendingAudits = new Map<string, { conditions: PaymentConditions; tradeProposal: any }>();

  constructor(
    private config: RiskAgentConfig,
    private gateway: IHSPGateway,
    private chainAdapter: IChainAdapter
  ) {
    this.account = privateKeyToAccount(config.privateKey);
    this.name = config.name || 'Sentinel Risk Desk';
    this.auditFeeAmount = config.auditFeeAmount;
    this.tokenAddress = config.tokenAddress;
  }

  get address(): string {
    return this.account.address;
  }

  /**
   * Strategist requests risk audit quote, returns HSP payment conditions
   */
  async requestAuditQuote(tradeProposal: {
    pool: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    expectedSlippageBps: number;
  }): Promise<PaymentConditions> {
    const orderId = `risk_order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiry = Math.floor(Date.now() / 1000) + 300;
    const salt = `salt_risk_${Math.random().toString(36).substring(2, 10)}`;

    const unsignedConditions: Omit<PaymentConditions, 'signature'> = {
      orderId,
      payee: this.address,
      token: this.tokenAddress,
      amount: this.auditFeeAmount,
      expiry,
      salt,
      service: 'RISK_AUDIT',
      metadata: {
        pool: tradeProposal.pool,
        amountIn: tradeProposal.amountIn,
        provider: this.name
      }
    };

    const conditions = await signPaymentConditions(unsignedConditions, this.config.privateKey);
    this.pendingAudits.set(orderId, { conditions, tradeProposal });
    return conditions;
  }

  /**
   * Executes risk analysis and releases verdict once HSP payment is verified
   */
  async evaluateRisk(orderId: string): Promise<RiskVerdict> {
    const pending = this.pendingAudits.get(orderId);
    if (!pending) {
      throw new Error(`RiskAgent: Audit request ${orderId} not found`);
    }

    // Verify settlement
    const receipt = await this.gateway.verifySettlement(orderId);
    if (!receipt || receipt.status !== 'SETTLED') {
      throw new Error(`RiskAgent: Settlement not confirmed for ${orderId}. Risk check cannot be released.`);
    }

    const { tradeProposal } = pending;
    this.pendingAudits.delete(orderId);

    // Read pool depth from chain adapter
    const reserves = await this.chainAdapter.getPoolReserves(tradeProposal.pool);
    const amountIn = BigInt(tradeProposal.amountIn);
    const isToken0 = tradeProposal.tokenIn.toLowerCase().includes('hsk') || tradeProposal.tokenIn.toLowerCase().includes('eth');
    const reserveIn = isToken0 ? BigInt(reserves.reserveIn) : BigInt(reserves.reserveOut);

    // Pool depth ratio (in basis points)
    const poolRatioBps = Number((amountIn * 10000n) / (reserveIn > 0n ? reserveIn : 1n));

    // Rule 1: Trade exceeds 5% of pool reserve -> VETO
    if (poolRatioBps > 500) {
      return {
        decision: 'VETO',
        requestedAmount: tradeProposal.amountIn,
        approvedAmount: '0',
        maxSlippageBps: 0,
        poolDepthCheck: false,
        reason: `Trade size represents ${poolRatioBps / 100}% of pool depth. High risk of MEV sandwich and extreme slippage. Trade VETOED.`,
        timestamp: Date.now()
      };
    }

    // Rule 2: Trade between 2% and 5% -> RESIZE down to 1.5%
    if (poolRatioBps > 200) {
      const resizedAmount = (reserveIn * 150n) / 10000n;
      return {
        decision: 'RESIZED',
        requestedAmount: tradeProposal.amountIn,
        approvedAmount: resizedAmount.toString(),
        maxSlippageBps: 80,
        poolDepthCheck: true,
        reason: `Trade size represents ${poolRatioBps / 100}% of pool depth. Resized order to 1.5% of pool reserve to protect against price impact.`,
        timestamp: Date.now()
      };
    }

    // Rule 3: Safe trade -> APPROVED
    return {
      decision: 'APPROVED',
      requestedAmount: tradeProposal.amountIn,
      approvedAmount: tradeProposal.amountIn,
      maxSlippageBps: 50, // 0.5% max slippage allowed
      poolDepthCheck: true,
      reason: `Liquidity depth check passed (${poolRatioBps / 100}% pool utilization). Slippage tolerance 50 bps. Trade APPROVED.`,
      timestamp: Date.now()
    };
  }
}
