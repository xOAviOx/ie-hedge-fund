'use client';

import { useMemo, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

import {
  ASSUMPTION_NOTES,
  DEFAULT_ASSUMPTIONS,
  YEARS,
  breakEven,
  count,
  inr,
  project,
  toCsv,
  unitEconomics,
  type Assumptions,
  type YearRow,
} from '@/lib/venture/financials';
import { BreakEvenChart, RevenueCostBars } from '@/components/venture/charts';
import { Card, Estimate, Page, Section } from '@/components/venture/ui';

type ArrayKey = { [K in keyof Assumptions]: Assumptions[K] extends number[] ? K : never }[keyof Assumptions];
type ScalarKey = Exclude<keyof Assumptions, ArrayKey>;

const ARRAY_FIELDS: { key: ArrayKey; label: string; pct?: boolean }[] = [
  { key: 'users', label: 'Registered users' },
  { key: 'conversion', label: 'Free → paid conversion %', pct: true },
  { key: 'colleges', label: 'Campus colleges' },
  { key: 'b2bClients', label: 'API / B2B clients' },
  { key: 'teamCost', label: 'Team cost ₹' },
  { key: 'fixedCost', label: 'Fixed + marketing ₹' },
  { key: 'complianceCost', label: 'Compliance ₹' },
  { key: 'dataLicensing', label: 'Data licensing ₹' },
];

const SCALAR_FIELDS: { key: ScalarKey; label: string; pct?: boolean }[] = [
  { key: 'proArpu', label: 'Pro ARPU ₹/yr' },
  { key: 'collegeFee', label: 'Campus fee ₹/college/yr' },
  { key: 'b2bFee', label: 'API fee ₹/client/yr' },
  { key: 'costPerActiveUser', label: 'LLM + infra ₹/active user/yr' },
  { key: 'activeShare', label: 'Monthly active share %', pct: true },
  { key: 'cac', label: 'CAC ₹/paid user' },
  { key: 'annualChurn', label: 'Annual paid churn %', pct: true },
  { key: 'paymentFeePct', label: 'Payment fees %', pct: true },
];

const ROWS: { key: keyof YearRow; label: string; kind?: 'users' | 'total' | 'result' }[] = [
  { key: 'users', label: 'Registered users', kind: 'users' },
  { key: 'paidUsers', label: 'Paid users', kind: 'users' },
  { key: 'revenuePro', label: 'Pro subscriptions' },
  { key: 'revenueCampus', label: 'Campus' },
  { key: 'revenueB2B', label: 'API / B2B' },
  { key: 'revenue', label: 'Total revenue', kind: 'total' },
  { key: 'variableCost', label: 'LLM + infra' },
  { key: 'paymentFees', label: 'Payment fees' },
  { key: 'acquisitionCost', label: 'Acquisition (CAC × new paid)' },
  { key: 'teamCost', label: 'Team' },
  { key: 'fixedCost', label: 'Fixed + marketing' },
  { key: 'complianceCost', label: 'Compliance (NISM, SEBI RA)' },
  { key: 'dataLicensing', label: 'Data licensing' },
  { key: 'totalCost', label: 'Total cost', kind: 'total' },
  { key: 'ebitda', label: 'EBITDA', kind: 'result' },
  { key: 'cumulativeCash', label: 'Cumulative cash (before funding)', kind: 'result' },
];

const cellInput =
  'tnum w-full min-w-[84px] rounded border border-line bg-bg px-1.5 py-1 text-right text-xs text-ink focus:border-accent/60';

const toView = (v: number, pct?: boolean) => (pct ? +(v * 100).toFixed(2) : v);
const fromView = (v: string, pct?: boolean) => (Number(v) || 0) / (pct ? 100 : 1);

function downloadCsv(rows: YearRow[]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portai-5-year-projection.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function FinancialsPage() {
  const [a, setA] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [beYear, setBeYear] = useState(1);
  const rows = useMemo(() => project(a), [a]);
  const be = breakEven(a, beYear);
  const ue = unitEconomics(a);
  const firstProfitable = rows.find((r) => r.ebitda > 0);
  const trough = Math.min(0, ...rows.map((r) => r.cumulativeCash));

  const setArr = (k: ArrayKey, i: number, v: number) =>
    setA((p) => ({ ...p, [k]: p[k].map((x, j) => (j === i ? v : x)) }));
  const setScalar = (k: ScalarKey, v: number) => setA((p) => ({ ...p, [k]: v }));

  const revenuePerPaid = (a.proArpu * (1 - a.paymentFeePct)) / 12;

  return (
    <Page>
      <Section
        kicker="Session 9 · Business plan spreadsheet"
        title="Five-year financial model"
        intro="Every input is editable and every default is a team estimate. The projection, break-even and unit economics recalculate instantly; the pitch deck, poster and written plan use the defaults."
      >
        <div className="flex flex-wrap gap-2">
          <Estimate>All figures are estimates</Estimate>
          <button onClick={() => setA(DEFAULT_ASSUMPTIONS)} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
            <RotateCcw size={12} /> Reset assumptions
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="panel overflow-x-auto p-4 lg:col-span-2">
            <div className="label mb-2">Assumptions by year</div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="label pb-2 text-left font-medium">Input</th>
                  {Array.from({ length: YEARS }, (_, i) => (
                    <th key={i} className="label pb-2 text-right font-medium">Y{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ARRAY_FIELDS.map((f) => (
                  <tr key={f.key} title={ASSUMPTION_NOTES[f.key]}>
                    <td className="whitespace-nowrap py-1 pr-3 text-muted">{f.label}</td>
                    {a[f.key].map((v, i) => (
                      <td key={i} className="py-1 pl-1">
                        <input type="number" value={toView(v, f.pct)} onChange={(e) => setArr(f.key, i, fromView(e.target.value, f.pct))} className={cellInput} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel space-y-2 p-4">
            <div className="label mb-1">Unit assumptions</div>
            {SCALAR_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center justify-between gap-3 text-xs text-muted" title={ASSUMPTION_NOTES[f.key]}>
                <span>{f.label}</span>
                <input type="number" value={toView(a[f.key], f.pct)} onChange={(e) => setScalar(f.key, fromView(e.target.value, f.pct))} className={clsx(cellInput, 'w-28')} />
              </label>
            ))}
            <p className="pt-1 text-2xs text-muted">Hover any input for the reasoning behind it.</p>
          </div>
        </div>
      </Section>

      <Section title="Projection">
        <div className="flex justify-end">
          <button
            onClick={() => downloadCsv(rows)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/5 px-3 py-1.5 text-xs text-ink hover:bg-white/10"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="label px-3 py-2 text-left font-medium">₹</th>
                {rows.map((r) => (
                  <th key={r.year} className="label px-3 py-2 text-right font-medium">Year {r.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className={clsx('border-b border-line/50', row.kind === 'total' && 'bg-white/[0.02]')}>
                  <td className={clsx('whitespace-nowrap px-3 py-1.5', row.kind ? 'font-medium text-ink' : 'text-muted')}>{row.label}</td>
                  {rows.map((r) => {
                    const v = Number(r[row.key]);
                    return (
                      <td
                        key={r.year}
                        className={clsx(
                          'tnum whitespace-nowrap px-3 py-1.5 text-right',
                          row.kind === 'result' ? (v >= 0 ? 'text-up' : 'text-down') : row.kind ? 'text-ink' : 'text-muted',
                        )}
                      >
                        {row.kind === 'users' ? count(v) : inr(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-3 py-1.5 text-muted">EBITDA margin</td>
                {rows.map((r) => (
                  <td key={r.year} className={clsx('tnum px-3 py-1.5 text-right', (r.ebitdaMargin ?? 0) >= 0 ? 'text-up' : 'text-down')}>
                    {r.ebitdaMargin == null ? '—' : `${(r.ebitdaMargin * 100).toFixed(0)}%`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Revenue vs cost by year">
            <RevenueCostBars rows={rows} />
            <p className="text-2xs">Blue: revenue. Grey: total cost.</p>
          </Card>
          <Card title="First EBITDA-positive year">
            <div className="tnum text-2xl font-semibold text-ink">{firstProfitable ? `Year ${firstProfitable.year}` : 'Not within 5 years'}</div>
            <p className="mt-1 text-xs">Deepest cumulative cash position: <span className="tnum text-down">{inr(trough)}</span> — the minimum the company must raise before buffer.</p>
          </Card>
          <Card title="Year 5">
            <div className="tnum text-2xl font-semibold text-ink">{inr(rows[4].revenue)}</div>
            <p className="mt-1 text-xs">
              revenue from {count(rows[4].paidUsers)} paid users, {a.colleges[4]} colleges and {a.b2bClients[4]} API clients.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Break-even" intro="Consumer break-even: how many Pro users cover the monthly fixed cost base. Campus and API revenue are upside on top.">
        <div className="flex items-center gap-2 text-xs text-muted">
          Cost base of
          {Array.from({ length: YEARS }, (_, i) => (
            <button
              key={i}
              onClick={() => setBeYear(i)}
              className={clsx('rounded border px-2 py-0.5', beYear === i ? 'border-accent bg-accent/15 text-ink' : 'border-line hover:text-ink')}
            >
              Y{i + 1}
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <Card title="Formula">
              <p className="tnum text-xs text-ink">
                Paid users needed = monthly fixed cost ÷ monthly contribution per paid user
              </p>
              <p className="tnum mt-2 text-xs">
                {inr(be.monthlyFixed)} ÷ {inr(be.monthlyContributionPerPaid, 0)} = <span className="text-ink">{be.paidUsersNeeded?.toLocaleString('en-IN') ?? 'never (negative contribution)'}</span>
              </p>
              <p className="mt-2 text-2xs">
                Contribution = ARPU after payment fees − own serving cost − serving cost of the {((1 - be.conversion) / be.conversion).toFixed(0)} free users each paid user brings.
              </p>
            </Card>
            <Card title="Users needed">
              <div className="flex gap-6">
                <div>
                  <div className="tnum text-xl font-semibold text-ink">{be.paidUsersNeeded == null ? '—' : count(be.paidUsersNeeded)}</div>
                  <div className="text-2xs">paid users</div>
                </div>
                <div>
                  <div className="tnum text-xl font-semibold text-ink">{be.totalUsersNeeded == null ? '—' : count(be.totalUsersNeeded)}</div>
                  <div className="text-2xs">registered users at {(be.conversion * 100).toFixed(1)}% conversion</div>
                </div>
              </div>
            </Card>
          </div>
          <div className="panel p-3 lg:col-span-2">
            <BreakEvenChart
              monthlyFixed={be.monthlyFixed}
              revenuePerPaid={revenuePerPaid}
              variablePerPaid={revenuePerPaid - be.monthlyContributionPerPaid}
              breakEvenUsers={be.paidUsersNeeded}
            />
          </div>
        </div>
      </Section>

      <Section title="Unit economics (Pro)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card title="Contribution / year">
            <div className="tnum text-xl font-semibold text-ink">{inr(ue.contributionPerYear)}</div>
            <p className="text-2xs">ARPU × (1 − fees) − serving cost</p>
          </Card>
          <Card title="Lifetime">
            <div className="tnum text-xl font-semibold text-ink">{Number.isFinite(ue.lifetimeYears) ? `${ue.lifetimeYears.toFixed(1)} yrs` : '∞'}</div>
            <p className="text-2xs">1 ÷ annual churn</p>
          </Card>
          <Card title="LTV">
            <div className="tnum text-xl font-semibold text-ink">{Number.isFinite(ue.ltv) ? inr(ue.ltv) : '∞'}</div>
            <p className="text-2xs">contribution × lifetime</p>
          </Card>
          <Card title="LTV / CAC">
            <div className={clsx('tnum text-xl font-semibold', (ue.ltvToCac ?? 0) >= 3 ? 'text-up' : 'text-down')}>
              {ue.ltvToCac == null || !Number.isFinite(ue.ltvToCac) ? '—' : `${ue.ltvToCac.toFixed(1)}×`}
            </div>
            <p className="text-2xs">CAC {inr(ue.cac)}; 3× or more is healthy</p>
          </Card>
          <Card title="CAC payback">
            <div className="tnum text-xl font-semibold text-ink">{ue.paybackMonths == null ? '—' : `${ue.paybackMonths.toFixed(1)} mo`}</div>
            <p className="text-2xs">CAC ÷ monthly contribution</p>
          </Card>
        </div>
      </Section>
    </Page>
  );
}
