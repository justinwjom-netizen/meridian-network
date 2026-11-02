import type { Metadata } from "next";
import { CandlestickChart, Building2, ShieldCheck, PieChart, Newspaper, Gauge } from "lucide-react";
import { MarketPage } from "@/components/sections/market-page";

export const metadata: Metadata = {
  title: "AI Stocks Trading",
  description: "AI-driven trading across global equities with disciplined risk management.",
};

export default function AiStocksTradingPage() {
  return (
    <MarketPage
      eyebrow="Stocks"
      title={<>AI stocks trading for global equities</>}
      subtitle="From mega-caps to momentum names, the AI times entries and exits with disciplined risk controls."
      stats={[
        { value: "500+", label: "Equities" },
        { value: "Global", label: "Exchanges" },
        { value: "AI", label: "Timing" },
        { value: "Daily", label: "Rebalance" },
      ]}
      features={[
        { icon: CandlestickChart, title: "Price + fundamentals", body: "Signals blend technical structure with fundamental context." },
        { icon: Building2, title: "Global coverage", body: "US and international names across major exchanges." },
        { icon: Newspaper, title: "News-aware", body: "Earnings and headlines are factored into the model's view." },
        { icon: PieChart, title: "Portfolio balance", body: "Sector and single-name exposure is actively managed." },
        { icon: Gauge, title: "Smart execution", body: "Orders are routed to help reduce market impact." },
        { icon: ShieldCheck, title: "Risk guardrails", body: "Per-position and portfolio limits enforced automatically." },
      ]}
      faq={[
        { q: "Can I pick specific stocks?", a: "You set preferences and constraints; the AI handles timing within them." },
        { q: "Are dividends included?", a: "Equity dividends follow the underlying instruments; AIAO token dividends are separate and illustrative." },
        { q: "Is there risk?", a: "Yes. Equity trading involves substantial risk of loss." },
      ]}
    />
  );
}
