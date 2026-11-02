import Link from "next/link";

export type MarqueeLogo = { name: string; href?: string };

/** Infinite horizontal logo strip. Track is duplicated for a seamless loop;
 *  pauses on hover and goes grayscale→color on hover of each logo. */
export function LogoMarquee({ logos }: { logos: MarqueeLogo[] }) {
  const doubled = [...logos, ...logos];
  return (
    <div className="marquee relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />
      <div className="marquee-track gap-10 py-2">
        {doubled.map((logo, i) => {
          const content = (
            <span className="text-lg font-semibold tracking-tight text-muted opacity-60 grayscale transition-all duration-300 hover:text-text hover:opacity-100 hover:grayscale-0">
              {logo.name}
            </span>
          );
          return (
            <span key={logo.name + i} className="flex shrink-0 items-center" aria-hidden={i >= logos.length}>
              {logo.href ? (
                <Link href={logo.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </Link>
              ) : (
                content
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
