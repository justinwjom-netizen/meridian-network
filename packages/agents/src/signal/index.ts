import { privateKeyToAccount } from 'viem/accounts';
import {
  type PaymentConditions,
  type TradeSignal,
  type SettlementReceipt,
  signPaymentConditions,
  type IHSPGateway
} from '@meridian/sdk';

export interface SignalAgentConfig {
  privateKey: `0x${string}`;
  name?: string;
  priceAmount: string; // e.g. 50000 = 0.05 USDT
  tokenAddress: string;
}

export class SignalAgent {
  public account;
  public name: string;
  public priceAmount: string;
  public tokenAddress: string;
  private pendingQuotes = new Map<string, { conditions: PaymentConditions; signal: TradeSignal }>();

  constructor(
    private config: SignalAgentConfig,
    private gateway: IHSPGateway
  ) {
    this.account = privateKeyToAccount(config.privateKey);
    this.name = config.name || 'AlphaFlow Quant Signal Desk';
    this.priceAmount = config.priceAmount;
    this.tokenAddress = config.tokenAddress;
  }

  get address(): string {
    return this.account.address;
  }

  /**
   * Non-binding signal PREVIEW for proposals. Returns indicative signal data
   * without payment or settlement, so the UI can show the user what the agent
   * would recommend before they decide to pay and execute. The paid, verified
   * signal still flows only through requestSignalQuote → deliverSignal.
   */
  previewSignal(pair: string): TradeSignal {
    return this.generateSignalForPair(pair);
  }

  /**
   * Generates a trade signal and returns HSP Payment Conditions.
   * Does NOT release the signal until payment is settled!
   */
  async requestSignalQuote(pair: string): Promise<PaymentConditions> {
    const orderId = `sig_order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiry = Math.floor(Date.now() / 1000) + 300; // 5 minute validity
    const salt = `salt_${Math.random().toString(36).substring(2, 10)}`;

    // Generate signal data
    const signal: TradeSignal = this.generateSignalForPair(pair);

    const unsignedConditions: Omit<PaymentConditions, 'signature'> = {
      orderId,
      payee: this.address,
      token: this.tokenAddress,
      amount: this.priceAmount,
      expiry,
      salt,
      service: 'ALPHA_SIGNAL',
      metadata: {
        pair,
        provider: this.name,
        confidenceTier: signal.confidence > 0.8 ? 'HIGH' : 'STANDARD'
      }
    };

    const conditions = await signPaymentConditions(unsignedConditions, this.config.privateKey);
    this.pendingQuotes.set(orderId, { conditions, signal });

    return conditions;
  }

  /**
   * Delivers the signal ONLY if settlement receipt is verified by HSP Gateway
   */
  async deliverSignal(orderId: string): Promise<TradeSignal> {
    const quote = this.pendingQuotes.get(orderId);
    if (!quote) {
      throw new Error(`SignalAgent: Quote for order ${orderId} not found`);
    }

    // Verify settlement with HSP Gateway
    const receipt = await this.gateway.verifySettlement(orderId);
    if (!receipt || receipt.status !== 'SETTLED') {
      throw new Error(`SignalAgent: Payment settlement not verified for order ${orderId}. Access denied.`);
    }

    // Ensure settled payee matches this agent
    if (receipt.payee.toLowerCase() !== this.address.toLowerCase()) {
      throw new Error(`SignalAgent: Settlement payee mismatch`);
    }

    // Clean up quote cache and deliver high-alpha signal
    this.pendingQuotes.delete(orderId);
    return quote.signal;
  }

  private generateSignalForPair(pair: string): TradeSignal {
    // Generates quantitative momentum & spread capture signal
    const isETH = pair.toUpperCase().includes('ETH');
    const isHSK = pair.toUpperCase().includes('HSK');
    const action = Math.random() > 0.4 ? 'BUY' : 'SELL';
    
    let basePrice = 2.50; // HSK default
    if (isETH) basePrice = 3200.0;

    const spreadBps = Math.floor(15 + Math.random() * 45); // 15 to 60 bps spread
    const targetMultiplier = action === 'BUY' ? (1 + spreadBps / 10000) : (1 - spreadBps / 10000);
    const stopLossMultiplier = action === 'BUY' ? 0.985 : 1.015;

    return {
      signalId: `sig_${Date.now()}`,
      pair,
      action,
      entryPrice: basePrice,
      targetPrice: parseFloat((basePrice * targetMultiplier).toFixed(4)),
      stopLoss: parseFloat((basePrice * stopLossMultiplier).toFixed(4)),
      confidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
      expectedSlippageBps: 20,
      rationale: `Cross-pool spread capture & volume delta expansion detected on ${pair}. Momentum RSI favorable at 48.2.`,
      timestamp: Date.now()
    };
  }
}
