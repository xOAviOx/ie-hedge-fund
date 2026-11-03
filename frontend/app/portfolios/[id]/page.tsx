'use client';

import Link from 'next/link';
import { ArrowLeft, Check, FlaskConical } from 'lucide-react';

import { useApplyPortfolio, usePortfolio } from '@/lib/hooks';
import { tickerLabel } from '@/lib/format';
import type { ModelPortfolio } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Badge, ConfidenceBar, DirectionPill, Empty, ErrorState, Loading, Panel, Spinner } from '@/components/ui';
import { ALLOC_COLORS, CASH_COLOR, FollowButton, RiskBadge, personaName } from '@/components/portfolios/PortfolioCard';

function AllocationDonut({ portfolio }: { portfolio: ModelPortfolio }) {
  const slices = [
    ...portfolio.holdings.map((h, i) => ({ label: tickerLabel(h.ticker), pct: h.weight_pct, color: ALLOC_COLORS[i % ALLOC_COLORS.length] })),
    { label: 'Cash', pct: portfolio.cash_weight_pct, color: CASH_COLOR },
  ].filter((s) => s.pct > 0);
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg width={150} height={150} viewBox="0 0 42 42" className="-rotate-90 shrink-0">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        {slices.map((s) => {
          const el = (
            <circle
              key={s.label}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={s.color}
              strokeWidth="5"
              pathLength={100}
              strokeDasharray={`${s.pct} ${100 - s.pct}`}
              strokeDashoffset={-offset}
            />
          );
          offset += s.pct;
          return el;
        })}
      </svg>
      <ul className="w-full space-y-1">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-2xs">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 truncate text-ink">{s.label}</span>
            <span className="tnum text-muted">{s.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const q = usePortfolio(id);
  const apply = useApplyPortfolio();

  const header = (p?: ModelPortfolio) => (
    <PageHeader
      title={p?.name ?? 'Model Portfolio'}
      subtitle={p?.tagline}
      actions={
        <>
          <Link
            href="/portfolios"
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink"
          >
            <ArrowLeft size={14} /> All portfolios
          </Link>
          {p && (
            <>
              <FollowButton portfolio={p} size="md" />
              <Link
                href={`/backtest?personas=${encodeURIComponent(p.persona_keys.join(','))}`}
                className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <FlaskConical size={14} /> Backtest this portfolio
              </Link>
              <button
                onClick={() => {
                  if (window.confirm(`Replace your fund's active personas with the ${p.name} committee?`)) apply.mutate(p.id);
                }}
                disabled={apply.isPending}
                className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {apply.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Check size={14} />}
                Apply to my fund
              </button>
            </>
          )}
        </>
      }
    />
  );

  if (q.isLoading) {
    return (
      <div>
        {header()}
        <Loading label="Loading portfolio" />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div>
        {header()}
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      </div>
    );
  }

  const p = q.data;
  const holdings = [...p.holdings].sort((a, b) => b.weight_pct - a.weight_pct);

  return (
    <div>
      {header(p)}
      <div className="space-y-4 p-6">
        {apply.isError && (
          <div className="rounded-md border border-down/25 bg-down/10 px-4 py-2 text-xs text-down">
            Apply failed: {apply.error instanceof Error ? apply.error.message : 'unknown error'}
          </div>
        )}
        {apply.isSuccess && (
          <div className="rounded-md border border-accent/25 bg-accent/10 px-4 py-2 text-xs text-ink">
            Applied — your fund now runs the {p.name} committee.{' '}
            <Link href="/console" className="text-accent hover:underline">
              Open the console →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="About" className="lg:col-span-2" bodyClassName="space-y-3 p-4">
            <p className="text-sm leading-relaxed text-ink/90">{p.description}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <RiskBadge level={p.risk_level} />
              {p.persona_keys.map((k) => (
                <Badge key={k} tone="muted">
                  {personaName(k)}
                </Badge>
              ))}
            </div>
            <p className="tnum text-2xs text-muted">
              {p.bullish_count} bullish of {p.universe.length} tickers · {p.followers} followers
            </p>
          </Panel>
          <Panel title="Allocation" bodyClassName="p-4">
            <AllocationDonut portfolio={p} />
          </Panel>
        </div>

        <Panel title={`Holdings (${holdings.length})`} bodyClassName="p-0">
          {holdings.length === 0 ? (
            <Empty>No ticker has a positive committee vote today — the portfolio is 100% cash.</Empty>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="label border-b border-line text-left">
                  <th className="py-2 pl-4 font-medium">Ticker</th>
                  <th className="px-2 font-medium">Weight</th>
                  <th className="px-2 font-medium">Direction</th>
                  <th className="px-2 font-medium">Confidence</th>
                  <th className="py-2 pl-2 pr-4 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={h.ticker} className="border-b border-line/60 align-top last:border-0">
                    <td className="py-2.5 pl-4">
                      <Link href={`/research/${encodeURIComponent(h.ticker)}`} className="text-[13px] font-medium text-ink hover:text-accent">
                        {tickerLabel(h.ticker)}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${h.weight_pct}%`, background: ALLOC_COLORS[i % ALLOC_COLORS.length] }}
                          />
                        </div>
                        <span className="tnum text-2xs text-ink">{h.weight_pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <DirectionPill direction={h.direction} />
                    </td>
                    <td className="px-2 py-2.5">
                      <ConfidenceBar value={h.confidence} />
                    </td>
                    <td className="py-2.5 pl-2 pr-4 text-2xs leading-relaxed text-muted">
                      {h.reasons.length ? (
                        <ul className="space-y-0.5">
                          {h.reasons.map((r, j) => (
                            <li key={j}>{r}</li>
                          ))}
                        </ul>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-line">
                  <td className="py-2.5 pl-4 text-[13px] text-muted">Cash</td>
                  <td className="tnum px-2 py-2.5 text-2xs text-muted" colSpan={4}>
                    {p.cash_weight_pct.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </Panel>
        <p className="text-2xs text-muted">Paper portfolio for education, not financial advice.</p>
      </div>
    </div>
  );
}
