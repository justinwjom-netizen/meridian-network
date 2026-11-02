import { LogoMarquee } from "@/components/ui/logo-marquee";
import { pressLogos } from "@/data/content";

export function MediaMarquee() {
  return (
    <section className="section">
      <div className="container">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          In the media
        </p>
      </div>
      <LogoMarquee logos={pressLogos} />
    </section>
  );
}
