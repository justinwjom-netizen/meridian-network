import type { Metadata } from "next";
import { Globe, Clock, ShieldCheck, TrendingUp, Layers, Gauge } from "lucide-react";
import { MarketPage } from "@/components/sections/market-page";

export const metadata: Metadata = {
  title: "AI Forex Trading",
  description: "AI-driven forex trading across major, minor and exotic currency pairs.",
};

export default function AiForexTradingPage() {
  return (
    <MarketPage
      eyebrow="Forex"
      title={<>AI forex trading, around the clock</>}
      subtitle="Deep, liquid currency markets are exactly where systematic, data-driven strategies shine."
      stats={[
        { value: "40+", label: "Currency pairs" },
        { value: "5d", label: "Market week" },
        { value: "Majors", label: "+ minors & exotics" },
        { value: "Low", label: "Spreads" },
      ]}
      features={[
        { icon: Globe, title: "Global pairs", body: "Majors, minors and exotics — EUR/USD to USD/ZAR." },
        { icon: Clock, title: "Session-aware", body: "The AI adapts to London, New York and Asia sessions." },
        { icon: TrendingUp, title: "Trend & mean-reversion", body: "Blended strategies suited to different market regimes." },
        { icon: Gauge, title: "Fast execution", body: "Tight routing to help minimize slippage on entries and exits." },
        { icon: Layers, title: "Correlated-risk control", body: "Exposure across correlated pairs is actively managed." },
        { icon: ShieldCheck, title: "Protected capital", body: "Risk limits and liquidation-prevention safeguards apply." },
      ]}
      faq={[
        { q: "Which pairs are supported?", a: "Majors, minors and selected exotics — see the Markets page." },
        { q: "Does leverage apply?", a: "Any leverage is governed by your tier and jurisdiction, and increases risk." },
        { q: "Are results guaranteed?", a: "No. Forex carries substantial risk and past performance is not indicative of future results." },
      ]}
    />
  );
}
