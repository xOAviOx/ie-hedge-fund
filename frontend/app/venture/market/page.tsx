import { COMPETITORS, OPPORTUNITY_DRIVERS, PESTEL, PORTER } from '@/lib/venture/strategy';
import { PositioningMap } from '@/components/venture/charts';
import { Card, Page, Rating, Section, Table } from '@/components/venture/ui';

export default function MarketPage() {
  return (
    <Page>
      <Section kicker="Session 4" title="Opportunity and drivers">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {OPPORTUNITY_DRIVERS.map((d) => (
            <Card key={d.title} title={d.title}>
              {d.body}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="PESTEL — India">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PESTEL.map((p) => (
            <Card key={p.factor} title={p.factor}>
              <p>{p.body}</p>
              <p className="mt-2 text-2xs">Source: {p.source}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Porter’s five forces" intro="Overall: an attractive but crowded market. Defensibility has to come from trust, regulation and data, not features.">
        <div className="grid gap-3 md:grid-cols-5">
          {PORTER.map((f) => (
            <Card key={f.force} title={f.force}>
              <Rating value={f.rating} />
              <p className="mt-2 text-xs">{f.why}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Competitive positioning"
        intro="Placement on the map is the team’s qualitative judgement. Nobody combines high automation with full explainability — that is where PortAI sits."
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="panel p-3 lg:col-span-3">
            <PositioningMap />
          </div>
          <div className="space-y-2 text-sm text-muted lg:col-span-2">
            <Card title="Reading the map">
              <p>
                <span className="text-ink">Right:</span> users can see why a decision was made.{' '}
                <span className="text-ink">Up:</span> the system does the research and decides for you.
              </p>
              <p className="mt-2">
                Tip groups are neither. Brokers automate execution, not thinking. Quant products automate but stay opaque; screeners are
                transparent but leave all the work to you.
              </p>
            </Card>
          </div>
        </div>
        <div className="panel">
          <Table
            head={['Competitor', 'What it does', 'Pricing', 'Key fact']}
            rows={COMPETITORS.map((c) => [
              <span key="n" className={c.us ? 'font-semibold text-accent' : ''}>
                {c.name}
              </span>,
              c.what,
              c.pricing,
              c.fact,
            ])}
          />
        </div>
      </Section>
    </Page>
  );
}
