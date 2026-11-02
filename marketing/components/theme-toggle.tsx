"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { track } from "@/lib/analytics";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60 text-muted transition-colors hover:border-primary/50 hover:text-text"
      onClick={() => {
        const next = isDark ? "light" : "dark";
        setTheme(next);
        track("theme_toggle", { theme: next });
      }}
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
