import fs from 'node:fs';
import path from 'node:path';
import type { AgentDirectoryEntry, SettlementReceipt, EpochAttestation } from '@meridian/sdk';
import type { TradeRecord } from '@meridian/agents';

export interface DatabaseSchema {
  agents: AgentDirectoryEntry[];
  trades: TradeRecord[];
  mandates: SettlementReceipt[];
  attestations: EpochAttestation[];
  events: { id: string; type: string; timestamp: number; payload: any }[];
}

export class MeridianDatabase {
  private filePath: string;
  private data: DatabaseSchema;

  constructor(storageDir = './data') {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.filePath = path.join(storageDir, 'meridian_db.json');

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = this.getDefaults();
      }
    } else {
      this.data = this.getDefaults();
      this.save();
    }
  }

  private getDefaults(): DatabaseSchema {
    return {
      agents: [
        {
          address: '0x1111111111111111111111111111111111111111',
          name: 'AlphaFlow Quant Signal Desk',
          role: 'SIGNAL',
          endpoint: 'http://localhost:3001/agents/signal',
          pricingDescription: '0.05 USDT per signal',
          baseFee: (50000).toString(),
          performanceFeeBps: 1500, // 15% performance share
          score: 890,
          stake: (500n * 10n ** 18n).toString(),
          tasksCompleted: 342,
          isActive: true
        },
        {
          address: '0x2222222222222222222222222222222222222222',
          name: 'Sentinel Risk Desk',
          role: 'RISK',
          endpoint: 'http://localhost:3001/agents/risk',
          pricingDescription: '0.02 USDT per check',
          baseFee: (20000).toString(),
          performanceFeeBps: 0,
          score: 940,
          stake: (1000n * 10n ** 18n).toString(),
          tasksCompleted: 410,
          isActive: true
        },
        {
          address: '0x3333333333333333333333333333333333333333',
          name: 'FlashRoute Execution Desk',
          role: 'EXECUTION',
          endpoint: 'http://localhost:3001/agents/execution',
          pricingDescription: '5 bps of notional',
          baseFee: (10000).toString(),
          performanceFeeBps: 0,
          score: 915,
          stake: (750n * 10n ** 18n).toString(),
          tasksCompleted: 289,
          isActive: true
        },
        {
          address: '0x4444444444444444444444444444444444444444',
          name: 'Veritas On-Chain Auditor',
          role: 'AUDITOR',
          endpoint: 'http://localhost:3001/agents/auditor',
          pricingDescription: '1.00 USDT per epoch attestation',
          baseFee: (1000000).toString(),
          performanceFeeBps: 0,
          score: 980,
          stake: (2500n * 10n ** 18n).toString(),
          tasksCompleted: 85,
          isActive: true
        }
      ],
      trades: [],
      mandates: [],
      attestations: [],
      events: []
    };
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save meridian database:', err);
    }
  }

  // --- Agents ---
  getAgents(): AgentDirectoryEntry[] {
    return this.data.agents;
  }

  addAgent(agent: AgentDirectoryEntry) {
    this.data.agents.push(agent);
    this.save();
  }

  updateAgentScore(address: string, delta: number) {
    const agent = this.data.agents.find(a => a.address.toLowerCase() === address.toLowerCase());
    if (agent) {
      agent.score = Math.max(0, Math.min(1000, agent.score + delta));
      agent.tasksCompleted += 1;
      this.save();
    }
  }

  // --- Trades ---
  getTrades(): TradeRecord[] {
    return this.data.trades;
  }

  addTrade(trade: TradeRecord) {
    this.data.trades.unshift(trade);
    if (this.data.trades.length > 500) {
      this.data.trades.pop();
    }
    this.save();
  }

  // --- Mandates ---
  getMandates(): SettlementReceipt[] {
    return this.data.mandates;
  }

  addMandate(mandate: SettlementReceipt) {
    this.data.mandates.unshift(mandate);
    this.save();
  }

  // --- Attestations ---
  getAttestations(): EpochAttestation[] {
    return this.data.attestations;
  }

  addAttestation(attestation: EpochAttestation) {
    this.data.attestations.unshift(attestation);
    this.save();
  }

  // --- Events ---
  getEvents(limit = 100) {
    return this.data.events.slice(0, limit);
  }

  addEvent(type: string, payload: any) {
    this.data.events.unshift({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: Date.now(),
      payload
    });
    if (this.data.events.length > 300) {
      this.data.events.pop();
    }
    this.save();
  }
}
