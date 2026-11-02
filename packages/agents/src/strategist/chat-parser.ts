import { z } from 'zod';

export const PolicyUpdateActionSchema = z.object({
  action: z.literal('UPDATE_POLICY'),
  params: z.object({
    perTradeCap: z.string().optional(),
    dailyLossLimit: z.string().optional(),
    dailyAgentSpendCap: z.string().optional(),
    maxSlippageBps: z.number().optional(),
    allowedTokens: z.array(z.string()).optional(),
    allowedPools: z.array(z.string()).optional()
  }),
  userExplanation: z.string()
});

export const PauseActionSchema = z.object({
  action: z.literal('PAUSE'),
  userExplanation: z.string()
});

export const UnpauseActionSchema = z.object({
  action: z.literal('UNPAUSE'),
  userExplanation: z.string()
});

export const QueryPnLActionSchema = z.object({
  action: z.literal('QUERY_PNL'),
  userExplanation: z.string()
});

export const QueryAgentsActionSchema = z.object({
  action: z.literal('QUERY_AGENTS'),
  userExplanation: z.string()
});

export const UnknownActionSchema = z.object({
  action: z.literal('UNKNOWN'),
  userExplanation: z.string()
});

export const RunTradeActionSchema = z.object({
  action: z.literal('RUN_TRADE'),
  userExplanation: z.string()
});

export const LoopStartActionSchema = z.object({
  action: z.literal('LOOP_START'),
  userExplanation: z.string()
});

export const StrategistActionSchema = z.discriminatedUnion('action', [
  PolicyUpdateActionSchema,
  PauseActionSchema,
  UnpauseActionSchema,
  QueryPnLActionSchema,
  QueryAgentsActionSchema,
  RunTradeActionSchema,
  LoopStartActionSchema,
  UnknownActionSchema
]);

export type StrategistAction = z.infer<typeof StrategistActionSchema>;

/**
 * Deterministic Natural Language Parser for Strategist Agent.
 * Parses user commands into strictly validated schema actions.
 * Guarantees that prompt injection or conversational text cannot execute unauthorized transfers.
 */
export function parseUserCommand(userMessage: string): StrategistAction {
  const text = userMessage.toLowerCase().trim();

  // 1. Pause commands
  if (text.includes('stop trading') || text.includes('pause') || text.includes('freeze') || text.includes('halt')) {
    return {
      action: 'PAUSE',
      userExplanation: 'Emergency stop activated: trading and agent disbursements paused on PolicyVault.'
    };
  }

  // 2. Unpause / resume commands
  if (text.includes('resume') || text.includes('unpause') || text.includes('start trading')) {
    return {
      action: 'UNPAUSE',
      userExplanation: 'PolicyVault unpaused: autonomous trading operations resumed.'
    };
  }

  // 3. Complex policy setup (e.g. "Trade ETH-style majors on HSKSwap, max 5% per trade, 2% daily loss limit, spend at most 20 USDT a day on agent services")
  if (text.includes('per trade') || text.includes('loss limit') || text.includes('spend at most') || (text.includes('max') && text.includes('trade'))) {
    const params: {
      perTradeCap?: string;
      dailyLossLimit?: string;
      dailyAgentSpendCap?: string;
      maxSlippageBps?: number;
    } = {};

    // Match trade cap (e.g. 5% or 50 USDT or 500 USDT)
    const tradeMatch = text.match(/max\s*(\d+)%?\s*(?:usdt)?\s*per\s*trade/i) || text.match(/trade\s*cap\s*(\d+)/i) || text.match(/max\s*(\d+)\s*usdt/i);
    if (tradeMatch) {
      const val = parseInt(tradeMatch[1]);
      const capInUsdt = val <= 100 && text.includes('%') ? val * 100 : val;
      params.perTradeCap = (BigInt(capInUsdt) * 10n ** 6n).toString();
    } else {
      params.perTradeCap = (500n * 10n ** 6n).toString();
    }

    // Match daily loss limit (e.g. 2% or 200 USDT)
    const lossMatch = text.match(/(\d+)%?\s*daily\s*loss/i) || text.match(/loss\s*limit\s*(\d+)/i) || text.match(/(\d+)\s*usdt\s*daily\s*loss/i);
    if (lossMatch) {
      const val = parseInt(lossMatch[1]);
      const lossInUsdt = val <= 100 && text.includes('%') ? val * 50 : val;
      params.dailyLossLimit = (BigInt(lossInUsdt) * 10n ** 6n).toString();
    } else {
      params.dailyLossLimit = (100n * 10n ** 6n).toString();
    }

    // Match agent spend cap (e.g. 20 USDT a day)
    const spendMatch = text.match(/spend\s*(?:at\s*most)?\s*(\d+)\s*(?:usdt)?/i);
    if (spendMatch) {
      const val = parseInt(spendMatch[1]);
      params.dailyAgentSpendCap = (BigInt(val) * 10n ** 6n).toString();
    } else {
      params.dailyAgentSpendCap = (20n * 10n ** 6n).toString();
    }

    return {
      action: 'UPDATE_POLICY',
      params,
      userExplanation: `Compiled natural-language instructions into deterministic PolicyVault update: perTradeCap=${params.perTradeCap}, dailyLossLimit=${params.dailyLossLimit}, dailyAgentSpendCap=${params.dailyAgentSpendCap}.`
    };
  }

  // 4. "Cut risk in half"
  if (text.includes('cut risk') || text.includes('reduce risk') || text.includes('half risk')) {
    return {
      action: 'UPDATE_POLICY',
      params: {
        perTradeCap: (250n * 10n ** 6n).toString(),      // halved from 500 to 250 USDT
        dailyLossLimit: (50n * 10n ** 6n).toString(),    // halved from 100 to 50 USDT
        maxSlippageBps: 50                              // tight 0.5% max slippage
      },
      userExplanation: 'Risk reduced by 50%: per-trade cap lowered to 250 USDT, daily loss limit lowered to 50 USDT, slippage tightened to 50 bps.'
    };
  }

  // 5. PnL / performance query
  if (text.includes('pnl') || text.includes('profit') || text.includes('how much') || text.includes('balance') || text.includes('drawdown')) {
    return {
      action: 'QUERY_PNL',
      userExplanation: 'Fetching real-time verified PnL, equity curve, and Auditor attestations.'
    };
  }

  // 6. Manual trade trigger
  if (text.includes('run trade') || text.includes('trade now') || text.includes('execute trade') || text.includes('single trade') || text.includes('step')) {
    return {
      action: 'RUN_TRADE',
      userExplanation: 'Triggering immediate autonomous trade cycle across HSKSwap.'
    };
  }

  // 7. Loop controls
  if (text.includes('start loop') || text.includes('run loop') || text.includes('auto trade') || text.includes('autonomous loop')) {
    return {
      action: 'LOOP_START',
      userExplanation: 'Starting 30-second autonomous trading loop.'
    };
  }

  // 8. Query agents / marketplace
  if (text.includes('agent') || text.includes('marketplace')) {
    return {
      action: 'QUERY_AGENTS',
      userExplanation: 'Listing registered agents, current pricing, and reputation scores.'
    };
  }

  // Fallback
  return {
    action: 'UNKNOWN',
    userExplanation: `Command received: "${userMessage}". You can set limits ("max 500 USDT per trade, 100 USDT daily loss"), ask "what's my PnL?", "cut risk in half", "trade now", or "stop trading".`
  };
}
