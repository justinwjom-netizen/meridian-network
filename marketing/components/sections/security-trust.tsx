import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Reveal } from "@/components/reveal";
import { securityCards } from "@/data/content";

export function SecurityTrust() {
  return (
    <section className="section">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mb-4">Trust</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Turning data into dollars</h2>
          <p className="mt-3 text-xl font-semibold text-gradient">Your security is our #1 priority</p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {securityCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <FeatureCard icon={card.icon} title={card.title}>
                {card.body}
              </FeatureCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/contact" withArrow>
            Open an account
          </Button>
        </div>
      </div>
    </section>
  );
}
