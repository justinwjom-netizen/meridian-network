"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneFrame } from "@/components/ui/phone-frame";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";

const profitBadges = ["+5", "+35", "+70", "+150", "x3", "x8", "x15"];

export function HeroControl() {
  const reduce = useReducedMotion();

  return (
    <section className="section relative overflow-hidden">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <h2 className="font-display font-extrabold leading-[1.05] [font-size:clamp(34px,5vw,60px)]">
            Control
            <br />
            your financial
            <br />
            <span className="text-gradient">future.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">
            A single dashboard for every market. Set your risk, let the AI work, and watch your portfolio in
            real time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/contact" size="lg" withArrow onClick={() => track("trial_start", { where: "hero_b" })}>
              Start free trial
            </Button>
            <span className="text-sm text-muted">{site.trialCaption}</span>
          </div>
        </div>

        {/* Phone mockup with floating avatar + stacked profit badges */}
        <div className="relative order-1 mx-auto lg:order-2">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
          <PhoneFrame className="relative" />

          {/* floating profile avatar */}
          <motion.div
            className="glass absolute -left-4 top-10 flex items-center gap-2 rounded-pill px-3 py-2 shadow-card sm:-left-10"
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-primary-gradient text-xs font-bold text-primary-foreground">
              A
            </span>
            <span className="text-xs">
              <span className="block font-semibold">Alex</span>
              <span className="block text-success">+$1,240 today</span>
            </span>
          </motion.div>

          {/* stacked animated profit badges */}
          <div className="absolute -right-2 top-6 flex flex-col items-end gap-2 sm:-right-8">
            {profitBadges.map((b, i) => (
              <motion.div
                key={b}
                initial={reduce ? false : { opacity: 0, x: 24, scale: 0.6 }}
                whileInView={reduce ? undefined : { opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Badge variant={b.startsWith("x") ? "primary" : "success"} className="shadow-card">
                  {b.startsWith("x") ? b : `${b}%`}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
