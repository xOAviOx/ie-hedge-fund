import { ASK, FUNDING_SOURCES, REGULATORY, ROADMAP } from '@/lib/venture/model';
import { inr } from '@/lib/venture/financials';
import { Card, Estimate, Page, Section, Source, Table } from '@/components/venture/ui';

export default function FundingPage() {
  return (
    <Page>
      <Section kicker="Session 12" title="Sources of money" intro="Ordered from earliest and least dilutive to later and more dilutive. We climb the ladder one step at a time.">
        <div className="space-y-2">
          {FUNDING_SOURCES.map((f, i) => (
            <div key={f.name} className="panel grid gap-3 p-4 md:grid-cols-[40px_1.2fr_1fr_1fr]">
              <div className="tnum text-lg font-semibold text-accent">{i + 1}</div>
              <div>
                <div className="text-sm font-semibold text-ink">{f.name}</div>
                <p className="text-xs text-muted">{f.detail}</p>
              </div>
              <p className="text-xs text-muted"><span className="label block">Pros</span>{f.pros}</p>
              <p className="text-xs text-muted"><span className="label block">Cons</span>{f.cons}</p>
            </div>
          ))}
        </div>
        <Source source="Seed Fund Scheme limits: Startup India SISFS FAQ" url="https://seedfund.startupindia.gov.in/faq" />
      </Section>

      <Section title={`Our ask: ${ASK.label}`} intro={`${inr(ASK.amount)} for ${ASK.runwayMonths} months of runway to reach Phase 2 (SEBI RA registration) and the Year-2 user target.`}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="label">Use of funds</span>
              <Estimate />
            </div>
            {ASK.useOfFunds.map((u) => (
              <div key={u.item}>
                <div className="flex justify-between text-xs">
                  <span className="text-ink">{u.item}</span>
                  <span className="tnum text-muted">{u.pct}% · {inr((ASK.amount * u.pct) / 100)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {ROADMAP.map((r) => (
              <Card key={r.phase} title={`${r.phase} — ${r.title}`}>
                <div className="text-2xs uppercase tracking-wider text-accent">{r.when}</div>
                <p className="mt-1">{r.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Regulatory notes">
        <div className="panel">
          <Table head={['Rule', 'What it means for us']} rows={REGULATORY.map((r) => [r.rule, r.impact])} />
        </div>
        <p className="text-2xs text-muted">Not legal advice. We will confirm each step with a SEBI-registered compliance professional before Phase 2.</p>
      </Section>
    </Page>
  );
}
