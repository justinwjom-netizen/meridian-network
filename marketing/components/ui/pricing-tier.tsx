import { Check } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export type Tier = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
};

export function PricingTier({ tier }: { tier: Tier }) {
  return (
    <div
      className={cn(
        "glass relative flex flex-col rounded-lg p-6",
        tier.popular && "border-primary/50 shadow-glow"
      )}
    >
      {tier.popular && (
        <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most popular
        </Badge>
      )}
      <h3 className="text-lg font-semibold">{tier.name}</h3>
      <p className="mt-1 text-sm text-muted">{tier.description}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="font-display text-4xl font-bold">{tier.price}</span>
        {tier.period && <span className="pb-1 text-sm text-muted">/{tier.period}</span>}
      </div>
      <ul className="mt-6 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span className="text-muted">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        href={tier.href}
        variant={tier.popular ? "primary" : "secondary"}
        className="mt-7 w-full"
        withArrow
      >
        {tier.cta}
      </Button>
    </div>
  );
}
