'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

import { useFollowPortfolio } from '@/lib/hooks';
import { tickerLabel } from '@/lib/format';
import { PERSONAS } from '@/lib/personas';
import type { ModelPortfolio } from '@/lib/types';
import { Badge, Spinner } from '@/components/ui';

// Allocation palette deliberately avoids green/red, which are reserved for P&L.
export const ALLOC_COLORS = ['#4c8fe8', '#8b5cf6', '#38bdf8', '#f59e0b', '#ec4899', '#14b8a6', '#a3a3a3', '#6366f1', '#eab308', '#0ea5e9'];
export const CASH_COLOR = 'rgba(255,255,255,0.12)';

export function personaName(key: string): string {
  return PERSONAS.find((p) => p.key === key)?.name ?? key;
}

export function RiskBadge({ level }: { level: ModelPortfolio['risk_level'] }) {
  return <Badge tone={level === 'High' ? 'accent' : level === 'Medium' ? 'default' : 'muted'}>{level} risk</Badge>;
}

export function FollowButton({ portfolio, size = 'sm' }: { portfolio: ModelPortfolio; size?: 'sm' | 'md' }) {
  const follow = useFollowPortfolio();
  const on = portfolio.followed;
  return (
    <button
      onClick={() => follow.mutate({ id: portfolio.id, follow: !on })}
      disabled={follow.isPending}
      title={follow.isError && follow.error instanceof Error ? follow.error.message : undefined}
      className={clsx(
        'flex items-center gap-1.5 rounded-md border font-medium transition-colors disabled:opacity-50',
        size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-2xs',
        on ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line text-muted hover:bg-white/5 hover:text-ink',
      )}
    >
      {follow.isPending ? <Spinner className="h-3 w-3" /> : <Star size={size === 'md' ? 14 : 12} fill={on ? 'currentColor' : 'none'} />}
      {on ? 'Following' : 'Follow'}
      <span className="tnum text-muted">{portfolio.followers}</span>
    </button>
  );
}

export default function PortfolioCard({ portfolio: p }: { portfolio: ModelPortfolio }) {
  const top = [...p.holdings].sort((a, b) => b.weight_pct - a.weight_pct).slice(0, 3);
  return (
    <div className="panel flex flex-col p-4 transition-colors hover:border-accent/30">
      <Link href={`/portfolios/${encodeURIComponent(p.id)}`} className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{p.name}</div>
            <div className="mt-0.5 line-clamp-2 text-2xs text-muted">{p.tagline}</div>
          </div>
          <RiskBadge level={p.risk_level} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {p.persona_keys.length >= PERSONAS.length ? (
            <Badge tone="muted">All 12 personas</Badge>
          ) : (
            p.persona_keys.map((k) => (
              <Badge key={k} tone="muted">
                {personaName(k)}
              </Badge>
            ))
          )}
        </div>

        <div className="mt-3 flex-1 space-y-1.5 border-t border-line pt-3">
          {top.length === 0 ? (
            <p className="text-2xs text-muted">No bullish names — fully in cash.</p>
          ) : (
            top.map((h, i) => (
              <div key={h.ticker} className="flex items-center gap-2 text-2xs">
                <span className="w-24 truncate text-[13px] text-ink">{tickerLabel(h.ticker)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full" style={{ width: `${h.weight_pct}%`, background: ALLOC_COLORS[i] }} />
                </div>
                <span className="tnum w-12 text-right text-muted">{h.weight_pct.toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="tnum text-2xs text-muted">
          {p.holdings.length} holdings · {p.cash_weight_pct.toFixed(1)}% cash
        </span>
        <FollowButton portfolio={p} />
      </div>
    </div>
  );
}
