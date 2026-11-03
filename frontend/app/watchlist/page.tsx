'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellRing, CheckCheck, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

import {
  useAlertEvents,
  useAlertRules,
  useCheckAlerts,
  useCreateAlert,
  useDeleteAlert,
  useMarkAlertsRead,
  useWatchlist,
  useWatchlistMutation,
} from '@/lib/hooks';
import { money, num, pct, relativeTime, signClass, tickerLabel } from '@/lib/format';
import type { AlertKind } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Empty, ErrorState, Loading, Panel, Spinner } from '@/components/ui';
import { ALERT_KINDS, alertLabel, needsThreshold } from '@/components/watchlist/alertKinds';

const inputClass =
  'w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none';

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}

function WatchlistPanel() {
  const list = useWatchlist();
  const mutate = useWatchlistMutation();
  const [ticker, setTicker] = useState('');
  const items = list.data?.items ?? [];

  return (
    <Panel
      title={`Watchlist (${items.length})`}
      bodyClassName="p-0"
      right={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = ticker.trim().toUpperCase();
            if (t) mutate.mutate({ ticker: t }, { onSuccess: () => setTicker('') });
          }}
          className="flex items-center gap-1.5"
        >
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Add ticker"
            className="tnum w-32 rounded border border-line bg-panel2 px-2 py-1 text-xs text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!ticker.trim() || mutate.isPending}
            className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-2xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutate.isPending ? <Spinner className="h-3 w-3" /> : <Plus size={12} />} Add
          </button>
        </form>
      }
    >
      {mutate.isError && <div className="border-b border-line bg-down/10 px-4 py-2 text-2xs text-down">{errMsg(mutate.error)}</div>}
      {list.isLoading ? (
        <Loading label="Loading watchlist" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : items.length === 0 ? (
        <Empty>Your watchlist is empty. Add a ticker above.</Empty>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="label border-b border-line text-right">
              <th className="py-2 pl-4 text-left font-medium">Ticker</th>
              <th className="px-2 font-medium">Price</th>
              <th className="px-2 font-medium">Change</th>
              <th className="px-2 font-medium">Added</th>
              <th className="py-2 pl-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.ticker} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 pl-4">
                  <Link href={`/research/${encodeURIComponent(it.ticker)}`} className="text-[13px] font-medium text-ink hover:text-accent">
                    {tickerLabel(it.ticker)}
                  </Link>
                </td>
                <td className="tnum px-2 text-right text-[13px] text-ink">{money(it.price, it.currency)}</td>
                <td className={`tnum px-2 text-right text-[13px] ${signClass(it.change_pct)}`}>{pct(it.change_pct)}</td>
                <td className="px-2 text-right text-2xs text-muted">{relativeTime(it.added_at)}</td>
                <td className="py-2.5 pl-2 pr-4 text-right">
                  <button
                    onClick={() => mutate.mutate({ ticker: it.ticker, remove: true })}
                    disabled={mutate.isPending}
                    title="Remove"
                    className="text-muted transition-colors hover:text-down disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function RulesPanel() {
  const rules = useAlertRules();
  const watch = useWatchlist();
  const create = useCreateAlert();
  const remove = useDeleteAlert();
  const [ticker, setTicker] = useState('');
  const [kind, setKind] = useState<AlertKind>('price_above');
  const [threshold, setThreshold] = useState('');

  const withThreshold = needsThreshold(kind);
  const thresholdNum = Number(threshold);
  const valid = !!ticker.trim() && (!withThreshold || (threshold.trim() !== '' && Number.isFinite(thresholdNum)));
  const list = rules.data?.rules ?? [];

  return (
    <Panel title={`Alert rules (${list.length})`} bodyClassName="p-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          create.mutate(
            { ticker: ticker.trim().toUpperCase(), kind, threshold: withThreshold ? thresholdNum : null },
            { onSuccess: () => setThreshold('') },
          );
        }}
        className="space-y-3 border-b border-line p-4"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label mb-1 block">Ticker</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              list="watchlist-tickers"
              placeholder="RELIANCE.NS"
              className={`${inputClass} tnum`}
            />
            <datalist id="watchlist-tickers">
              {(watch.data?.items ?? []).map((it) => (
                <option key={it.ticker} value={it.ticker} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label mb-1 block">Condition</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as AlertKind)} className={inputClass}>
              {ALERT_KINDS.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {withThreshold && (
          <div>
            <label className="label mb-1 block">Threshold ({ALERT_KINDS.find((k) => k.kind === kind)?.unit})</label>
            <input value={threshold} onChange={(e) => setThreshold(e.target.value)} inputMode="decimal" className={`${inputClass} tnum`} />
          </div>
        )}
        {create.isError && (
          <div className="rounded-md border border-down/25 bg-down/10 px-3 py-2 text-2xs text-down">{errMsg(create.error)}</div>
        )}
        <button
          type="submit"
          disabled={!valid || create.isPending}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {create.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Plus size={14} />} Create alert
        </button>
      </form>

      {rules.isLoading ? (
        <Loading label="Loading rules" />
      ) : rules.isError ? (
        <ErrorState error={rules.error} onRetry={() => rules.refetch()} />
      ) : list.length === 0 ? (
        <Empty>No alert rules yet.</Empty>
      ) : (
        <ul>
          {list.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-b border-line/60 px-4 py-2.5 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-ink">
                  <span className="font-medium">{tickerLabel(r.ticker)}</span>{' '}
                  <span className="text-muted">{alertLabel(r.kind)}</span>
                  {r.threshold != null && <span className="tnum"> {num(r.threshold, 2)}</span>}
                </div>
                <div className="text-2xs text-muted">
                  {r.last_triggered_at ? `last fired ${relativeTime(r.last_triggered_at)}` : 'never fired'}
                  {r.last_value && <span className="tnum"> · last value {r.last_value}</span>}
                  {!r.active && ' · inactive'}
                </div>
              </div>
              <button
                onClick={() => remove.mutate(r.id)}
                disabled={remove.isPending}
                title="Delete rule"
                className="text-muted transition-colors hover:text-down disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function EventsPanel() {
  const events = useAlertEvents();
  const check = useCheckAlerts();
  const markRead = useMarkAlertsRead();
  const list = events.data?.events ?? [];
  const unread = events.data?.unread ?? 0;

  return (
    <Panel
      title={`Alert feed${unread ? ` · ${unread} unread` : ''}`}
      bodyClassName="p-0"
      right={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => markRead.mutate()}
            disabled={!unread || markRead.isPending}
            className="flex items-center gap-1 rounded border border-line px-2 py-1 text-2xs text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <CheckCheck size={12} /> Mark all read
          </button>
          <button
            onClick={() => check.mutate()}
            disabled={check.isPending}
            className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-2xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {check.isPending ? <Spinner className="h-3 w-3" /> : <BellRing size={12} />} Check now
          </button>
        </div>
      }
    >
      {check.isError && <div className="border-b border-line bg-down/10 px-4 py-2 text-2xs text-down">{errMsg(check.error)}</div>}
      {check.data && (
        <div className="border-b border-line bg-panel2 px-4 py-2 text-2xs text-muted">
          Checked <span className="tnum text-ink">{check.data.checked}</span> rules ·{' '}
          <span className="tnum text-ink">{check.data.triggered.length}</span> triggered
        </div>
      )}
      {events.isLoading ? (
        <Loading label="Loading alerts" />
      ) : events.isError ? (
        <ErrorState error={events.error} onRetry={() => events.refetch()} />
      ) : list.length === 0 ? (
        <Empty>No alerts have fired yet.</Empty>
      ) : (
        <ul className="max-h-[32rem] overflow-y-auto">
          {list.map((ev) => (
            <li
              key={ev.id}
              className={clsx(
                'flex gap-3 border-b border-line/60 px-4 py-2.5 last:border-0',
                !ev.read && 'border-l-2 border-l-accent bg-accent/5',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-ink">{tickerLabel(ev.ticker)}</span>
                  <span className="text-2xs text-muted">{alertLabel(ev.kind)}</span>
                </div>
                <p className={clsx('text-2xs leading-relaxed', ev.read ? 'text-muted' : 'text-ink/90')}>{ev.message}</p>
              </div>
              <span className="shrink-0 text-2xs text-muted">{relativeTime(ev.ts)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export default function WatchlistPage() {
  return (
    <div>
      <PageHeader title="Watchlist & Alerts" subtitle="Track tickers and get notified on price, score and consensus moves." />
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <WatchlistPanel />
          <RulesPanel />
        </div>
        <EventsPanel />
      </div>
    </div>
  );
}
