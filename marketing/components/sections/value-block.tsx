import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { partnerLogos } from "@/data/content";

export function ValueBlock() {
  return (
    <section className="section">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow mb-4">State-of-the-art AI</span>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Grow your portfolio with state-of-the-art AI machine-learning technology
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted">
            Our models learn continuously from global markets, turning oceans of data into disciplined,
            repeatable decisions — without the emotion that trips up most traders.
          </p>
          <Button href="/technology" className="mt-7" withArrow>
            See the technology
          </Button>
          <div className="mt-8 flex items-center gap-6">
            {partnerLogos.map((p) => (
              <span key={p.name} className="text-sm font-semibold text-muted/70">
                {p.name}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass relative overflow-hidden rounded-lg p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                ["Accuracy", "Predictive signals"],
                ["Speed", "Millisecond analysis"],
                ["Coverage", "3 asset classes"],
                ["Discipline", "Rules, not emotion"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-border bg-surface/60 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <svg viewBox="0 0 320 120" className="mt-4 h-28 w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="vb-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                  <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 96 L40 84 L80 92 L120 60 L160 72 L200 40 L240 54 L280 24 L320 12"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M0 96 L40 84 L80 92 L120 60 L160 72 L200 40 L240 54 L280 24 L320 12 L320 120 L0 120 Z"
                fill="url(#vb-area)"
              />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
