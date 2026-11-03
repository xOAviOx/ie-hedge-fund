// Pure SVG/CSS charts and canvases used across the Venture section, pitch and poster.
'use client';

import { clsx } from 'clsx';

import { COMPETITORS, HC_PLACEMENTS, HC_QUADRANTS, type HCQuadrant } from '@/lib/venture/strategy';
import { BMC } from '@/lib/venture/model';
import type { VPC } from '@/lib/venture/customers';
import { inr } from '@/lib/venture/financials';

export function PositioningMap({ className, compact }: { className?: string; compact?: boolean }) {
  const W = 640;
  const H = 440;
  const P = 44;
  const x = (v: number) => P + (v / 100) * (W - 2 * P);
  const y = (v: number) => H - P - (v / 100) * (H - 2 * P);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={clsx('w-full', className)} role="img" aria-label="Competitive positioning map">
      <rect x={P} y={P} width={W - 2 * P} height={H - 2 * P} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" />
      <line x1={W / 2} y1={P} x2={W / 2} y2={H - P} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
      <line x1={P} y1={H / 2} x2={W - P} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
      <text x={W / 2} y={H - 12} textAnchor="middle" fill="#7a828e" fontSize="12">
        Explainability / transparency →
      </text>
      <text x={14} y={H / 2} textAnchor="middle" fill="#7a828e" fontSize="12" transform={`rotate(-90 14 ${H / 2})`}>
        Automation →
      </text>
      {COMPETITORS.map((c) => (
        <g key={c.name}>
          <circle cx={x(c.explainability)} cy={y(c.automation)} r={c.us ? 9 : 5} fill={c.us ? '#4c8fe8' : '#7a828e'} opacity={c.us ? 1 : 0.8} />
          {c.us && <circle cx={x(c.explainability)} cy={y(c.automation)} r={16} fill="none" stroke="#4c8fe8" opacity={0.4} />}
          <text
            x={x(c.explainability) + (c.explainability > 80 ? -12 : 10)}
            y={y(c.automation) + 4}
            textAnchor={c.explainability > 80 ? 'end' : 'start'}
            fill={c.us ? '#e6e8ec' : '#a3aab5'}
            fontSize={compact ? 13 : 11.5}
            fontWeight={c.us ? 700 : 400}
          >
            {c.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

const HC_ORDER: HCQuadrant[] = ['incremental', 'modular', 'architectural', 'radical'];

export function HendersonClarkGrid() {
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
      <div />
      <div className="label text-center">Core concepts reinforced</div>
      <div className="label text-center">Core concepts overturned</div>
      {[0, 1].map((row) => (
        <div key={row} className="contents">
          <div className="label flex items-center [writing-mode:vertical-rl] rotate-180">
            {row === 0 ? 'Linkages unchanged' : 'Linkages changed'}
          </div>
          {HC_ORDER.slice(row * 2, row * 2 + 2).map((q) => {
            const items = HC_PLACEMENTS.filter((p) => p.quadrant === q);
            const ours = items.some((p) => p.us);
            return (
              <div key={q} className={clsx('panel min-h-[170px] p-4', ours && 'border-accent/50 bg-accent/[0.07]')}>
                <div className="text-sm font-semibold text-ink">{HC_QUADRANTS[q].title}</div>
                <p className="text-2xs text-muted">{HC_QUADRANTS[q].rule}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {items.length === 0 && <span className="text-2xs text-muted">No clear example yet — e.g. a fully autonomous, regulated AI fund manager</span>}
                  {items.map((p) => (
                    <span
                      key={p.name}
                      title={p.why}
                      className={clsx(
                        'rounded border px-2 py-0.5 text-xs',
                        p.us ? 'border-accent bg-accent text-white' : 'border-line bg-white/5 text-ink',
                      )}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function NestedCircles({
  tam,
  sam,
  som,
  className,
  ink = '#e6e8ec',
}: {
  tam: number;
  sam: number;
  som: number;
  className?: string;
  /** Label colour; accepts a CSS variable so print styles can recolour it. */
  ink?: string;
}) {
  // Radii scale with sqrt(value) so circle area tracks market size, with a floor so SOM stays visible.
  const R = 180;
  const r = (v: number) => Math.max(18, Math.sqrt(tam > 0 ? v / tam : 0) * R);
  const rs = r(sam);
  const ro = Math.min(r(som), rs - 8);
  const cy = 200;
  return (
    <svg viewBox="0 0 400 400" className={clsx('w-full', className)} role="img" aria-label="TAM SAM SOM">
      <circle cx={200} cy={cy} r={R} fill="rgba(76,143,232,0.08)" stroke="rgba(76,143,232,0.35)" />
      <circle cx={200} cy={cy + R - rs} r={rs} fill="rgba(76,143,232,0.16)" stroke="rgba(76,143,232,0.55)" />
      <circle cx={200} cy={cy + R - ro} r={ro} fill="#4c8fe8" />
      <text x={200} y={cy - R + 34} textAnchor="middle" style={{ fill: ink }} fontSize="14" fontWeight="600">TAM {inr(tam, 0)}</text>
      <text x={200} y={cy + R - 2 * rs + 26} textAnchor="middle" style={{ fill: ink }} fontSize="13" fontWeight="600">SAM {inr(sam, 0)}</text>
      <text x={200} y={cy + R - 2 * ro - 8} textAnchor="middle" style={{ fill: ink }} fontSize="12" fontWeight="600">SOM {inr(som, 1)}</text>
    </svg>
  );
}

/** Monthly revenue vs cost as paid users grow; the lines cross at break-even. */
export function BreakEvenChart({
  monthlyFixed,
  revenuePerPaid,
  variablePerPaid,
  breakEvenUsers,
}: {
  monthlyFixed: number;
  revenuePerPaid: number;
  variablePerPaid: number;
  breakEvenUsers: number | null;
}) {
  const W = 640;
  const H = 300;
  const P = { l: 64, r: 20, t: 20, b: 40 };
  const maxX = Math.max(1000, (breakEvenUsers ?? 10_000) * 2);
  const maxY = Math.max(revenuePerPaid * maxX, monthlyFixed + variablePerPaid * maxX) * 1.05;
  const x = (u: number) => P.l + (u / maxX) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / maxY) * (H - P.t - P.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Break-even chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(maxY * t)} y2={y(maxY * t)} stroke="rgba(255,255,255,0.06)" />
          <text x={P.l - 8} y={y(maxY * t) + 4} textAnchor="end" fill="#7a828e" fontSize="10">{inr(maxY * t, 1)}</text>
          <text x={x(maxX * t)} y={H - P.b + 16} textAnchor="middle" fill="#7a828e" fontSize="10">{Math.round(maxX * t).toLocaleString('en-IN')}</text>
        </g>
      ))}
      <text x={(W + P.l) / 2} y={H - 6} textAnchor="middle" fill="#7a828e" fontSize="11">Paid users</text>
      <line x1={x(0)} y1={y(monthlyFixed)} x2={x(maxX)} y2={y(monthlyFixed + variablePerPaid * maxX)} stroke="#f6465d" strokeWidth={2} />
      <line x1={x(0)} y1={y(0)} x2={x(maxX)} y2={y(revenuePerPaid * maxX)} stroke="#2ebd85" strokeWidth={2} />
      {breakEvenUsers != null && (
        <g>
          <line x1={x(breakEvenUsers)} x2={x(breakEvenUsers)} y1={P.t} y2={H - P.b} stroke="#4c8fe8" strokeDasharray="4 4" />
          <circle cx={x(breakEvenUsers)} cy={y(revenuePerPaid * breakEvenUsers)} r={5} fill="#4c8fe8" />
          <text x={x(breakEvenUsers) + 8} y={P.t + 12} fill="#e6e8ec" fontSize="11">
            Break-even ≈ {breakEvenUsers.toLocaleString('en-IN')} paid users
          </text>
        </g>
      )}
      <g fontSize="11">
        <rect x={P.l + 10} y={P.t + 24} width={10} height={3} fill="#2ebd85" />
        <text x={P.l + 26} y={P.t + 28} fill="#a3aab5">Monthly revenue</text>
        <rect x={P.l + 10} y={P.t + 40} width={10} height={3} fill="#f6465d" />
        <text x={P.l + 26} y={P.t + 44} fill="#a3aab5">Monthly cost (fixed + variable)</text>
      </g>
    </svg>
  );
}

/** Yearly revenue vs total cost bars. */
export function RevenueCostBars({
  rows,
  muted = '#7a828e',
}: {
  rows: { year: number; revenue: number; totalCost: number }[];
  /** Cost bar and label colour; accepts a CSS variable. */
  muted?: string;
}) {
  const W = 520;
  const H = 220;
  const P = { l: 10, r: 10, t: 10, b: 28 };
  const max = Math.max(1, ...rows.map((r) => Math.max(r.revenue, r.totalCost)));
  const slot = (W - P.l - P.r) / rows.length;
  const h = (v: number) => (v / max) * (H - P.t - P.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue vs cost by year">
      {rows.map((r, i) => {
        const x0 = P.l + i * slot + slot * 0.18;
        const bw = slot * 0.3;
        return (
          <g key={r.year}>
            <rect x={x0} y={H - P.b - h(r.revenue)} width={bw} height={h(r.revenue)} fill="#4c8fe8" rx={2} />
            <rect x={x0 + bw + 4} y={H - P.b - h(r.totalCost)} width={bw} height={h(r.totalCost)} style={{ fill: muted }} opacity={0.6} rx={2} />
            <text x={x0 + bw} y={H - 10} textAnchor="middle" style={{ fill: muted }} fontSize="11">Y{r.year}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function BusinessModelCanvas({ light }: { light?: boolean }) {
  const cell = clsx(
    'rounded-md border p-3',
    light ? 'border-zinc-300 bg-white' : 'border-line bg-panel',
  );
  const head = clsx('mb-1.5 text-2xs font-semibold uppercase tracking-wider', light ? 'text-blue-700' : 'text-accent');
  const body = clsx('space-y-1 text-xs leading-snug', light ? 'text-zinc-700' : 'text-muted');
  const block = (k: keyof typeof BMC, cls: string) => (
    <div className={clsx(cell, cls)}>
      <div className={head}>{BMC[k].title}</div>
      <ul className={body}>
        {BMC[k].items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-10">
      {block('partners', 'md:col-span-2 md:row-span-2')}
      {block('activities', 'md:col-span-2')}
      {block('value', 'md:col-span-2 md:row-span-2')}
      {block('relationships', 'md:col-span-2')}
      {block('segments', 'md:col-span-2 md:row-span-2')}
      {block('resources', 'md:col-span-2')}
      {block('channels', 'md:col-span-2')}
      {block('costs', 'col-span-2 md:col-span-5')}
      {block('revenue', 'col-span-2 md:col-span-5')}
    </div>
  );
}

export function ValuePropositionCanvas({ vpc, light }: { vpc: VPC; light?: boolean }) {
  const box = clsx('rounded-md border p-3', light ? 'border-zinc-300' : 'border-line bg-panel');
  const head = clsx('mb-1 text-2xs font-semibold uppercase tracking-wider', light ? 'text-blue-700' : 'text-accent');
  const body = clsx('space-y-0.5 text-xs', light ? 'text-zinc-700' : 'text-muted');
  const list = (title: string, items: string[]) => (
    <div className={box}>
      <div className={head}>{title}</div>
      <ul className={body}>
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <div className={clsx('label', light && 'text-zinc-500')}>Value map</div>
        {list('Products and services', vpc.products)}
        {list('Pain relievers', vpc.relievers)}
        {list('Gain creators', vpc.creators)}
      </div>
      <div className="space-y-2">
        <div className={clsx('label', light && 'text-zinc-500')}>Customer profile — {vpc.segment}</div>
        {list('Customer jobs', vpc.jobs)}
        {list('Pains', vpc.pains)}
        {list('Gains', vpc.gains)}
      </div>
    </div>
  );
}
