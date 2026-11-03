'use client';

import { money, pct, signClass } from '@/lib/format';
import { Skeleton } from '@/components/ui';
import { useLiveFacts } from './hooks';

export default function LiveTraction() {
  const f = useLiveFacts();
  const items: { label: string; value: string; cls?: string }[] = [
    { label: 'Fund NAV', value: money(f.nav, 'INR', 0) },
    { label: 'Return since start', value: pct(f.navReturnPct), cls: signClass(f.navReturnPct) },
    { label: 'Fund runs', value: f.runs == null ? '—' : String(f.runs) },
    { label: 'Paper orders', value: f.orders == null ? '—' : String(f.orders) },
    { label: 'Agents', value: String(f.agents) },
    { label: 'Pro waitlist', value: f.waitlist == null ? '—' : String(f.waitlist) },
  ];
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="label">Live traction</span>
        <span className="flex items-center gap-1.5 text-2xs text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${f.live ? 'bg-up' : 'bg-muted'}`} />
          {f.live ? 'From the running product' : 'API offline'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((i) => (
          <div key={i.label}>
            <div className="label">{i.label}</div>
            {f.live || i.label === 'Agents' ? (
              <div className={`tnum mt-1 text-lg font-semibold ${i.cls ?? 'text-ink'}`}>{i.value}</div>
            ) : (
              <Skeleton className="mt-2 h-5 w-16" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
