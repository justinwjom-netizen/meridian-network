"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";

export function TokenPromo() {
  const reduce = useReducedMotion();

  return (
    <section className="section">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        {/* Coin image (image right on desktop) */}
        <div className="relative order-2 flex justify-center lg:order-2">
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl" />
          <motion.div
            className="relative"
            animate={reduce ? undefined : { rotateY: [0, 360] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={`${site.token} coin`}>
              <defs>
                <radialGradient id="aiao-coin" cx="38%" cy="32%" r="80%">
                  <stop offset="0%" stopColor="hsl(var(--accent-glow))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="92" fill="url(#aiao-coin)" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="4" />
              <circle cx="100" cy="100" r="74" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
              <text x="100" y="104" textAnchor="middle" dominantBaseline="central" fontSize="44" fontWeight="800" fill="white" fontFamily="var(--font-display), sans-serif">
                {site.token}
              </text>
            </svg>
          </motion.div>
        </div>

        <Reveal className="order-1 lg:order-1">
          <span className="eyebrow mb-4">The {site.token} token</span>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Get {site.token} Coin, the leading AI coin that pays dividends
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted">
            Claim free tokens in our airdrop and join the presale early. {site.tokenName} is designed to share
            a portion of platform performance with holders.
          </p>
          <p className="mt-2 text-xs text-muted">
            Dividends and token figures are illustrative demo values, not a promise of returns.
          </p>
          <Button href="/aiao-presale" className="mt-7" withArrow onClick={() => track("cta_click", { where: "token_promo" })}>
            Get FREE tokens
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
