import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/** SVG wordmark + glyph placeholder. Swap the <svg> for your real logo. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label={`${site.brand} home`}
      className={cn("inline-flex items-center gap-2 font-display text-lg font-extrabold", className)}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent-glow))" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
        <path
          d="M8 22V10l8 7 8-7v12"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span>{site.brand}</span>
    </Link>
  );
}
