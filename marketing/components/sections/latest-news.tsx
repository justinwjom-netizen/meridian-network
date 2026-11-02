import { BlogCard } from "@/components/ui/blog-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { posts } from "@/data/posts";

export function LatestNews() {
  const latest = posts.slice(0, 3);
  return (
    <section className="section">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader align="left" eyebrow="Last news" title="Fresh from the blog" className="mx-0" />
          <Button href="/blog" variant="ghost" withArrow className="shrink-0">
            View all
          </Button>
        </div>

        {/* grid on desktop, horizontal scroll on mobile */}
        <div className="mt-10 flex gap-6 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {latest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08} className="min-w-[82%] sm:min-w-[60%] md:min-w-0">
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
