import { DRUCKER_SOURCES, HC_PLACEMENTS, JUGAAD } from '@/lib/venture/strategy';
import { HendersonClarkGrid } from '@/components/venture/charts';
import { Bullets, Card, Page, Section, Table } from '@/components/venture/ui';

export default function InnovationPage() {
  const ours = HC_PLACEMENTS.find((p) => p.us);
  return (
    <Page>
      <Section
        kicker="Session 2 · Henderson-Clark model"
        title="PortAI is an architectural innovation"
        intro={ours?.why}
      >
        <HendersonClarkGrid />
        <div className="panel">
          <Table head={['Product', 'Type', 'Why']} rows={HC_PLACEMENTS.map((p) => [p.name, p.quadrant, p.why])} />
        </div>
      </Section>

      <Section title="Sources of innovation" intro="Peter Drucker’s seven sources of innovative opportunity and how each shows up in PortAI.">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DRUCKER_SOURCES.map((d) => (
            <Card key={d.source} title={d.source}>
              {d.how}
            </Card>
          ))}
        </div>
      </Section>

      <Section title={JUGAAD.title} intro="Jugaad innovation: doing more with less, a hallmark of Indian frugal engineering.">
        <Card>
          <Bullets items={JUGAAD.points} />
        </Card>
      </Section>
    </Page>
  );
}
