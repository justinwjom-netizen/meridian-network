"use client";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";

export function FinalCta({
  title = "Start trading smarter today",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-surface/40 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-60 w-[70%] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
              {subtitle ?? `Join thousands using ${site.brand}. ${site.trialCaption}.`}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg" withArrow onClick={() => track("trial_start", { where: "final_cta" })}>
                Start free trial
              </Button>
              <Button href="/trading" size="lg" variant="ghost">
                Compare tiers
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
