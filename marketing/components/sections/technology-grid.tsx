import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/reveal";
import { technologyFeatures } from "@/data/content";

export function TechnologyGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Technology"
          title="Technology that works while you sleep"
          subtitle="Four pillars power every decision the platform makes."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {technologyFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <FeatureCard icon={f.icon} title={f.title}>
                <span className="mb-2 inline-flex items-center gap-1 text-primary">
                  <Star className="h-3.5 w-3.5 fill-primary" />
                </span>
                <span className="block">{f.body}</span>
              </FeatureCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/technology" withArrow>
            Explore the technology
          </Button>
        </div>
      </div>
    </section>
  );
}
