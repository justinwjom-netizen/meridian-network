import { Reveal } from "@/components/reveal";

export function PartnerStrip() {
  return (
    <section className="py-12">
      <div className="container">
        <Reveal className="glass flex flex-col items-center justify-center gap-3 rounded-lg py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Official partner</p>
          <p className="font-display text-3xl font-bold text-muted/80">Partner 1</p>
        </Reveal>
      </div>
    </section>
  );
}
