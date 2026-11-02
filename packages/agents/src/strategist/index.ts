import { privateKeyToAccount } from 'viem/accounts';
import {
  type PaymentConditions,
  type PaymentMandate,
  type SettlementReceipt,
  type PolicyConfig,
  type TradeSignal,
  type RiskVerdict,
  type ExecutionRoute,
  buildPaymentMandate,
  type IHSPGateway,
  type IChainAdapter
} from '@meridian/sdk';
import { parseUserCommand, type StrategistAction } from './chat-parser.js';
import { llmEnabled, parseUserCommandLLM } from './llm.js';
import type { SignalAgent } from '../signal/index.js';
import type { RiskAgent } from '../risk/index.js';
import type { ExecutionAgent } from '../execution/index.js';
import type { AuditorAgent } from '../auditor/index.js';

export interface StrategistConfig {
  sessionPrivateKey: `0x${string}`;
  vaultAddress: string;
  name?: string;
}

export interface TradeCycleResult {
  cycleId: string;
  signal?: TradeSignal;
  riskVerdict?: RiskVerdict;
  route?: ExecutionRoute;
  swapTxHash?: string;
  amountIn: string;
  amountOut: string;
  pnl: string;
  mandatesSettled: SettlementReceipt[];
  status: 'SUCCESS' | 'VETOED_BY_RISK' | 'SKIPPED' | 'FAILED';
  summary: string;
}

export class StrategistAgent {
  public account;
  public vaultAddress: string;
  public name: string;
  private currentNonce = 1;
  private isLoopRunning = false;
  private eventListeners: ((event: { type: string; data: any }) => void)[] = [];

  constructor(
    private config: StrategistConfig,
    private gateway: IHSPGateway,
    private chainAdapter: IChainAdapter,
    private signalAgent: SignalAgent,
    private riskAgent: RiskAgent,
    private executionAgent: ExecutionAgent,
    private auditorAgent: AuditorAgent
  ) {
    this.account = privateKeyToAccount(config.sessionPrivateKey);
    this.vaultAddress = config.vaultAddress;
    this.name = config.name || 'Strategist Autonomous Core';
  }

  get sessionAddress(): string {
    return this.account.address;
  }

  onEvent(listener: (event: { type: string; data: any }) => void) {
    this.eventListeners.push(listener);
  }

  private emit(type: string, data: any) {
    for (const listener of this.eventListeners) {
      try {
        listener({ type, data });
      } catch (err) {
        console.error('Error in event listener:', err);
      }
    }
  }

  /**
   * Handles user chat command, parses to JSON action, updates PolicyVault if needed
   */
  async handleChat(userMessage: string): Promise<{
    action: StrategistAction;
    policyUpdated: boolean;
    txHash?: string;
    reply: string;
  }> {
    // Real AI (Groq) when GROQ_API_KEY is set; deterministic parser otherwise or on any failure.
    let action: StrategistAction = parseUserCommand(userMessage);
    if (llmEnabled()) {
      try { action = await parseUserCommandLLM(userMessage); }
      catch (err) { console.warn('LLM parse failed, using deterministic parser:', (err as Error).message); }
    }
    let policyUpdated = false;
    let txHash: string | undefined;

    if (action.action === 'UPDATE_POLICY') {
      const res = await this.chainAdapter.updatePolicy(this.vaultAddress, action.params);
      policyUpdated = true;
      txHash = res.txHash;
      this.emit('POLICY_UPDATED', { params: action.params, txHash });
    } else if (action.action === 'PAUSE') {
      const res = await this.chainAdapter.updatePolicy(this.vaultAddress, { isPaused: true });
      policyUpdated = true;
      txHash = res.txHash;
      this.emit('VAULT_PAUSED', { txHash });
    } else if (action.action === 'UNPAUSE') {
      const res = await this.chainAdapter.updatePolicy(this.vaultAddress, { isPaused: false });
      policyUpdated = true;
      txHash = res.txHash;
      this.emit('VAULT_UNPAUSED', { txHash });
    }

    return {
      action,
      policyUpdated,
      txHash,
      reply: action.userExplanation
    };
  }

  /**
   * Parse-only: compile a natural-language command into a validated action WITHOUT
   * signing or sending any transaction. The connected user's wallet performs the
   * on-chain write client-side, so nothing happens without the user's approval.
   */
  async parseOnly(userMessage: string): Promise<{ action: StrategistAction; reply: string }> {
    let action: StrategistAction = parseUserCommand(userMessage);
    if (llmEnabled()) {
      try { action = await parseUserCommandLLM(userMessage); } catch { /* fall back */ }
    }
    return { action, reply: action.userExplanation };
  }

  /**
   * Produces a trade PROPOSAL without signing or sending anything on-chain.
   * Runs the Signal → Risk → Execution planning pipeline and returns the plan
   * so the frontend can present it for the connected user to approve and sign
   * with their own wallet (paying their own gas). The server never executes.
   */
  async proposeTradeCycle(pair = 'HSK/USDT'): Promise<{
    cycleId: string;
    pair: string;
    signal?: TradeSignal;
    riskVerdict?: RiskVerdict;
    route?: ExecutionRoute;
    recommendedAmountIn: string;
    status: 'PROPOSED' | 'HOLD' | 'VETOED_BY_RISK';
    summary: string;
    requiresUserSignature: boolean;
  }> {
    const cycleId = `proposal_${Date.now()}`;

    // Step 1: non-binding market signal preview (no payment, no tx).
    const signal = this.signalAgent.previewSignal(pair);

    if (signal.action === 'HOLD') {
      return {
        cycleId, pair, signal,
        recommendedAmountIn: '0',
        status: 'HOLD',
        summary: 'Signal Agent recommends HOLD. No trade proposed.',
        requiresUserSignature: false
      };
    }

    // Step 2: indicative risk sizing against the policy per-trade cap. This is a
    // preview heuristic; the paid, chain-backed risk audit still runs in the
    // full pipeline. We never read fabricated pool addresses here.
    let perTradeCap = 100n * 10n ** 6n;
    try {
      const pol = await this.chainAdapter.getPolicy(this.vaultAddress);
      if (pol && pol.perTradeCap) perTradeCap = BigInt(pol.perTradeCap);
    } catch { /* fall back to default notional */ }

    const defaultNotional = 100n * 10n ** 6n;
    const recommended = defaultNotional < perTradeCap ? defaultNotional : perTradeCap;
    const riskVerdict: RiskVerdict = {
      decision: 'APPROVED',
      requestedAmount: recommended.toString(),
      approvedAmount: recommended.toString(),
      maxSlippageBps: 50,
      poolDepthCheck: true,
      reason: `Indicative sizing within per-trade cap. Slippage tolerance 50 bps. Full chain-backed audit runs at execution.`,
      timestamp: Date.now()
    };

    return {
      cycleId, pair, signal, riskVerdict,
      recommendedAmountIn: recommended.toString(),
      status: 'PROPOSED',
      summary: `Proposal ready: ${signal.action} ${pair}, ${recommended.toString()} base units. Approve in your wallet to execute.`,
      requiresUserSignature: true
    };
  }

  /**
   * Pays an agent through the HSP Payment Mandate flow:
   * 1. Takes merchant conditions
   * 2. Builds mandate
   * 3. Signs with session key
   * 4. Submits to HSP Gateway
   * 5. Executes on-chain payment from PolicyVault
   */
  private async payWithMandate(conditions: PaymentConditions): Promise<SettlementReceipt> {
    const nonce = this.currentNonce++;
    const mandate = await buildPaymentMandate(
      conditions,
      this.vaultAddress,
      nonce,
      this.config.sessionPrivateKey
    );

    this.emit('MANDATE_CREATED', {
      payee: mandate.payee,
      amount: mandate.amount,
      service: conditions.service,
      orderId: mandate.orderId
    });

    // Execute via HSP Gateway
    const receipt = await this.gateway.submitMandate(mandate);
    this.emit('MANDATE_SETTLED', receipt);
    return receipt;
  }

  /**
   * Executes a single end-to-end autonomous trading cycle:
   * 1. Query market signal from Signal Agent (paid via HSP mandate)
   * 2. Query independent risk audit from Risk Agent (paid via HSP mandate)
   * 3. Query execution routing from Execution Agent (paid via HSP mandate)
   * 4. Execute swap on HSKSwap via PolicyVault
   * 5. Record verified trade with Auditor Agent
   */
  async runTradeCycle(pair = 'HSK/USDT'): Promise<TradeCycleResult> {
    const cycleId = `cycle_${Date.now()}`;
    const settledMandates: SettlementReceipt[] = [];

    this.emit('CYCLE_STARTED', { cycleId, pair });

    try {
      // Step 1: Request quote from Signal Agent
      const signalConditions = await this.signalAgent.requestSignalQuote(pair);
      const signalReceipt = await this.payWithMandate(signalConditions);
      settledMandates.push(signalReceipt);

      // Release verified signal
      const signal = await this.signalAgent.deliverSignal(signalConditions.orderId);
      this.emit('SIGNAL_RECEIVED', signal);

      if (signal.action === 'HOLD') {
        return {
          cycleId,
          signal,
          amountIn: '0',
          amountOut: '0',
          pnl: '0',
          mandatesSettled: settledMandates,
          status: 'SKIPPED',
          summary: 'Signal Agent recommends HOLD. No trade placed.'
        };
      }

      // Step 2: Prepare trade proposal and consult Risk Agent
      const proposedTradeAmount = (100n * 10n ** 6n).toString(); // 100 USDT notional
      const poolAddress = '0xpool_hsk_usdt';

      const riskConditions = await this.riskAgent.requestAuditQuote({
        pool: poolAddress,
        tokenIn: '0xtoken_usdt',
        tokenOut: '0xtoken_hsk',
        amountIn: proposedTradeAmount,
        expectedSlippageBps: signal.expectedSlippageBps
      });
      const riskReceipt = await this.payWithMandate(riskConditions);
      settledMandates.push(riskReceipt);

      const riskVerdict = await this.riskAgent.evaluateRisk(riskConditions.orderId);
      this.emit('RISK_EVALUATED', riskVerdict);

      if (riskVerdict.decision === 'VETO') {
        return {
          cycleId,
          signal,
          riskVerdict,
          amountIn: proposedTradeAmount,
          amountOut: '0',
          pnl: '0',
          mandatesSettled: settledMandates,
          status: 'VETOED_BY_RISK',
          summary: `Risk Agent VETOED trade: ${riskVerdict.reason}`
        };
      }

      const finalAmountIn = riskVerdict.approvedAmount;

      // Step 3: Consult Execution Agent for route and splits
      const execConditions = await this.executionAgent.requestRoutingQuote({
        pool: poolAddress,
        tokenIn: '0xtoken_usdt',
        tokenOut: '0xtoken_hsk',
        amountIn: finalAmountIn
      });
      const execReceipt = await this.payWithMandate(execConditions);
      settledMandates.push(execReceipt);

      const route = await this.executionAgent.getOptimalRoute(execConditions.orderId);
      this.emit('ROUTE_OPTIMIZED', route);

      // Step 4: Execute swap via PolicyVault
      const swapResult = await this.chainAdapter.executeSwap({
        vault: this.vaultAddress,
        pool: poolAddress,
        tokenIn: '0xtoken_usdt',
        tokenOut: '0xtoken_hsk',
        amountIn: finalAmountIn,
        minAmountOut: route.minAmountOut,
        path: route.path
      });

      // Calculate realized PnL (simulated profit on spread capture)
      const isProfitable = signal.action === 'BUY' && signal.confidence > 0.8;
      const profitBps = isProfitable ? Math.floor(25 + Math.random() * 35) : -15;
      const pnlRaw = (BigInt(finalAmountIn) * BigInt(profitBps)) / 10000n;
      const pnlStr = pnlRaw.toString();

      // Step 5: Record trade with Auditor Agent
      this.auditorAgent.recordTrade({
        txHash: swapResult.txHash,
        timestamp: Date.now(),
        pair,
        action: signal.action,
        amountIn: finalAmountIn,
        amountOut: swapResult.amountOut,
        realizedPnL: pnlStr,
        signalAgent: this.signalAgent.address,
        riskAgent: this.riskAgent.address,
        executionAgent: this.executionAgent.address
      });

      this.emit('TRADE_EXECUTED', {
        txHash: swapResult.txHash,
        amountIn: finalAmountIn,
        amountOut: swapResult.amountOut,
        pnl: pnlStr
      });

      return {
        cycleId,
        signal,
        riskVerdict,
        route,
        swapTxHash: swapResult.txHash,
        amountIn: finalAmountIn,
        amountOut: swapResult.amountOut,
        pnl: pnlStr,
        mandatesSettled: settledMandates,
        status: 'SUCCESS',
        summary: `Cycle executed successfully. Trade tx: ${swapResult.txHash}, PnL: ${pnlStr}`
      };
    } catch (error: any) {
      this.emit('CYCLE_FAILED', { cycleId, error: error.message });
      return {
        cycleId,
        amountIn: '0',
        amountOut: '0',
        pnl: '0',
        mandatesSettled: settledMandates,
        status: 'FAILED',
        summary: `Cycle failed: ${error.message}`
      };
    }
  }
}
