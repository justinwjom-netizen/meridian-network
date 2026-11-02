import type { Metadata } from "next";
import { Bitcoin, Zap, ShieldCheck, Repeat, Radar, Wallet } from "lucide-react";
import { MarketPage } from "@/components/sections/market-page";

export const metadata: Metadata = {
  title: "AI Crypto Trading",
  description: "Trade crypto 24/7 with AI signals and arbitrage across top digital assets.",
};

export default function AiCryptoTradingPage() {
  return (
    <MarketPage
      eyebrow="Crypto"
      title={<>AI crypto trading that never sleeps</>}
      subtitle="Digital-asset markets run around the clock — and so does our engine, with AI signals and cross-venue arbitrage."
      stats={[
        { value: "24/7", label: "Market hours" },
        { value: "50+", label: "Pairs" },
        { value: "AI", label: "Signals" },
        { value: "Multi", label: "Venue arbitrage" },
      ]}
      features={[
        { icon: Bitcoin, title: "Top digital assets", body: "BTC, ETH, SOL and more — all monitored continuously by the AI." },
        { icon: Zap, title: "AI crypto signals", body: "Probabilistic entry, target and stop levels generated in real time." },
        { icon: Repeat, title: "AI crypto arbitrage", body: "Capture price differences across venues (Elite tier)." },
        { icon: ShieldCheck, title: "Safeguarded funds", body: "Segregated accounts and liquidation-prevention controls." },
        { icon: Radar, title: "Sentiment-aware", body: "On-chain and social sentiment feed into the model's view." },
        { icon: Wallet, title: "Easy funding", body: "Fund with card, SEPA or stablecoins and start in minutes." },
      ]}
      faq={[
        { q: "What are AI crypto signals?", a: "Model-generated trade ideas with entry, target and stop levels — all illustrative demo values here." },
        { q: "Is arbitrage available on all tiers?", a: "Cross-venue arbitrage is an Elite-tier feature." },
        { q: "How volatile is crypto?", a: "Highly. Crypto carries substantial risk; never invest more than you can afford to lose." },
      ]}
    />
  );
}
