'use client';

import React from 'react';

import { COMPANY, PRICING, PROBLEM_STATS, PROBLEM_STORY, TEAM } from '@/lib/company';
import { FEATURES, HOW_IT_WORKS, SOLUTION } from '@/lib/venture/product';
import {
  COMPETITORS,
  DRUCKER_SOURCES,
  HC_PLACEMENTS,
  JUGAAD,
  OPPORTUNITY_DRIVERS,
  PESTEL,
  PORTER,
  PROBLEM_STATEMENT,
  WHO_SUFFERS,
  WHY_NOW,
} from '@/lib/venture/strategy';
import { HYPOTHESES, PERSONAS, SEGMENTS, VPCS } from '@/lib/venture/customers';
import { ASK, GO_TO_MARKET, OPERATIONS, REGULATORY, REVENUE_EXPLAINERS, RISKS, ROADMAP } from '@/lib/venture/model';
import { EXEMPLAR, LESSONS } from '@/lib/venture/exemplar';
import {
  DEFAULT_ASSUMPTIONS,
  DEFAULT_PROJECTION,
  breakEven,
  count,
  inr,
  unitEconomics,
} from '@/lib/venture/financials';
import { DEFAULT_SIZING, sizing } from '@/lib/venture/sizing';
import { money, pct } from '@/lib/format';
import { BusinessModelCanvas, ValuePropositionCanvas } from '@/components/venture/charts';
import { useLiveFacts } from '@/components/venture/hooks';
import { Paper, PrintButton } from '@/components/venture/ui';

const CHAPTERS = [
  'Executive summary',
  'Problem',
  'Solution and product',
  'Innovation',
  'Market and competition',
  'Customers and value proposition',
  'Business model',
  'Go-to-market',
  'Operations and technology',
  'Regulatory',
  'Financial plan',
  'Funding ask',
  'Risks and mitigations',
  'Roadmap',
  'Team',
  'Appendix: exemplar startup (smallcase)',
];

// Short chapters flow on after the previous one instead of starting a new page.
const FLOW = new Set([9, 10, 14, 15]);

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <section className={FLOW.has(n) ? 'pt-8' : 'print-break pt-8'}>
      <h2 className="mb-3 border-b border-zinc-300 pb-1 text-lg font-bold text-zinc-900">
        {n}. {CHAPTERS[n - 1]}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mt-3 font-semibold text-zinc-900">{children}</h3>;
const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-0.5 pl-5">
    {items.map((i, k) => (
      <li key={k}>{i}</li>
    ))}
  </ul>
);

function DocTable({ head, rows, right }: { head: string[]; rows: React.ReactNode[][]; right?: boolean }) {
  return (
    <table className="avoid-break w-full border-collapse text-[11.5px]">
      <thead>
        <tr className="border-b-2 border-zinc-400">
          {head.map((h, i) => (
            <th key={i} className={`px-1.5 py-1 font-semibold ${right && i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-zinc-200 align-top">
            {r.map((c, j) => (
              <td key={j} className={`px-1.5 py-1 ${right && j > 0 ? 'text-right tabular-nums' : ''}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BusinessPlanPage() {
  const live = useLiveFacts();
  const p = DEFAULT_PROJECTION;
  const a = DEFAULT_ASSUMPTIONS;
  const sz = sizing(DEFAULT_SIZING);
  const ue = unitEconomics(a);
  const be = breakEven(a, 2);
  const firstProfit = p.find((r) => r.ebitda > 0);
  const trough = Math.min(0, ...p.map((r) => r.cumulativeCash));
  const pro = PRICING.find((t) => t.id === 'pro');

  return (
    <div className="px-6 py-6">
      <div data-print-hide className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between">
        <p className="text-xs text-muted">The written business plan, compiled from the Venture section. All forward-looking figures are estimates.</p>
        <PrintButton label="Print / Save as PDF" />
      </div>
      <Paper>
        {/* Cover */}
        <section className="flex min-h-[250mm] flex-col justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Business plan · {new Date().getFullYear()}</div>
            <h1 className="mt-24 text-5xl font-bold tracking-tight text-zinc-900">{COMPANY.name}</h1>
            <p className="mt-3 text-xl text-blue-700">{COMPANY.tagline}</p>
            <p className="mt-6 max-w-[140mm] text-sm text-zinc-600">{COMPANY.oneLiner}</p>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500">Team</div>
              {TEAM.map((t) => (
                <div key={t.name}>
                  <b>{t.name}</b> — {t.role}
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-500">Submitted for</div>
              <div>{COMPANY.course}</div>
              <div>{COMPANY.university}, {COMPANY.city}</div>
              <div>Course coordinator: Prof Kulbir Lamba</div>
            </div>
          </div>
        </section>

        {/* Contents */}
        <section className="print-break pt-8">
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Contents</h2>
          <ol className="space-y-1">
            {CHAPTERS.map((c, i) => (
              <li key={c} className="flex gap-3 border-b border-dotted border-zinc-300 pb-1">
                <span className="w-6 tabular-nums text-zinc-500">{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </section>

        <Chapter n={1}>
          <p>{COMPANY.oneLiner}</p>
          <UL
            items={[
              <>
                <b>Problem.</b> {PROBLEM_STATS[0].value} {PROBLEM_STATS[0].label} ({PROBLEM_STATS[0].source}). Advice is opaque, unregulated or priced for the wealthy.
              </>,
              <>
                <b>Solution.</b> {SOLUTION.differentiator}
              </>,
              <>
                <b>Market.</b> TAM {inr(sz.tam, 0)}, SAM {inr(sz.sam, 0)}, SOM {inr(sz.som)} by Year 3 (estimates).
              </>,
              <>
                <b>Model.</b> Freemium: Pro {pro?.price}/month ({pro?.annualNote}), Campus contracts and a B2B API.
              </>,
              <>
                <b>Financials (estimate).</b> Revenue {inr(p[0].revenue)} in Year 1 to {inr(p[4].revenue)} in Year 5; first EBITDA-positive year: {firstProfit ? `Year ${firstProfit.year}` : 'beyond Year 5'}.
              </>,
              <>
                <b>Ask.</b> {ASK.label} for {ASK.runwayMonths} months to reach SEBI Research Analyst registration.
              </>,
            ]}
          />
        </Chapter>

        <Chapter n={2}>
          <p>{PROBLEM_STATEMENT}</p>
          <H3>{PROBLEM_STORY.title}</H3>
          {PROBLEM_STORY.paragraphs.map((t) => (
            <p key={t.slice(0, 20)}>{t}</p>
          ))}
          <p className="text-[11px] text-zinc-500">Rohan is a composite persona.</p>
          <H3>Evidence</H3>
          <UL items={PROBLEM_STATS.map((s) => <>{s.value} {s.label} — {s.source}</>)} />
          <H3>Who suffers</H3>
          <UL items={WHO_SUFFERS.map((w) => <><b>{w.who}:</b> {w.pain}</>)} />
          <H3>Why now</H3>
          <UL items={WHY_NOW.map((w) => <><b>{w.title}.</b> {w.body}{w.source ? ` (${w.source})` : ''}</>)} />
        </Chapter>

        <Chapter n={3}>
          <p>{SOLUTION.statement}</p>
          <H3>How it works</H3>
          <ol className="list-decimal pl-5">
            {HOW_IT_WORKS.map((s) => (
              <li key={s.step}><b>{s.step}:</b> {s.detail}</li>
            ))}
          </ol>
          <H3>Features</H3>
          <UL items={FEATURES.map((f) => <><b>{f.name}:</b> {f.detail}</>)} />
          <H3>The product today (live)</H3>
          {live.live ? (
            <p>
              The paper fund has completed {live.runs ?? '—'} runs and placed {live.orders ?? '—'} paper orders across a universe of {live.universe ?? '—'} stocks.
              NAV is {money(live.nav, 'INR', 0)} ({pct(live.navReturnPct)} since start), with {live.agents} agents including {live.personas} investor personas.
              {live.waitlist != null && ` ${live.waitlist} people are on the Pro waitlist.`}
            </p>
          ) : (
            <p>A working product with 18 agents (6 analyst models, 12 personas) runs on real end-of-day market data. Live figures appear here when the API is running.</p>
          )}
        </Chapter>

        <Chapter n={4}>
          <p>Using the Henderson-Clark model, PortAI is an <b>architectural innovation</b>: {HC_PLACEMENTS.find((h) => h.us)?.why}</p>
          <DocTable head={['Product', 'Innovation type', 'Why']} rows={HC_PLACEMENTS.filter((h) => !h.us).map((h) => [h.name, h.quadrant, h.why])} />
          <H3>Sources of innovation (Drucker)</H3>
          <UL items={DRUCKER_SOURCES.map((d) => <><b>{d.source}:</b> {d.how}</>)} />
          <H3>{JUGAAD.title}</H3>
          <UL items={JUGAAD.points} />
        </Chapter>

        <Chapter n={5}>
          <H3>Opportunity drivers</H3>
          <UL items={OPPORTUNITY_DRIVERS.map((d) => <><b>{d.title}:</b> {d.body}</>)} />
          <H3>Market size (estimates)</H3>
          <DocTable
            head={['', 'Users', 'Value at ₹2,499/yr']}
            right
            rows={[
              ['TAM — unique registered investors (NSE, Jan 2025)', count(DEFAULT_SIZING.tamUsers), inr(sz.tam)],
              ['SAM — digitally active DIY investors 18–40 (team estimate)', count(DEFAULT_SIZING.samUsers), inr(sz.sam)],
              ['SOM — Year-3 paid users (financial model)', count(DEFAULT_SIZING.somUsers), inr(sz.som)],
            ]}
          />
          <H3>PESTEL</H3>
          <UL items={PESTEL.map((x) => <><b>{x.factor}:</b> {x.body}</>)} />
          <H3>Porter’s five forces</H3>
          <DocTable head={['Force', 'Rating', 'Reasoning']} rows={PORTER.map((f) => [f.force, f.rating, f.why])} />
          <H3>Competitors</H3>
          <DocTable head={['Competitor', 'Offer', 'Pricing', 'Fact']} rows={COMPETITORS.filter((c) => !c.us).map((c) => [c.name, c.what, c.pricing, c.fact])} />
        </Chapter>

        <Chapter n={6}>
          <DocTable head={['Segment', 'Who', 'Need', 'Pays']} rows={SEGMENTS.map((s) => [s.name, s.age, s.need, s.pays])} />
          <H3>Personas</H3>
          <UL items={PERSONAS.map((x) => <><b>{x.name}, {x.tagline}.</b> {x.bio}</>)} />
          <H3>Discovery hypotheses</H3>
          <DocTable head={['Area', 'Hypothesis', 'Test', 'Status']} rows={HYPOTHESES.map((h) => [h.area, h.hypothesis, h.test, h.status])} />
          <H3>Value proposition canvas — {VPCS[0].segment}</H3>
          <div className="avoid-break"><ValuePropositionCanvas vpc={VPCS[0]} light /></div>
        </Chapter>

        <Chapter n={7}>
          <div className="avoid-break"><BusinessModelCanvas light /></div>
          <H3>Revenue streams</H3>
          <UL items={REVENUE_EXPLAINERS.map((r) => <><b>{r.tier}:</b> {r.role}</>)} />
        </Chapter>

        <Chapter n={8}>
          <ol className="list-decimal pl-5">
            {GO_TO_MARKET.map((g) => (
              <li key={g.phase}><b>{g.phase}:</b> {g.detail}</li>
            ))}
          </ol>
        </Chapter>

        <Chapter n={9}>
          <UL items={OPERATIONS} />
        </Chapter>

        <Chapter n={10}>
          <DocTable head={['Rule', 'Impact on PortAI']} rows={REGULATORY.map((r) => [r.rule, r.impact])} />
        </Chapter>

        <Chapter n={11}>
          <p className="text-[11px] text-zinc-500">All figures are team estimates. Key assumptions: Pro ARPU {inr(a.proArpu)}/yr blended, campus {inr(a.collegeFee)}/college/yr, API {inr(a.b2bFee)}/client/yr, CAC {inr(a.cac)}, LLM + infra {inr(a.costPerActiveUser)}/active user/yr, payment fees {(a.paymentFeePct * 100).toFixed(0)}%, annual churn {(a.annualChurn * 100).toFixed(0)}%.</p>
          <DocTable
            right
            head={['', ...p.map((r) => `Year ${r.year}`)]}
            rows={[
              ['Registered users', ...p.map((r) => count(r.users))],
              ['Paid users', ...p.map((r) => count(r.paidUsers))],
              ['Pro revenue', ...p.map((r) => inr(r.revenuePro))],
              ['Campus revenue', ...p.map((r) => inr(r.revenueCampus))],
              ['API revenue', ...p.map((r) => inr(r.revenueB2B))],
              [<b key="t">Total revenue</b>, ...p.map((r) => <b key={r.year}>{inr(r.revenue)}</b>)],
              ['Team', ...p.map((r) => inr(r.teamCost))],
              ['Variable (LLM, infra, fees, CAC)', ...p.map((r) => inr(r.variableCost + r.paymentFees + r.acquisitionCost))],
              ['Fixed, compliance, data', ...p.map((r) => inr(r.fixedCost + r.complianceCost + r.dataLicensing))],
              [<b key="c">Total cost</b>, ...p.map((r) => <b key={r.year}>{inr(r.totalCost)}</b>)],
              [<b key="e">EBITDA</b>, ...p.map((r) => <b key={r.year}>{inr(r.ebitda)}</b>)],
              ['Cumulative cash (pre-funding)', ...p.map((r) => inr(r.cumulativeCash))],
            ]}
          />
          <H3>Break-even and unit economics</H3>
          <UL
            items={[
              `On the Year-3 cost base (${inr(be.monthlyFixed)} per month fixed), Pro alone breaks even at about ${be.paidUsersNeeded?.toLocaleString('en-IN') ?? '—'} paid users, or ${be.totalUsersNeeded != null ? count(be.totalUsersNeeded) : '—'} registered users at ${(be.conversion * 100).toFixed(0)}% conversion. Campus and API revenue bring this forward.`,
              `First EBITDA-positive year: ${firstProfit ? `Year ${firstProfit.year}` : 'beyond Year 5'}; deepest cumulative cash position ${inr(trough)}, covered by the pre-seed round.`,
              `Pro LTV ${inr(ue.ltv)} vs CAC ${inr(ue.cac)} (LTV/CAC ${ue.ltvToCac?.toFixed(1)}×); CAC payback ${ue.paybackMonths?.toFixed(1)} months.`,
            ]}
          />
        </Chapter>

        <Chapter n={12}>
          <p>We are raising <b>{ASK.label}</b> ({inr(ASK.amount)}) for {ASK.runwayMonths} months of runway.</p>
          <DocTable right head={['Use of funds', 'Share', 'Amount']} rows={ASK.useOfFunds.map((u) => [u.item, `${u.pct}%`, inr((ASK.amount * u.pct) / 100)])} />
          <p>Before equity, we will apply for the Startup India Seed Fund Scheme (up to ₹20 lakh grant for proof of concept) through a university-linked incubator.</p>
        </Chapter>

        <Chapter n={13}>
          <DocTable head={['Risk', 'Mitigation']} rows={RISKS.map((r) => [r.risk, r.mitigation])} />
        </Chapter>

        <Chapter n={14}>
          <DocTable head={['Phase', 'When', 'What']} rows={ROADMAP.map((r) => [`${r.phase}: ${r.title}`, r.when, r.detail])} />
        </Chapter>

        <Chapter n={15}>
          <DocTable head={['Name', 'Role', 'Focus']} rows={TEAM.map((t) => [t.name, t.role, t.focus])} />
          <p>Faculty mentor: Prof Kulbir Lamba, course coordinator, {COMPANY.course}.</p>
        </Chapter>

        <Chapter n={16}>
          <p>{EXEMPLAR.summary}</p>
          <H3>Lessons we applied</H3>
          <UL items={LESSONS.map((l) => <><b>{l.lesson}</b> {l.apply}</>)} />
        </Chapter>
      </Paper>
    </div>
  );
}
