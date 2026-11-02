import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-[44px]">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-muted sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
