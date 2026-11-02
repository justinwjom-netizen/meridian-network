import type { PolicyConfig } from '../types/index.js';

export interface SwapExecutionResult {
  txHash: string;
  amountOut: string;
  effectiveRate: number;
}

export interface PaymentExecutionResult {
  txHash: string;
  mandateHash: string;
}

export interface IChainAdapter {
  getBalances(address: string, tokens: string[]): Promise<Record<string, string>>;
  getPoolReserves(pool: string): Promise<{ reserveIn: string; reserveOut: string; rate: number }>;
  executeSwap(params: {
    vault: string;
    pool: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    path: string[];
  }): Promise<SwapExecutionResult>;
  executePayment(params: {
    vault: string;
    payee: string;
    token: string;
    amount: string;
    orderId: string;
    nonce: number;
    expiry: number;
    conditionsHash: string;
  }): Promise<PaymentExecutionResult>;
  getPolicy(vault: string): Promise<PolicyConfig>;
  updatePolicy(vault: string, update: Partial<PolicyConfig>): Promise<{ txHash: string }>;
}
