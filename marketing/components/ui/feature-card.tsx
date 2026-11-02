"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Glass feature card with optional hover-tilt. */
export function FeatureCard({
  icon: Icon,
  title,
  children,
  className,
  tilt = true,
}: {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState("");

  function onMove(e: React.MouseEvent) {
    if (!tilt || reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTransform(`perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTransform("")}
      style={{ transform }}
      className={cn(
        "glass group relative overflow-hidden rounded-lg p-6 transition-[transform,border-color] duration-200 hover:border-primary/40",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-0" />
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </motion.div>
  );
}
