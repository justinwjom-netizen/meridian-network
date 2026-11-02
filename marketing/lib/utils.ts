import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatter (1.2K, 3.4M). */
export function formatCompact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
