"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

type Trade = { id: number; asset: string; direction: "Buy" | "Sell"; result: number };

const ASSETS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XAU/USD", "EUR/USD", "AAPL", "TSLA", "LTC/USDT"];

function randomTrade(id: number): Trade {
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const direction = Math.random() > 0.5 ? "Buy" : "Sell";
  // skew slightly positive but keep losses visible (demo data)
  const result = +(Math.random() * 6 - 1.6).toFixed(2);
  return { id, asset, direction, result };
}

/** Live-looking operations table. Rows auto-prepend every few seconds.
 *  Clearly labeled as demo data — never real trade history. */
export function ResultTable({ initial = 6, max = 8 }: { initial?: number; max?: number }) {
  const idRef = React.useRef(0);
  const [rows, setRows] = React.useState<Trade[]>(() =>
    Array.from({ length: initial }, () => randomTrade(idRef.current++))
  );

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(
      () => setRows((prev) => [randomTrade(idRef.current++), ...prev].slice(0, max)),
      reduce ? 7000 : 3200
    );
    return () => clearInterval(id);
  }, [max]);

  return (
    <div className="glass overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-semibold">Last operations</span>
        <Badge variant="outline">
          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-pill bg-success" />
          Demo data · live feed
        </Badge>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">Asset</th>
            <th className="px-5 py-3 font-medium">Direction</th>
            <th className="px-5 py-3 text-right font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((t) => (
              <motion.tr
                key={t.id}
                layout
                initial={{ opacity: 0, backgroundColor: "hsl(var(--primary) / 0.12)" }}
                animate={{ opacity: 1, backgroundColor: "hsl(var(--primary) / 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="border-t border-border/60"
              >
                <td className="px-5 py-3 font-medium">{t.asset}</td>
                <td className="px-5 py-3">
                  <Badge variant={t.direction === "Buy" ? "success" : "danger"}>{t.direction}</Badge>
                </td>
                <td
                  className={cn(
                    "px-5 py-3 text-right font-semibold tabular-nums",
                    t.result >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {t.result >= 0 ? "+" : ""}
                  {t.result.toFixed(2)}%
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
