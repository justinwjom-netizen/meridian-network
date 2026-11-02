import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "./badge";
import type { Post } from "@/data/posts";

export function BlogCard({ post }: { post: Post }) {
  return (
    <article className="glass group flex flex-col overflow-hidden rounded-lg transition-colors hover:border-primary/40">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <div
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          style={{ background: post.gradient }}
          aria-hidden="true"
        />
        <Badge variant="primary" className="absolute left-3 top-3">
          {post.tag}
        </Badge>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs text-muted" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
        </time>
        <h3 className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          Read more <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
