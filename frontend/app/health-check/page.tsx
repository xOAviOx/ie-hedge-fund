'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FileUp, HeartPulse, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

import { useAnalyseHoldings, useHealthSample } from '@/lib/hooks';
import { dateTime, money, pct, signClass, tickerLabel } from '@/lib/format';
import type { HealthReport, HoldingInput, Severity, Verdict } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Empty, ErrorState, Panel, Spinner } from '@/components/ui';
import { ScoreLite } from '@/components/score/ScoreCard';
import { cleanNumber, parseHoldingsCsv, type HoldingRow } from '@/components/health/csv';

const MAX_ROWS = 30;

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
const SEVERITY_STYLE: Record<Severity, string> = {
  high: 'border-down/30 bg-down/10 text-down',
  medium: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  low: 'border-line bg-white/5 text-muted',
};
const VERDICT_STYLE: Record<Verdict, string> = {
  Approves: 'text-up',
  Mixed: 'text-amber-400',
  Disapproves: 'text-down',
};

function gradeTone(score: number): string {
  if (score >= 70) return 'text-up';
  if (score >= 40) return 'text-amber-400';
  return 'text-down';
}

const cellInput =
  'w-full rounded border border-transparent bg-transparent px-2 py-1 text-[13px] text-ink hover:border-line focus:border-accent/50 focus:bg-panel2 focus:outline-none';

function toInputs(rows: HoldingRow[]): { holdings: HoldingInput[]; invalid: number } {
  let invalid = 0;
  const holdings: HoldingInput[] = [];
  for (const r of rows) {
    const quantity = Number(cleanNumber(r.quantity));
    const avg = r.avg_cost.trim() ? Number(cleanNumber(r.avg_cost)) : null;
    if (!r.ticker.trim() || !Number.isFinite(quantity) || quantity <= 0 || (avg != null && !Number.isFinite(avg))) {
      invalid++;
      continue;
    }
    holdings.push({ ticker: r.ticker.trim().toUpperCase(), quantity, avg_cost: avg });
  }
  return { holdings, invalid };
}

function Report({ report }: { report: HealthReport }) {
  const warnings = [...report.warnings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const sectors = [...report.sector_exposure].sort((a, b) => b.weight_pct - a.weight_pct);
  const holdings = [...report.holdings].sort((a, b) => b.weight_pct - a.weight_pct);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel flex flex-col items-center justify-center gap-1 p-6 text-center">
          <span className="label">Health score</span>
          <div className={clsx('tnum text-6xl font-semibold', gradeTone(report.health_score))}>{Math.round(report.health_score)}</div>
          <div className="text-sm text-ink">
            Grade <span className={clsx('tnum font-semibold', gradeTone(report.health_score))}>{report.grade}</span>
          </div>
          <div className="tnum mt-2 text-2xs text-muted">
            {money(report.total_value, report.base_currency, 0)} · {report.holdings.length} holdings · {dateTime(report.as_of)}
          </div>
        </div>

        <Panel title={`Warnings (${warnings.length})`} className="lg:col-span-2" bodyClassName="p-4">
          {warnings.length === 0 ? (
            <Empty>No red flags — nicely balanced.</Empty>
          ) : (
            <ul className="space-y-2">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={clsx('mt-0.5 rounded border px-1.5 py-0.5 text-2xs font-semibold uppercase', SEVERITY_STYLE[w.severity])}>
                    {w.severity}
                  </span>
                  <div>
                    <div className="text-[13px] text-ink">{w.title}</div>
                    <p className="text-2xs leading-relaxed text-muted">{w.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Holdings" className="lg:col-span-2" bodyClassName="p-0">
          <table className="w-full">
            <thead>
              <tr className="label border-b border-line text-right">
                <th className="py-2 pl-4 text-left font-medium">Ticker</th>
                <th className="px-2 text-left font-medium">Stratton Score</th>
                <th className="px-2 font-medium">Value</th>
                <th className="px-2 font-medium">Weight</th>
                <th className="py-2 pl-2 pr-4 font-medium">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.ticker} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pl-4">
                    <Link href={`/research/${encodeURIComponent(h.ticker)}`} className="text-[13px] font-medium text-ink hover:text-accent">
                      {tickerLabel(h.ticker)}
                    </Link>
                  </td>
                  <td className="px-2">
                    <ScoreLite score={h.score} />
                  </td>
                  <td className="tnum px-2 text-right text-[13px] text-ink">{money(h.value, report.base_currency, 0)}</td>
                  <td className="tnum px-2 text-right text-[13px] text-ink">{h.weight_pct.toFixed(1)}%</td>
                  <td className={`tnum py-2.5 pl-2 pr-4 text-right text-[13px] ${signClass(h.pnl_pct)}`}>{pct(h.pnl_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Sector exposure" bodyClassName="space-y-2 p-4">
          {sectors.length === 0 ? (
            <Empty>No sector data.</Empty>
          ) : (
            sectors.map((s) => (
              <div key={s.sector}>
                <div className="flex justify-between text-2xs">
                  <span className="text-ink">{s.sector}</span>
                  <span className="tnum text-muted">{s.weight_pct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={clsx('h-full rounded-full', s.weight_pct > 40 ? 'bg-amber-400' : 'bg-accent')}
                    style={{ width: `${Math.min(100, s.weight_pct)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel title="What the legends think" bodyClassName="p-4">
        {report.persona_verdicts.length === 0 ? (
          <Empty>No persona verdicts.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {report.persona_verdicts.map((v) => (
              <div key={v.persona_key} className="panel-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-ink">{v.display_name}</span>
                  <span className={clsx('text-2xs font-semibold', VERDICT_STYLE[v.verdict])}>{v.verdict}</span>
                </div>
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full bg-up" style={{ width: `${v.bullish_weight_pct}%` }} />
                  <div className="ml-auto h-full bg-down" style={{ width: `${v.bearish_weight_pct}%` }} />
                </div>
                <div className="tnum mt-1 flex justify-between text-2xs text-muted">
                  <span>{v.bullish_weight_pct.toFixed(0)}% bull</span>
                  <span>{v.bearish_weight_pct.toFixed(0)}% bear</span>
                </div>
                <p className="mt-1.5 text-2xs leading-relaxed text-muted">{v.comment}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default function HealthCheckPage() {
  const [csv, setCsv] = useState('');
  const [rows, setRows] = useState<HoldingRow[]>([]);
  const [wantSample, setWantSample] = useState(false);
  const sample = useHealthSample(wantSample);
  const analyse = useAnalyseHoldings();

  const loadCsv = (text: string) => {
    setCsv(text);
    setRows(parseHoldingsCsv(text));
  };

  useEffect(() => {
    if (!sample.data) return;
    setCsv(sample.data.csv);
    setRows(parseHoldingsCsv(sample.data.csv));
  }, [sample.data]);

  const { holdings, invalid } = useMemo(() => toInputs(rows), [rows]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(loadCsv);
  };

  const updateRow = (i: number, patch: Partial<HoldingRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const tooMany = holdings.length > MAX_ROWS;

  return (
    <div>
      <PageHeader
        title="Portfolio Health Check"
        subtitle="Paste your holdings — the committee grades concentration, quality and conviction."
        actions={
          <button
            onClick={() => analyse.mutate(holdings)}
            disabled={!holdings.length || tooMany || analyse.isPending}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {analyse.isPending ? <Spinner className="h-3.5 w-3.5" /> : <HeartPulse size={14} />}
            {analyse.isPending ? 'Analysing…' : 'Analyse'}
          </button>
        }
      />

      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel
            title="Holdings CSV"
            right={
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => (sample.data ? loadCsv(sample.data.csv) : setWantSample(true))}
                  disabled={sample.isFetching}
                  className="rounded border border-line px-2 py-1 text-2xs text-muted transition-colors hover:text-ink disabled:opacity-50"
                >
                  {sample.isFetching ? 'Loading…' : 'Load sample'}
                </button>
                <label className="flex cursor-pointer items-center gap-1 rounded border border-line px-2 py-1 text-2xs text-muted transition-colors hover:text-ink">
                  <FileUp size={12} /> Upload .csv
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
              </div>
            }
            bodyClassName="space-y-2 p-4"
          >
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={10}
              placeholder={'ticker,quantity,avg_cost\nRELIANCE.NS,10,2450\nTCS.NS,5,3600'}
              className="tnum w-full resize-y rounded-md border border-line bg-panel2 px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-2xs text-muted">
                Columns: ticker, quantity, avg_cost (optional). Zerodha exports (Instrument, Qty., Avg. cost) work too.
              </p>
              <button
                onClick={() => setRows(parseHoldingsCsv(csv))}
                disabled={!csv.trim()}
                className="shrink-0 rounded border border-line px-2 py-1 text-2xs text-ink transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                Parse
              </button>
            </div>
            {sample.isError && <p className="text-2xs text-down">Could not load sample: {sample.error.message}</p>}
          </Panel>

          <Panel
            title={`Preview (${rows.length})`}
            right={
              <button
                onClick={() => setRows((rs) => [...rs, { ticker: '', quantity: '', avg_cost: '' }])}
                className="flex items-center gap-1 text-2xs text-accent hover:underline"
              >
                <Plus size={12} /> Add row
              </button>
            }
            bodyClassName="p-0"
          >
            {rows.length === 0 ? (
              <Empty>Paste or upload a CSV, then Parse.</Empty>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-panel">
                    <tr className="label border-b border-line text-left">
                      <th className="py-2 pl-4 font-medium">Ticker</th>
                      <th className="px-2 font-medium">Quantity</th>
                      <th className="px-2 font-medium">Avg cost</th>
                      <th className="py-2 pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-line/60 last:border-0">
                        <td className="py-1 pl-2">
                          <input value={r.ticker} onChange={(e) => updateRow(i, { ticker: e.target.value })} className={`${cellInput} tnum`} />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            value={r.quantity}
                            onChange={(e) => updateRow(i, { quantity: e.target.value })}
                            inputMode="decimal"
                            className={`${cellInput} tnum`}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            value={r.avg_cost}
                            onChange={(e) => updateRow(i, { avg_cost: e.target.value })}
                            inputMode="decimal"
                            placeholder="—"
                            className={`${cellInput} tnum`}
                          />
                        </td>
                        <td className="py-1 pr-4 text-right">
                          <button
                            onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                            title="Remove row"
                            className="text-muted transition-colors hover:text-down"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(invalid > 0 || tooMany) && (
              <div className="flex items-center gap-2 border-t border-line px-4 py-2 text-2xs text-amber-400">
                <AlertTriangle size={12} />
                {tooMany ? `Up to ${MAX_ROWS} holdings per check.` : `${invalid} row(s) need a ticker and a positive quantity — they will be skipped.`}
              </div>
            )}
          </Panel>
        </div>

        {analyse.isError && (
          <Panel bodyClassName="p-4">
            <ErrorState error={analyse.error} onRetry={() => analyse.mutate(holdings)} />
          </Panel>
        )}
        {analyse.isPending && (
          <Panel bodyClassName="p-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <Spinner /> Running the committee over {holdings.length} holdings…
            </div>
          </Panel>
        )}
        {analyse.data && !analyse.isPending && <Report report={analyse.data} />}
        <p className="text-2xs text-muted">Paper analysis for education, not financial advice.</p>
      </div>
    </div>
  );
}
