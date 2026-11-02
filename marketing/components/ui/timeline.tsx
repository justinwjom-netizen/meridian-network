import { Reveal } from "@/components/reveal";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export type TimelineEntry = {
  marker: string; // e.g. "Q1 2025" or "Step 1"
  title: string;
  description: string;
  status?: "done" | "active" | "upcoming";
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl">
      <span className="absolute left-4 top-2 h-[calc(100%-1rem)] w-px bg-border md:left-1/2" aria-hidden="true" />
      {entries.map((e, i) => (
        <li key={e.marker + i} className="relative mb-8 last:mb-0">
          <Reveal
            className={cn(
              "md:grid md:grid-cols-2 md:gap-8",
              i % 2 === 1 && "md:[&>*:first-child]:col-start-2"
            )}
          >
            <div className={cn("pl-12 md:pl-0", i % 2 === 0 ? "md:pr-8 md:text-right" : "md:col-start-2 md:pl-8")}>
              <div className="glass rounded-lg p-5">
                <div className={cn("mb-2 flex items-center gap-2", i % 2 === 0 && "md:justify-end")}>
                  <Badge
                    variant={
                      e.status === "done" ? "success" : e.status === "active" ? "primary" : "outline"
                    }
                  >
                    {e.marker}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold">{e.title}</h3>
                <p className="mt-1 text-sm text-muted">{e.description}</p>
              </div>
            </div>
          </Reveal>
          <span
            className={cn(
              "absolute left-4 top-5 z-10 h-4 w-4 -translate-x-1/2 rounded-pill border-2 md:left-1/2",
              e.status === "done"
                ? "border-success bg-success"
                : e.status === "active"
                  ? "border-primary bg-primary"
                  : "border-border bg-bg"
            )}
            aria-hidden="true"
          />
        </li>
      ))}
    </ol>
  );
}
