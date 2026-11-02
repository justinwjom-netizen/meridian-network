"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[125] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="glass relative w-full max-w-md rounded-lg p-6 shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
              <button
                aria-label="Close"
                onClick={onClose}
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-pill border border-border/60 text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
