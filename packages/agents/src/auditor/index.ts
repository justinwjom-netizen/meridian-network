import { keccak256, encodeAbiParameters, parseAbiParameters, stringToHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { type EpochAttestation, normalizeAddress } from '@meridian/sdk';

export interface AuditorConfig {
  privateKey: `0x${string}`;
  name?: string;
  auditFeeAmount?: string;
  tokenAddress?: string;
}

export interface TradeRecord {
  txHash: string;
  timestamp: number;
  pair: string;
  action: 'BUY' | 'SELL';
  amountIn: string;
  amountOut: string;
  realizedPnL: string; // signed integer string
  signalAgent?: string;
  riskAgent?: string;
  executionAgent?: string;
}

export class AuditorAgent {
  public account;
  public name: string;
  private tradeHistory: TradeRecord[] = [];
  private currentEpoch = 1;

  constructor(private config: AuditorConfig) {
    this.account = privateKeyToAccount(config.privateKey);
    this.name = config.name || 'Veritas On-Chain Auditor';
  }

  get address(): string {
    return this.account.address;
  }

  recordTrade(record: TradeRecord) {
    this.tradeHistory.push(record);
  }

  getTradeHistory(): TradeRecord[] {
    return [...this.tradeHistory];
  }

  /**
   * Replays trade logs, computes metrics, and produces a cryptographically signed epoch attestation
   */
  async generateEpochAttestation(vaultAddress: string): Promise<EpochAttestation> {
    const epochId = this.currentEpoch++;
    const timestamp = Date.now();

    let cumulativePnL = 0n;
    let totalVolume = 0n;
    let peakPnL = 0n;
    let maxDrawdown = 0n;

    for (const trade of this.tradeHistory) {
      const pnl = BigInt(trade.realizedPnL);
      cumulativePnL += pnl;
      totalVolume += BigInt(trade.amountIn);

      if (cumulativePnL > peakPnL) {
        peakPnL = cumulativePnL;
      }
      const drawdown = peakPnL > cumulativePnL ? peakPnL - cumulativePnL : 0n;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Max drawdown in basis points (relative to volume or base 1000 USDT)
    const baseDenom = totalVolume > 0n ? totalVolume : 1000n * 10n ** 6n;
    const maxDrawdownBps = Number((maxDrawdown * 10000n) / baseDenom);

    // Compute deterministic PnL hash
    const pnlHash = keccak256(
      encodeAbiParameters(
        parseAbiParameters('uint256, address, int256, uint256, uint256, uint256, uint256'),
        [
          BigInt(epochId),
          normalizeAddress(vaultAddress),
          cumulativePnL,
          totalVolume,
          BigInt(this.tradeHistory.length),
          BigInt(maxDrawdownBps),
          BigInt(Math.floor(timestamp / 1000))
        ]
      )
    );

    // Sign the hash with the Auditor's private key
    const auditorSignature = await this.account.signMessage({
      message: { raw: pnlHash as `0x${string}` }
    });

    return {
      epochId,
      vault: vaultAddress,
      realizedPnL: cumulativePnL.toString(),
      totalVolume: totalVolume.toString(),
      tradeCount: this.tradeHistory.length,
      maxDrawdownBps,
      pnlHash,
      auditorSignature,
      timestamp
    };
  }

  /**
   * Calculates agent reputation deltas based on performance
   */
  evaluateAgentReputation(agentAddress: string): { delta: number; verified: boolean } {
    const agentTrades = this.tradeHistory.filter(
      t => t.signalAgent?.toLowerCase() === agentAddress.toLowerCase() ||
           t.riskAgent?.toLowerCase() === agentAddress.toLowerCase() ||
           t.executionAgent?.toLowerCase() === agentAddress.toLowerCase()
    );

    if (agentTrades.length === 0) {
      return { delta: 0, verified: true };
    }

    const profitable = agentTrades.filter(t => BigInt(t.realizedPnL) > 0n).length;
    const winRate = profitable / agentTrades.length;

    // +10 score for >60% win rate, -5 for <40%
    if (winRate >= 0.6) {
      return { delta: 15, verified: true };
    } else if (winRate < 0.4) {
      return { delta: -10, verified: false };
    }
    return { delta: 5, verified: true };
  }
}
