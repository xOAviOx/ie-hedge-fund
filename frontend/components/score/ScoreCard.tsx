'use client';

import { clsx } from 'clsx';

import type { ScoreReason, StrattonScore } from '@/lib/types';
import { displayForAgent } from '@/lib/personas';
import { num, tickerLabel } from '@/lib/format';
import { ConfidenceBar } from '@/components/ui';

// Bands mirror score_label in backend/app/engine/score.py: Buy >= 6.5, Sell <= 4.5.
export function scoreTone(score: number | null | undefined): string {
  if (score == null) return 'text-muted';
  if (score >= 6.5) return 'text-up';
  if (score <= 4.5) return 'text-down';
  return 'text-amber-400';
}

export function scoreFill(score: number | null | undefined): string {
  if (score == null) return 'bg-white/10';
  if (score >= 6.5) return 'bg-up';
  if (score <= 4.5) return 'bg-down';
  return 'bg-amber-400';
}

const STROKE: Record<string, string> = {
  'text-up': '#2ebd85',
  'text-down': '#f6465d',
  'text-amber-400': '#fbbf24',
  'text-muted': '#7a828e',
};

export function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
  const frac = Math.max(0, Math.min(1, (score - 1) / 9));
  const color = STROKE[scoreTone(score)];
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" aria-label={`Score ${score} of 10`}>
      <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${frac * 100} 100`}
      />
      <text x="50" y="50" textAnchor="middle" fill="#e6e8ec" fontSize="20" fontWeight="600" fontFamily="JetBrains Mono, monospace">
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
      <div className={clsx('h-full rounded-full', scoreFill(score))} style={{ width: `${(score / 10) * 100}%` }} />
    </div>
  );
}

// Compact score + label for tables.
export function ScoreLite({ score }: { score: StrattonScore }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={clsx('tnum text-sm font-semibold', scoreTone(score.score))}>{score.score.toFixed(1)}</span>
      <span className="text-2xs text-muted">{score.label}</span>
    </span>
  );
}

export function ReasonList({ title, reasons, tone }: { title: string; reasons: ScoreReason[]; tone: 'up' | 'down' }) {
  return (
    <div>
      <div className={clsx('label mb-1.5', tone === 'up' ? 'text-up' : 'text-down')}>{title}</div>
      {reasons.length === 0 ? (
        <p className="text-2xs text-muted">None.</p>
      ) : (
        <ul className="space-y-2">
          {reasons.map((r) => (
            <li key={r.agent_id} className="text-2xs leading-relaxed">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-ink">{r.agent_name || displayForAgent(r.agent_id)}</span>
                <ConfidenceBar value={r.confidence} />
              </div>
              <p className="mt-0.5 text-muted">{r.reasoning || '—'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ScoreCard({
  score,
  showReasons = true,
  className,
}: {
  score: StrattonScore;
  showReasons?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx('panel p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="label">Stratton Score · {tickerLabel(score.ticker)}</span>
        <span className="tnum text-2xs text-muted">{score.agent_count} agents</span>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <ScoreGauge score={score.score} />
        <div className="space-y-1.5">
          <div className={clsx('text-lg font-semibold', scoreTone(score.score))}>{score.label}</div>
          <div className="tnum flex gap-3 text-2xs">
            <span className="text-up">{score.bull_count}▲</span>
            <span className="text-down">{score.bear_count}▼</span>
            <span className="text-muted">{score.neutral_count}●</span>
          </div>
          <div className="tnum space-y-0.5 text-2xs text-muted">
            <div>
              Analysts <span className={scoreTone(score.analyst_score)}>{score.analyst_score != null ? num(score.analyst_score, 1) : '—'}</span>
            </div>
            <div>
              Personas <span className={scoreTone(score.persona_score)}>{score.persona_score != null ? num(score.persona_score, 1) : '—'}</span>
            </div>
          </div>
        </div>
      </div>
      {showReasons && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-line pt-3">
          <ReasonList title="Top bullish" reasons={score.top_bullish} tone="up" />
          <ReasonList title="Top bearish" reasons={score.top_bearish} tone="down" />
        </div>
      )}
    </div>
  );
}
