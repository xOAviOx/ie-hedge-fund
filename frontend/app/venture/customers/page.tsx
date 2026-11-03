import { HYPOTHESES, INTERVIEW_SCRIPT, MOM_TEST_RULES, PERSONAS, SEGMENTS, VPCS } from '@/lib/venture/customers';
import InterviewLog from '@/components/venture/InterviewLog';
import { ValuePropositionCanvas } from '@/components/venture/charts';
import { Bullets, Card, Page, Section, Table } from '@/components/venture/ui';

const STATUS_TONE = { Untested: 'text-muted', Validated: 'text-up', Invalidated: 'text-down' } as const;

export default function CustomersPage() {
  return (
    <Page>
      <Section kicker="Session 6" title="Customer segments">
        <div className="panel">
          <Table head={['Segment', 'Who', 'Scale', 'Core need', 'How they pay']} rows={SEGMENTS.map((s) => [s.name, s.age, s.size, s.need, s.pays])} />
        </div>
      </Section>

      <Section title="Personas" intro="Composite personas based on the team’s own experience. They will be replaced with real interview evidence.">
        <div className="grid gap-4 md:grid-cols-2">
          {PERSONAS.map((p) => (
            <Card key={p.name}>
              <div className="text-base font-semibold text-ink">{p.name}</div>
              <div className="text-2xs uppercase tracking-wider text-accent">{p.tagline}</div>
              <p className="mt-2">{p.bio}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="label mb-1">Goals</div>
                  <Bullets items={p.goals} className="text-xs" />
                </div>
                <div>
                  <div className="label mb-1">Frustrations</div>
                  <Bullets items={p.frustrations} className="text-xs" />
                </div>
              </div>
              <p className="mt-3 text-xs italic text-ink/80">{p.quote}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="hypotheses" kicker="Session 3 · RideOn case" title="Discovery hypotheses" intro="Following the RideOn case: write each assumption as a testable hypothesis, decide how to test it cheaply, and record the result.">
        <div className="panel">
          <Table
            head={['Area', 'Hypothesis', 'How we test it', 'Status']}
            rows={HYPOTHESES.map((h) => [h.area, h.hypothesis, h.test, <span key="s" className={`text-xs font-medium ${STATUS_TONE[h.status]}`}>{h.status}</span>])}
          />
        </div>
      </Section>

      <Section id="script" title="Interview script" intro="Mom-Test style: ask about past behaviour, not about our idea.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <ol className="list-decimal space-y-1.5 pl-5">
              {INTERVIEW_SCRIPT.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </Card>
          <Card title="Rules">
            <Bullets items={MOM_TEST_RULES} />
          </Card>
        </div>
      </Section>

      <Section title="Value proposition canvas">
        <div className="space-y-6">
          {VPCS.map((v) => (
            <div key={v.segment} className="panel p-4">
              <ValuePropositionCanvas vpc={v} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="interviews" kicker="Session 4" title="Customer interview log">
        <InterviewLog
          kind="customer"
          min={3}
          scriptHref="#script"
          emptyHint="The course asks every team to talk to at least 2–3 potential customers. Use the script above, then log each conversation here with pains, gains and exact quotes."
        />
      </Section>
    </Page>
  );
}
