"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Check, ChevronDown } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions/locale";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function choose(loc: Locale) {
    await setLocale(loc);
    track("locale_change", { locale: loc });
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-pill border border-border/60 px-3 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-text"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{current}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <ul
          role="menu"
          className="glass absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-md p-1 shadow-card"
        >
          {locales.map((loc) => (
            <li key={loc} role="none">
              <button
                role="menuitemradio"
                aria-checked={loc === current}
                onClick={() => choose(loc)}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-white/5"
              >
                <span>{localeNames[loc]}</span>
                {loc === current && <Check className="h-4 w-4 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
