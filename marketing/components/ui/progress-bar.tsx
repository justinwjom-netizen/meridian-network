"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number; // 0–100
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">{label}</span>
          <span className="font-semibold text-text">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={cn("h-2.5 w-full overflow-hidden rounded-pill bg-surface-2")}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-pill bg-primary-gradient"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
