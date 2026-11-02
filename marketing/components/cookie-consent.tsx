"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "meridian.cookie-consent.v1";

type Prefs = { necessary: true; functional: boolean; analytics: boolean; marketing: boolean };

const rows: { key: keyof Prefs; label: string; description: string; locked?: boolean }[] = [
  { key: "necessary", label: "Necessary", description: "Required for the site to function. Always on.", locked: true },
  { key: "functional", label: "Functional", description: "Remembers your preferences such as language and theme." },
  { key: "analytics", label: "Analytics", description: "Helps us understand how the site is used." },
  { key: "marketing", label: "Marketing", description: "Used to deliver relevant offers and measure campaigns." },
];

export function CookieConsent() {
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<Prefs>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function persist(next: Prefs, choice: string) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ prefs: next, ts: Date.now() }));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
    track("cookie_consent", { choice, ...next });
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="glass relative w-full max-w-lg rounded-lg p-6 shadow-card"
          >
            <h2 id="cookie-title" className="font-display text-xl font-bold">
              We value your privacy
            </h2>
            <p className="mt-2 text-sm text-muted">
              We use cookies to enhance your experience, analyze traffic and personalize content. Choose
              which categories you allow.
            </p>

            <ul className="mt-5 space-y-2">
              {rows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-start justify-between gap-4 rounded-md border border-border/60 bg-surface/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-xs text-muted">{row.description}</p>
                  </div>
                  <Toggle
                    checked={prefs[row.key]}
                    disabled={row.locked}
                    label={row.label}
                    onChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => persist({ necessary: true, functional: false, analytics: false, marketing: false }, "decline")}
              >
                Decline all
              </Button>
              <Button variant="secondary" size="sm" onClick={() => persist(prefs, "save")}>
                Save preferences
              </Button>
              <Button
                size="sm"
                onClick={() => persist({ necessary: true, functional: true, analytics: true, marketing: true }, "accept_all")}
              >
                Accept all
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative mt-0.5 h-6 w-11 shrink-0 rounded-pill transition-colors",
        checked ? "bg-primary" : "bg-surface-2",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-pill bg-white transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
