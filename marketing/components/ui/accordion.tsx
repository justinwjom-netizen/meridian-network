"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { q: string; a: React.ReactNode };

export function Accordion({
  items,
  className,
  allowMultiple = false,
}: {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
}) {
  const [open, setOpen] = React.useState<number[]>([]);

  function toggle(i: number) {
    setOpen((prev) =>
      prev.includes(i)
        ? prev.filter((x) => x !== i)
        : allowMultiple
          ? [...prev, i]
          : [i]
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        return (
          <div key={i} className="glass overflow-hidden rounded-md">
            <h3>
              <button
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold transition-colors hover:text-primary"
              >
                {item.q}
                <Plus
                  className={cn(
                    "h-5 w-5 shrink-0 text-primary transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
