import { PROBLEM_STATS, PROBLEM_STORY } from '@/lib/company';
import { MINDSET, PROBLEM_STATEMENT, WHO_SUFFERS, WHY_NOW } from '@/lib/venture/strategy';
import { Bullets, Card, Page, Section, Source } from '@/components/venture/ui';

export default function ProblemPage() {
  return (
    <Page>
      <Section kicker="Session 3" title={PROBLEM_STORY.title}>
        <div className="panel max-w-3xl space-y-3 p-6 text-[15px] leading-relaxed text-ink/90">
          {PROBLEM_STORY.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p className="text-2xs text-muted">Rohan is a composite persona built from the team’s own experience, not a real individual.</p>
        </div>
      </Section>

      <Section title="The numbers">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_STATS.map((s) => (
            <Card key={s.label}>
              <div className="tnum text-2xl font-semibold text-ink">{s.value}</div>
              <p className="mt-1 text-xs">{s.label}</p>
              <div className="mt-2">
                <Source source={s.source} url={s.url} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Problem statement">
        <Card accent>
          <p className="text-[15px] text-ink">{PROBLEM_STATEMENT}</p>
        </Card>
      </Section>

      <Section title="Who suffers">
        <div className="grid gap-3 md:grid-cols-2">
          {WHO_SUFFERS.map((w) => (
            <Card key={w.who} title={w.who}>
              {w.pain}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Why now">
        <div className="grid gap-3 md:grid-cols-2">
          {WHY_NOW.map((w) => (
            <Card key={w.title} title={w.title}>
              <p>{w.body}</p>
              {w.source && (
                <div className="mt-2">
                  <Source source={w.source} url={w.url} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </Section>

      <Section id="mindset" kicker="Session 1 · Entrepreneurial mindset" title={MINDSET.title}>
        <Card>
          <Bullets items={MINDSET.points} />
        </Card>
      </Section>
    </Page>
  );
}
