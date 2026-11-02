import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { StatCounter } from "@/components/ui/stat-counter";
import { RiskNote } from "@/components/ui/risk-note";

export function HighPerformance() {
  return (
    <section className="section">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow mb-4">High performance</span>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Built for consistency, engineered for scale
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted">
            Our infrastructure processes market data continuously and acts within strict risk limits. The goal
            is steady, disciplined participation across market cycles — not reckless bets.
          </p>
          <Button href="/profitability" className="mt-7" withArrow>
            View profitability
          </Button>
          <RiskNote className="mt-5 max-w-md" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass relative overflow-hidden rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Markets analyzed" value={1200000} suffix="+" />
              <Stat label="Avg. uptime" value={99.9} suffix="%" decimals={1} />
              <Stat label="Active traders" value={48000} suffix="+" />
              <Stat label="Assets covered" value={120} suffix="+" />
            </div>
            <svg viewBox="0 0 320 120" className="mt-6 h-28 w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="hp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="hsl(var(--accent-glow))" stopOpacity="0.5" />
                  <stop offset="1" stopColor="hsl(var(--accent-glow))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 100 L40 92 L80 96 L120 72 L160 80 L200 52 L240 60 L280 30 L320 18"
                fill="none"
                stroke="hsl(var(--accent-glow))"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M0 100 L40 92 L80 96 L120 72 L160 80 L200 52 L240 60 L280 30 L320 18 L320 120 L0 120 Z"
                fill="url(#hp-area)"
              />
            </svg>
            <p className="mt-2 text-xs text-muted">Illustrative throughput — demo data.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  suffix,
  decimals,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-md border border-border bg-surface/60 p-4">
      <div className="font-display text-2xl font-bold sm:text-3xl">
        <StatCounter value={value} suffix={suffix} decimals={decimals} />
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
