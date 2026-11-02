"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Sticky bottom CTA bar on mobile only; appears after scrolling past the hero. */
export function MobileCtaBar() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-bg/90 p-3 backdrop-blur-xl transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Button
        href="/trading"
        className="w-full"
        withArrow
        onClick={() => track("trial_start", { where: "mobile_bar" })}
      >
        Start free trial
      </Button>
    </div>
  );
}
