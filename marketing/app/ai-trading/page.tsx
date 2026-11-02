import type { Metadata } from "next";
import { Bot, ShieldCheck, Gauge, Layers, LineChart, Clock } from "lucide-react";
import { MarketPage } from "@/components/sections/market-page";

export const metadata: Metadata = {
  title: "AI Trading",
  description:
    "Automated AI trading across crypto, forex and stocks. Set your risk, let the machine-learning engine work around the clock.",
};

export default function AiTradingPage() {
  return (
    <MarketPage
      eyebrow="AI Trading"
      title={<>Automated trading, powered by AI</>}
      subtitle="One engine, every market. Our models analyze, decide and execute within the risk limits you set."
      stats={[
        { value: "3", label: "Asset classes" },
        { value: "24/7", label: "Always on" },
        { value: "120+", label: "Instruments" },
        { value: "<1s", label: "Decision latency" },
      ]}
      features={[
        { icon: Bot, title: "Hands-free execution", body: "The AI places and manages trades automatically so you don't have to watch the charts." },
        { icon: ShieldCheck, title: "Risk-first design", body: "Position sizing, exposure caps and drawdown limits are enforced on every trade." },
        { icon: Gauge, title: "Millisecond speed", body: "High-throughput infrastructure reacts to market moves faster than any human could." },
        { icon: Layers, title: "True diversification", body: "Spread risk across uncorrelated assets with continuous rebalancing." },
        { icon: LineChart, title: "Transparent records", body: "Every decision is logged and reviewable — evidence over marketing claims." },
        { icon: Clock, title: "Set and forget", body: "Choose a tier, set your preferences and let the engine run across market cycles." },
      ]}
      faq={[
        { q: "Which markets can the AI trade?", a: "Crypto, forex and stocks, depending on your tier." },
        { q: "Do I keep control?", a: "Yes. You set the risk limits and can pause or withdraw at any time." },
        { q: "Are returns guaranteed?", a: "No. Trading involves substantial risk of loss and we never guarantee returns." },
      ]}
    />
  );
}
