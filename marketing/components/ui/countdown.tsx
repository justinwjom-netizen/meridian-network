"use client";

import * as React from "react";

function parts(ms: number) {
  const clamp = Math.max(ms, 0);
  const d = Math.floor(clamp / 86400000);
  const h = Math.floor((clamp % 86400000) / 3600000);
  const m = Math.floor((clamp % 3600000) / 60000);
  const s = Math.floor((clamp % 60000) / 1000);
  return { d, h, m, s };
}

/** Countdown to an ISO date. Renders d/h/m/s cells. */
export function Countdown({ target }: { target: string }) {
  const targetMs = React.useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { d, h, m, s } = parts(now === null ? 0 : targetMs - now);
  const cells = [
    { label: "Days", value: d },
    { label: "Hours", value: h },
    { label: "Minutes", value: m },
    { label: "Seconds", value: s },
  ];

  return (
    <div className="flex gap-2 sm:gap-3" aria-label="Countdown">
      {cells.map((c) => (
        <div key={c.label} className="glass flex min-w-[64px] flex-col items-center rounded-md px-3 py-3">
          <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
            {now === null ? "--" : String(c.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-muted">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
