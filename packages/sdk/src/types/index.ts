export type AgentRole = 'STRATEGIST' | 'SIGNAL' | 'RISK' | 'EXECUTION' | 'AUDITOR';

export interface PaymentConditions {
  orderId: string;
  payee: string;
  payer?: string;
  token: string;
  amount: string; // in raw units (e.g. wei)
  expiry: number; // unix timestamp in seconds
  salt: string;
  service: string;
  metadata?: Record<string, any>;
  signature?: string; // Merchant agent signature proving quote terms
}

export interface PaymentMandate {
  payer: string; // Vault address
  payee: string;
  token: string;
  amount: string;
  orderId: string;
  nonce: number;
  expiry: number;
  conditionsHash: string;
  sessionKeySignature: string;
}

export interface SettlementReceipt {
  orderId: string;
  mandateHash: string;
  payer: string;
  payee: string;
  token: string;
  amount: string;
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  txHash: string;
  blockNumber: number;
  settledAt: number;
}

export interface A2AEnvelope<T = any> {
  version: '1.0';
  id: string;
  from: string;
  to: string;
  method: string;
  params: T;
  timestamp: number;
  signature?: string;
}

export interface PolicyConfig {
  perTradeCap: string;        // in raw units
  dailyLossLimit: string;     // in raw units
  dailyAgentSpendCap: string; // in raw units
  maxSlippageBps: number;
  allowedPayees: string[];
  allowedTokens: string[];
  allowedPools: string[];
  isPaused: boolean;
}

export interface TradeSignal {
  signalId: string;
  pair: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number; // 0 to 1
  expectedSlippageBps: number;
  rationale: string;
  timestamp: number;
}

export interface RiskVerdict {
  decision: 'APPROVED' | 'RESIZED' | 'VETO';
  requestedAmount: string;
  approvedAmount: string;
  maxSlippageBps: number;
  poolDepthCheck: boolean;
  reason: string;
  timestamp: number;
}

export interface RouteSplit {
  pool: string;
  amountIn: string;
  expectedOut: string;
}

export interface ExecutionRoute {
  routeId: string;
  path: string[];
  pools: string[];
  amountIn: string;
  expectedOut: string;
  minAmountOut: string;
  splits: RouteSplit[];
  feeBps: number;
  executionFeeAmount: string;
}

export interface EpochAttestation {
  epochId: number;
  vault: string;
  realizedPnL: string; // signed decimal/wei string
  totalVolume: string;
  tradeCount: number;
  maxDrawdownBps: number;
  pnlHash: string;
  auditorSignature: string;
  timestamp: number;
}

export interface AgentDirectoryEntry {
  address: string;
  name: string;
  role: AgentRole;
  endpoint: string;
  pricingDescription: string;
  baseFee: string;
  performanceFeeBps: number;
  score: number;
  stake: string;
  tasksCompleted: number;
  isActive: boolean;
}
