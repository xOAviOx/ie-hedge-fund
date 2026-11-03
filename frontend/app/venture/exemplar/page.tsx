import { COMPANY, TEAM } from '@/lib/company';
import { COMPARISON, EXEMPLAR, EXEMPLAR_QUESTIONS, JOURNEY, LESSONS, TIMELINE } from '@/lib/venture/exemplar';
import ExemplarNotes from '@/components/venture/ExemplarNotes';
import InterviewLog from '@/components/venture/InterviewLog';
import { Card, Page, Paper, PrintButton, Section, Table } from '@/components/venture/ui';

export default function ExemplarPage() {
  return (
    <Page>
      <div data-report-hide className="space-y-10">
        <Section kicker="Sessions 10–11 · Exemplar startup journey" title="smallcase" intro={EXEMPLAR.summary}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((j, i) => (
              <Card key={j.point}>
                <div className="flex items-center gap-2">
                  <span className="tnum flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-2xs font-semibold text-accent">{i + 1}</span>
                  <span className="label text-accent">{j.point}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-ink">{j.title}</div>
                <p className="mt-1 text-xs">{j.body}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Timeline" intro="Founding, Series C and Series D dates are from public reporting; intermediate milestones are approximate and will be confirmed in our interactions.">
          <div className="panel overflow-x-auto p-6">
            <ol className="relative flex min-w-[720px] justify-between">
              <div className="absolute left-0 right-0 top-[7px] h-px bg-line" />
              {TIMELINE.map((t) => (
                <li key={t.year} className="relative w-32 text-center">
                  <span className="mx-auto block h-3.5 w-3.5 rounded-full border-2 border-accent bg-bg" />
                  <div className="tnum mt-2 text-xs font-semibold text-ink">{t.year}{t.approx ? ' (approx.)' : ''}</div>
                  <p className="mt-1 text-2xs text-muted">{t.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section title="Lessons for PortAI">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {LESSONS.map((l) => (
              <Card key={l.lesson} title={l.lesson}>
                {l.apply}
              </Card>
            ))}
          </div>
        </Section>

        <Section title="smallcase vs PortAI">
          <div className="panel">
            <Table head={['', 'smallcase', 'PortAI']} rows={COMPARISON.map((c) => [c.dimension, c.smallcase, c.portai])} />
          </div>
        </Section>

        <Section id="interactions" title="Interactions with smallcase" intro="The course requires at least two interactions with the exemplar startup, with notes.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InterviewLog
                kind="exemplar"
                min={2}
                scriptHref="#questions"
                emptyHint="No interactions yet. Reach out to smallcase team members on LinkedIn or at an event, ask the suggested questions, and log what you learn."
              />
            </div>
            <Card title="Suggested questions" className="h-fit">
              <ol id="questions" className="list-decimal space-y-1.5 pl-4 text-xs">
                {EXEMPLAR_QUESTIONS.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </Card>
          </div>
        </Section>
      </div>

      <section className="space-y-4">
        <div data-print-hide className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink">Report (2–3 pages)</h2>
            <p className="mt-1 text-sm text-muted">The written exemplar report. The button prints only this report.</p>
          </div>
          <PrintButton label="Print report" reportOnly />
        </div>
        <Paper>
          <header className="border-b border-zinc-300 pb-3">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">{COMPANY.course} · {COMPANY.university}</div>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">Exemplar startup journey: smallcase</h1>
            <p className="text-xs text-zinc-500">Team {COMPANY.name}: {TEAM.map((t) => t.name).join(', ')}</p>
          </header>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">Overview</h2>
          <p>{EXEMPLAR.summary}</p>
          {JOURNEY.map((j) => (
            <div key={j.point} className="avoid-break">
              <h2 className="mt-4 text-base font-semibold text-zinc-900">{j.point}: {j.title}</h2>
              <p>{j.body}</p>
            </div>
          ))}
          <h2 className="mt-4 text-base font-semibold text-zinc-900">Timeline</h2>
          <ul className="list-disc pl-5">
            {TIMELINE.map((t) => (
              <li key={t.year}><b>{t.year}{t.approx ? ' (approx.)' : ''}</b> — {t.event}</li>
            ))}
          </ul>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">Comparison with PortAI</h2>
          <table className="mt-1 w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-zinc-400 text-left"><th className="py-1 pr-2"></th><th className="py-1 pr-2">smallcase</th><th className="py-1">PortAI</th></tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.dimension} className="border-b border-zinc-200 align-top">
                  <td className="py-1 pr-2 font-medium">{c.dimension}</td><td className="py-1 pr-2">{c.smallcase}</td><td className="py-1">{c.portai}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">Interactions with the startup</h2>
          <ExemplarNotes />
          <h2 className="mt-4 text-base font-semibold text-zinc-900">Lessons for our idea</h2>
          <ol className="list-decimal pl-5">
            {LESSONS.map((l) => (
              <li key={l.lesson}><b>{l.lesson}</b> {l.apply}</li>
            ))}
          </ol>
          <p className="mt-4 text-[11px] text-zinc-500">Sources: company announcements and press coverage of smallcase funding rounds and FY25 results; IIMB/HBR case “smallcase: a disruptive business model in India”.</p>
        </Paper>
      </section>
    </Page>
  );
}
