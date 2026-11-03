import { PRICING } from '@/lib/company';
import { REVENUE_EXPLAINERS } from '@/lib/venture/model';
import { BusinessModelCanvas } from '@/components/venture/charts';
import { Card, Estimate, Page, Section } from '@/components/venture/ui';

export default function BusinessModelPage() {
  return (
    <Page>
      <Section kicker="Session 7 · SoccerGrlProbs case" title="Business model canvas">
        <BusinessModelCanvas />
      </Section>

      <Section title="Revenue streams">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {PRICING.map((p) => (
            <Card key={p.id} title={p.name} accent={p.highlighted}>
              <div className="tnum text-xl font-semibold text-ink">{p.price}</div>
              <div className="text-2xs">{p.cadence}{p.annualNote ? ` · ${p.annualNote}` : ''}</div>
              <p className="mt-2 text-xs">{REVENUE_EXPLAINERS.find((r) => r.id === p.id)?.role}</p>
            </Card>
          ))}
        </div>
        <p className="flex items-center gap-2 text-2xs text-muted">
          <Estimate /> Blended revenue per customer used in the financial model.
        </p>
      </Section>
    </Page>
  );
}
