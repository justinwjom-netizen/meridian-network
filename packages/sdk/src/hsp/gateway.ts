import { recoverMessageAddress, keccak256, stringToHex } from 'viem';
import type { PaymentMandate, SettlementReceipt, PaymentConditions } from '../types/index.js';
import { computeMandateHash } from './mandate.js';

export interface IHSPGateway {
  submitMandate(mandate: PaymentMandate): Promise<SettlementReceipt>;
  verifySettlement(orderId: string): Promise<SettlementReceipt | null>;
  listSettlements(): Promise<SettlementReceipt[]>;
}

export class HSPGateway implements IHSPGateway {
  private settlements = new Map<string, SettlementReceipt>();
  private usedNonces = new Set<string>();
  private txCounter = 1000;

  constructor(
    private options: {
      onChainExecutor?: (mandate: PaymentMandate) => Promise<string>; // returns txHash
    } = {}
  ) {}

  /**
   * Verifies the signed mandate and executes settlement
   */
  async submitMandate(mandate: PaymentMandate): Promise<SettlementReceipt> {
    const now = Math.floor(Date.now() / 1000);

    // 1. Check expiration
    if (now > mandate.expiry) {
      throw new Error(`HSP Gateway: Mandate expired at ${mandate.expiry}, current time ${now}`);
    }

    // 2. Replay protection
    const nonceKey = `${mandate.payer.toLowerCase()}:${mandate.nonce}`;
    if (this.usedNonces.has(nonceKey)) {
      throw new Error(`HSP Gateway: Nonce ${mandate.nonce} has already been used by payer ${mandate.payer}`);
    }

    // 3. Verify session key signature
    const mandateHash = computeMandateHash(mandate);
    const recoveredSigner = await recoverMessageAddress({
      message: { raw: mandateHash as `0x${string}` },
      signature: mandate.sessionKeySignature as `0x${string}`
    });

    if (!recoveredSigner) {
      throw new Error('HSP Gateway: Invalid session key signature');
    }

    // 4. Execute on-chain if executor provided, else simulate on HSK Chain
    let txHash: string;
    if (this.options.onChainExecutor) {
      txHash = await this.options.onChainExecutor(mandate);
    } else {
      this.txCounter++;
      txHash = `0xhsk${this.txCounter.toString(16).padStart(60, '0')}`;
    }

    // Mark nonce as used
    this.usedNonces.add(nonceKey);

    const receipt: SettlementReceipt = {
      orderId: mandate.orderId,
      mandateHash,
      payer: mandate.payer,
      payee: mandate.payee,
      token: mandate.token,
      amount: mandate.amount,
      status: 'SETTLED',
      txHash,
      blockNumber: 12480000 + this.settlements.size,
      settledAt: Date.now()
    };

    this.settlements.set(mandate.orderId, receipt);
    return receipt;
  }

  async verifySettlement(orderId: string): Promise<SettlementReceipt | null> {
    return this.settlements.get(orderId) || null;
  }

  async listSettlements(): Promise<SettlementReceipt[]> {
    return Array.from(this.settlements.values());
  }
}
