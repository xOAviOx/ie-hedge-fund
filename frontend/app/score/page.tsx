'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

import { useScore, useScoreBoard } from '@/lib/hooks';
import { dateTime, money, num, tickerLabel } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import { Empty, ErrorState, Loading, Panel, Spinner } from '@/components/ui';
import ScoreCard, { ReasonList, ScoreBar, scoreTone } from '@/components/score/ScoreCard';

export default function ScorePage() {
  const board = useScoreBoard();
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const single = useScore(lookup, !!lookup);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = query.trim().toUpperCase();
    if (t) setLookup(t);
  };

  const scores = board.data?.scores ?? [];

  return (
    <div>
      <PageHeader
        title="Stratton Score"
        subtitle={
          board.data ? `One 1-10 number from the whole committee · as of ${dateTime(board.data.as_of)}` : 'One 1-10 number from the whole committee.'
        }
      />

      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
        <Panel title={`Leaderboard (${scores.length})`} className="lg:col-span-2" bodyClassName="p-0">
          {board.isLoading ? (
            <Loading label="Scoring the universe" />
          ) : board.isError ? (
            <ErrorState error={board.error} onRetry={() => board.refetch()} />
          ) : scores.length === 0 ? (
            <Empty>No scores yet. Add tickers to the fund universe in Settings.</Empty>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="label border-b border-line text-right">
                  <th className="w-8 py-2 pl-4" />
                  <th className="px-2 text-left font-medium">Ticker</th>
                  <th className="px-2 font-medium">Score</th>
                  <th className="px-2 text-left font-medium">Label</th>
                  <th className="px-2 font-medium">Bull / Bear / Neutral</th>
                  <th className="px-2 font-medium">Price</th>
                  <th className="py-2 pl-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => {
                  const isOpen = open === s.ticker;
                  return (
                    <Fragment key={s.ticker}>
                      <tr
                        onClick={() => setOpen(isOpen ? null : s.ticker)}
                        className="cursor-pointer border-b border-line/60 transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="py-2.5 pl-4 text-muted">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                        <td className="px-2 text-[13px] font-medium text-ink">{tickerLabel(s.ticker)}</td>
                        <td className={`tnum px-2 text-right text-lg font-semibold ${scoreTone(s.score)}`}>{s.score.toFixed(1)}</td>
                        <td className={`px-2 text-xs ${scoreTone(s.score)}`}>{s.label}</td>
                        <td className="tnum px-2 text-right text-2xs">
                          <span className="text-up">{s.bull_count}</span> / <span className="text-down">{s.bear_count}</span> /{' '}
                          <span className="text-muted">{s.neutral_count}</span>
                        </td>
                        <td className="tnum px-2 text-right text-[13px] text-ink">{money(s.price, s.ticker.endsWith('.NS') || s.ticker.endsWith('.BO') ? 'INR' : 'USD')}</td>
                        <td className="py-2.5 pl-2 pr-4">
                          <ScoreBar score={s.score} />
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-line/60 bg-panel2/60">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="mb-3 flex flex-wrap items-center gap-4 text-2xs text-muted">
                              <span>
                                Analysts <span className={`tnum ${scoreTone(s.analyst_score)}`}>{s.analyst_score != null ? num(s.analyst_score, 1) : '—'}</span>
                              </span>
                              <span>
                                Personas <span className={`tnum ${scoreTone(s.persona_score)}`}>{s.persona_score != null ? num(s.persona_score, 1) : '—'}</span>
                              </span>
                              <span>
                                Net vote <span className="tnum text-ink">{s.net.toFixed(2)}</span>
                              </span>
                              <Link href={`/research/${encodeURIComponent(s.ticker)}`} className="ml-auto text-accent hover:underline">
                                Full research →
                              </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <ReasonList title="Top bullish" reasons={s.top_bullish} tone="up" />
                              <ReasonList title="Top bearish" reasons={s.top_bearish} tone="down" />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Score any ticker" bodyClassName="p-4">
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="INFY, AAPL, HDFCBANK.NS"
                className="tnum w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!query.trim() || single.isFetching}
                className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {single.isFetching ? <Spinner className="h-3.5 w-3.5" /> : <Search size={14} />}
                Score
              </button>
            </form>
            <p className="mt-1.5 text-2xs text-muted">Runs the full agent pipeline — can take a few seconds.</p>
          </Panel>

          {lookup &&
            (single.isLoading ? (
              <Panel bodyClassName="p-0">
                <Loading label={`Scoring ${lookup}`} />
              </Panel>
            ) : single.isError ? (
              <Panel bodyClassName="p-4">
                <ErrorState error={single.error} onRetry={() => single.refetch()} />
              </Panel>
            ) : single.data ? (
              <ScoreCard score={single.data} />
            ) : null)}

          <Panel title="How the score works" bodyClassName="space-y-2 p-4 text-2xs leading-relaxed text-muted">
            <p>
              Every agent — 6 analyst models and 12 investor personas — casts a vote on the ticker: bullish counts{' '}
              <span className="tnum text-ink">+1</span>, bearish <span className="tnum text-ink">−1</span>, neutral{' '}
              <span className="tnum text-ink">0</span>.
            </p>
            <p>
              Each vote is weighted by that agent&apos;s confidence (0-100) and averaged over all agents, giving a net vote
              between <span className="tnum text-ink">−1</span> and <span className="tnum text-ink">+1</span>. Neutral agents stay
              in the average on purpose: a ticker only scores high when a broad share of the committee is convinced.
            </p>
            <p>
              The net vote maps linearly onto <span className="tnum text-ink">1-10</span> (score = 1 + (net + 1) × 4.5), so −1 is
              1.0, 0 is 5.5 and +1 is 10.0.
            </p>
            <p className="tnum">
              <span className="text-up">Strong Buy ≥ 8 · Buy ≥ 6.5</span> · <span className="text-amber-400">Hold &gt; 4.5</span> ·{' '}
              <span className="text-down">Sell ≥ 3 · Strong Sell &lt; 3</span>
            </p>
            <p>Analyst and persona sub-scores apply the same math to each group alone.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
