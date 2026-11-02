import type { LucideIcon } from "lucide-react";
import { PageHero } from "./page-hero";
import { FinalCta } from "./final-cta";
import { FeatureCard } from "@/components/ui/feature-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";
import { Reveal } from "@/components/reveal";
import { RiskNote } from "@/components/ui/risk-note";

export type MarketPageProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  features: { icon: LucideIcon; title: string; body: string }[];
  stats: { value: string; label: string }[];
  faq: AccordionItem[];
};

export function MarketPage({ eyebrow, title, subtitle, features, stats, faq }: MarketPageProps) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: "Start free trial", href: "/contact" }}
        secondaryCta={{ label: "Compare tiers", href: "/trading" }}
      >
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-lg p-4">
              <div className="font-display text-2xl font-bold text-gradient">{s.value}</div>
              <div className="mt-1 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <RiskNote className="mx-auto mt-6 max-w-xl justify-center text-center" />
      </PageHero>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Why it works" title="Everything handled, end to end" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <FeatureCard icon={f.icon} title={f.title}>
                  {f.body}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
          <Reveal className="mx-auto mt-10 max-w-3xl">
            <Accordion items={faq} />
          </Reveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
