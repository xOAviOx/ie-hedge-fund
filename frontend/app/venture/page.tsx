'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleDashed } from 'lucide-react';

import { COMPANY, PRICING, PROBLEM_STATS } from '@/lib/company';
import { COURSE_MAP, EVALUATION, type CourseStatusRule } from '@/lib/venture/course';
import { SOLUTION } from '@/lib/venture/product';
import { PROBLEM_STATEMENT } from '@/lib/venture/strategy';
import { ASK } from '@/lib/venture/model';
import { DEFAULT_PROJECTION, inr, count } from '@/lib/venture/financials';
import type { VentureMetrics } from '@/lib/ventureApi';
import LiveTraction from '@/components/venture/LiveTraction';
import { useVentureMetrics } from '@/components/venture/hooks';
import { Card, Estimate, Page, Section, Table } from '@/components/venture/ui';

function status(rule: CourseStatusRule, m: VentureMetrics | undefined): { done: boolean; text: string } {
  if (rule.kind === 'done') return { done: true, text: 'Done' };
  if (rule.kind === 'team') return { done: false, text: `Needs team input — ${rule.reason}` };
  const n = m ? (rule.interviewKind === 'customer' ? m.interviews_customer : m.interviews_exemplar) : 0;
  return n >= rule.min
    ? { done: true, text: `Done (${n} logged)` }
    : { done: false, text: `Needs team input — ${n}/${rule.min} logged` };
}

export default function VentureOverview() {
  const { data: m } = useVentureMetrics();
  const y3 = DEFAULT_PROJECTION[2];
  const y5 = DEFAULT_PROJECTION[4];
  return (
    <Page>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="label text-accent">{COMPANY.name} · {COMPANY.city}</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{COMPANY.tagline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{COMPANY.oneLiner}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="label">Problem</div>
              <p className="mt-1 text-sm text-muted">{PROBLEM_STATEMENT}</p>
            </div>
            <div>
              <div className="label">Solution</div>
              <p className="mt-1 text-sm text-muted">{SOLUTION.differentiator}</p>
            </div>
          </div>
        </div>
        <div className="panel space-y-4 p-6">
          <div>
            <div className="label">Headline stat</div>
            <div className="tnum mt-1 text-3xl font-semibold text-ink">{PROBLEM_STATS[0].value}</div>
            <p className="text-xs text-muted">{PROBLEM_STATS[0].label} ({PROBLEM_STATS[0].source})</p>
          </div>
          <div>
            <div className="label">Business model</div>
            <p className="mt-1 text-xs text-muted">{PRICING.map((p) => `${p.name} ${p.price}`).join(' · ')}</p>
          </div>
          <div>
            <div className="label flex items-center gap-2">Plan <Estimate /></div>
            <p className="mt-1 text-xs text-muted">
              Year 3: {count(y3.paidUsers)} paid users, {inr(y3.revenue)} revenue. Year 5: {inr(y5.revenue)}.
            </p>
          </div>
          <div>
            <div className="label">Ask</div>
            <p className="mt-1 text-xs text-muted">{ASK.label} for {ASK.runwayMonths} months</p>
          </div>
        </div>
      </section>

      <LiveTraction />

      <Section
        kicker="ENT 3005"
        title="Course map"
        intro="Every session of the course, the deliverable we built for it, and what still needs the team. Interview rows update live from the discovery log."
      >
        <div className="panel">
          <Table
            head={['Session', 'Topic', 'Our deliverable', 'Status']}
            rows={COURSE_MAP.map((r) => {
              const s = status(r.status, m);
              return [
                <span key="s" className="tnum">{r.session}</span>,
                r.topic,
                <Link key="l" href={r.href} className="inline-flex items-center gap-1 text-ink hover:text-accent">
                  {r.deliverable} <ArrowRight size={12} />
                </Link>,
                <span key="st" className={`inline-flex items-center gap-1.5 text-xs ${s.done ? 'text-ink' : 'text-amber-300'}`}>
                  {s.done ? <CheckCircle2 size={13} className="text-accent" /> : <CircleDashed size={13} />}
                  {s.text}
                </span>,
              ];
            })}
          />
        </div>
      </Section>

      <Section title="How we are evaluated">
        <div className="grid gap-3 sm:grid-cols-5">
          {EVALUATION.map((e) => (
            <Card key={e.component}>
              <div className="tnum text-xl font-semibold text-ink">{e.weight}%</div>
              <div className="text-xs">{e.component}</div>
            </Card>
          ))}
        </div>
      </Section>
    </Page>
  );
}
