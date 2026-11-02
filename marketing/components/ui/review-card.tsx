import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Review = {
  name: string;
  handle?: string;
  rating: number; // 1–5
  body: string;
};

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < Math.round(rating) ? "fill-primary text-primary" : "text-border")}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="glass mb-4 break-inside-avoid rounded-lg p-5">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 text-sm leading-relaxed text-muted">“{review.body}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-pill bg-primary-gradient text-xs font-bold text-primary-foreground">
          {review.name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-semibold">{review.name}</span>
          {review.handle && <span className="block text-xs text-muted">{review.handle}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
