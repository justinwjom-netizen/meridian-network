import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact risk disclaimer shown near every performance figure. */
export function RiskNote({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <p className={cn("flex items-start gap-2 text-xs text-muted", className)}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
      <span>
        {children ??
          "Illustrative demo values. Trading involves substantial risk of loss. Past performance is not indicative of future results."}
      </span>
    </p>
  );
}
