"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinIcon, type CoinSymbol } from "@/components/ui/coin-icon";
import { Badge } from "@/components/ui/badge";
import { site } from "@/data/site";
import { partnerLogos } from "@/data/content";
import { track } from "@/lib/analytics";

type FloatCoin = { symbol: CoinSymbol; top: string; left: string; size: number; chip: string; delay: number };

const coins: FloatCoin[] = [
  { symbol: "BTC", top: "6%", left: "8%", size: 64, chip: "+5%", delay: 0 },
  { symbol: "ETH", top: "20%", left: "78%", size: 58, chip: "+35%", delay: 0.4 },
  { symbol: "LTC", top: "62%", left: "4%", size: 50, chip: "x3", delay: 0.8 },
  { symbol: "SOL", top: "70%", left: "82%", size: 60, chip: "+70%", delay: 1.2 },
  { symbol: "XMR", top: "40%", left: "90%", size: 46, chip: "x8", delay: 1.6 },
];

export function HeroCrypto() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <Badge variant="primary" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Multiply your investment
          </Badge>
          <h1 className="font-display font-extrabold leading-[1.02] tracking-tight [font-size:clamp(40px,7vw,84px)]">
            Trade smarter with <span className="text-gradient">AI</span>.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            {site.brand} puts state-of-the-art machine-learning technology to work across crypto, forex and
            stocks — so your portfolio never sleeps.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/contact" size="lg" withArrow onClick={() => track("trial_start", { where: "hero_a" })}>
              Start FREE trial
            </Button>
            <span className="text-sm text-muted">{site.trialCaption}</span>
          </div>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Official partners</p>
            <div className="mt-3 flex items-center gap-6">
              {partnerLogos.map((p) => (
                <span key={p.name} className="text-base font-semibold text-muted/70">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating coins stage */}
        <div className="relative h-[360px] sm:h-[440px]">
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl sm:h-72 sm:w-72" />
          <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-surface/40 backdrop-blur-xl sm:h-52 sm:w-52">
            <span className="text-center font-display text-xl font-bold leading-tight sm:text-2xl">
              AI
              <br />
              <span className="text-gradient">Engine</span>
            </span>
          </div>
          {coins.map((c) => (
            <motion.div
              key={c.symbol}
              className="absolute"
              style={{ top: c.top, left: c.left }}
              animate={reduce ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 5 + c.delay, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
            >
              <div className="relative">
                <CoinIcon symbol={c.symbol} size={c.size} />
                <motion.span
                  className="absolute -right-2 -top-2"
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={reduce ? undefined : { scale: [0, 1.1, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: c.delay + 0.5, times: [0, 0.15, 0.3, 0.8, 1] }}
                >
                  <Badge variant="success" className="shadow-card">
                    {c.chip}
                  </Badge>
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
