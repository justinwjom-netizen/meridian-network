import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <div className="container relative py-20 text-center lg:py-28">
        <Reveal>
          {eyebrow && (
            <Badge variant="primary" className="mb-5">
              {eyebrow}
            </Badge>
          )}
          <h1 className="mx-auto max-w-4xl font-display font-extrabold leading-[1.05] [font-size:clamp(34px,6vw,64px)]">
            {title}
          </h1>
          {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">{subtitle}</p>}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {primaryCta && (
                <Button href={primaryCta.href} size="lg" withArrow>
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button href={secondaryCta.href} size="lg" variant="ghost">
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          )}
          {children && <div className="mt-10">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}
