"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible slide carousel with arrows + dots and keyboard support. */
export function Carousel({
  slides,
  className,
  ariaLabel = "Carousel",
}: {
  slides: React.ReactNode[];
  className?: string;
  ariaLabel?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const count = slides.length;

  const go = React.useCallback(
    (next: number) => {
      setDir(next > index || (index === count - 1 && next === 0) ? 1 : -1);
      setIndex((next + count) % count);
    },
    [index, count]
  );

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-lg">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={index}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${count}`}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60 text-muted transition-colors hover:border-primary/50 hover:text-text"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-2 rounded-pill transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-surface-2 hover:bg-muted"
              )}
            />
          ))}
        </div>

        <button
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60 text-muted transition-colors hover:border-primary/50 hover:text-text"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
