import { cn } from "@/lib/utils";

/** Pure CSS/SVG phone mockup with a placeholder trading dashboard inside. */
export function PhoneFrame({
  className,
  screen,
  title = "Portfolio",
  balance = "$48,250.00",
  change = "+12.4%",
}: {
  className?: string;
  screen?: React.ReactNode;
  title?: string;
  balance?: string;
  change?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[260px] rounded-[2.4rem] border border-border bg-surface p-2.5 shadow-card",
        className
      )}
    >
      <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-pill bg-bg" />
      <div className="relative h-[520px] overflow-hidden rounded-[1.9rem] bg-bg">
        {screen ?? <DefaultScreen title={title} balance={balance} change={change} />}
      </div>
    </div>
  );
}

function DefaultScreen({ title, balance, change }: { title: string; balance: string; change: string }) {
  const bars = [40, 62, 48, 80, 58, 92, 70, 110, 96, 128];
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-8">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{title}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-pill bg-primary/20 text-xs text-primary">
          AI
        </span>
      </div>
      <div className="mt-3">
        <div className="font-display text-2xl font-bold">{balance}</div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-pill bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
          {change} today
        </div>
      </div>

      {/* mini area chart */}
      <div className="mt-4 rounded-md border border-border bg-surface/60 p-3">
        <svg viewBox="0 0 220 90" className="h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="phone-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 70 L24 60 L48 66 L72 44 L96 52 L120 30 L144 40 L168 20 L192 28 L220 10"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M0 70 L24 60 L48 66 L72 44 L96 52 L120 30 L144 40 L168 20 L192 28 L220 10 L220 90 L0 90 Z"
            fill="url(#phone-area)"
          />
        </svg>
      </div>

      {/* bars */}
      <div className="mt-4 flex items-end gap-1.5">
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-primary/30"
            style={{ height: `${b / 2}px` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* rows */}
      <div className="mt-auto space-y-2">
        {[
          ["BTC", "+2.1%"],
          ["ETH", "+1.4%"],
          ["SOL", "-0.8%"],
        ].map(([sym, chg]) => (
          <div key={sym} className="flex items-center justify-between rounded-md bg-surface/60 px-3 py-2 text-xs">
            <span className="font-semibold">{sym}/USDT</span>
            <span className={chg.startsWith("-") ? "text-danger" : "text-success"}>{chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
