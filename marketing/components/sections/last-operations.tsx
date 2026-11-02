import { ResultTable } from "@/components/ui/result-table";
import { SectionHeader } from "@/components/ui/section-header";
import { RiskNote } from "@/components/ui/risk-note";
import { Reveal } from "@/components/reveal";

export function LastOperations() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Last operations"
          title="A live look at the engine"
          subtitle="A continuously updating stream of simulated trades. This is demo data for illustration only."
        />
        <Reveal className="mx-auto mt-10 max-w-2xl">
          <ResultTable />
          <RiskNote className="mt-4 justify-center text-center" />
        </Reveal>
      </div>
    </section>
  );
}
