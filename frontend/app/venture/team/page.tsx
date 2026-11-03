import { COMPANY, TEAM } from '@/lib/company';
import { MINDSET } from '@/lib/venture/strategy';
import { Bullets, Card, Page, Section } from '@/components/venture/ui';

const initials = (n: string) => n.split(' ').map((p) => p[0]).join('');

export default function TeamPage() {
  return (
    <Page>
      <Section kicker={COMPANY.university} title="Founding team">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TEAM.map((t) => (
            <Card key={t.name}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{initials(t.name)}</div>
              <div className="mt-3 text-sm font-semibold text-ink">{t.name}</div>
              <div className="text-2xs uppercase tracking-wider text-accent">{t.role}</div>
              <p className="mt-2 text-xs">{t.focus}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={MINDSET.title}>
        <Card>
          <Bullets items={MINDSET.points} />
        </Card>
      </Section>

      <Section title="Advisors">
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="Faculty mentor: course coordinator">
            Prof Kulbir Lamba, {COMPANY.course}, {COMPANY.university}.
          </Card>
          <Card title="Open seats">
            We are looking for a SEBI-registered compliance adviser and an industry mentor from Indian fintech.
          </Card>
        </div>
      </Section>
    </Page>
  );
}
