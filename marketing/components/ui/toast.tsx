"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; variant?: "success" | "error" };
type ToastContextValue = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2"
        role="region"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="glass pointer-events-auto flex items-start gap-3 rounded-md p-4 shadow-card"
            >
              {t.variant === "error" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className={cn("rounded-md p-1 text-muted hover:text-text")}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
