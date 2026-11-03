// Shared building blocks for the Venture section.
'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ExternalLink, Printer } from 'lucide-react';

export function Section({
  id,
  kicker,
  title,
  intro,
  children,
  className,
}: {
  id?: string;
  kicker?: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx('scroll-mt-24 space-y-4', className)}>
      <div>
        {kicker && <div className="label text-accent">{kicker}</div>}
        <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">{title}</h2>
        {intro && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function Card({
  title,
  children,
  className,
  accent,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={clsx('panel p-4', accent && 'border-accent/40 bg-accent/[0.06]', className)}>
      {title && <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>}
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export function Estimate({ children = 'Estimate' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-2xs font-medium text-amber-300">
      {children}
    </span>
  );
}

export function Source({ source, url }: { source?: string; url?: string }) {
  if (!source) return null;
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-2xs text-muted underline-offset-2 hover:text-accent hover:underline">
      {source} <ExternalLink size={10} />
    </a>
  ) : (
    <span className="text-2xs text-muted">{source}</span>
  );
}

export function Bullets({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={clsx('space-y-1.5', className)}>
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const RATING_TONE: Record<string, string> = {
  Low: 'border-line bg-white/5 text-muted',
  Medium: 'border-accent/30 bg-accent/10 text-accent',
  High: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
};

export function Rating({ value }: { value: string }) {
  return (
    <span className={clsx('inline-flex rounded border px-1.5 py-0.5 text-2xs font-semibold uppercase', RATING_TONE[value])}>
      {value}
    </span>
  );
}

export function Table({
  head,
  rows,
  className,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
}) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} className="label whitespace-nowrap px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/60 align-top last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-muted first:text-ink">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl space-y-10 px-6 py-6">{children}</div>;
}

/** Prints the page; with `reportOnly`, everything marked data-report-hide is hidden while printing. */
export function PrintButton({ label, reportOnly }: { label: string; reportOnly?: boolean }) {
  const onClick = () => {
    if (reportOnly) {
      document.body.classList.add('print-report');
      window.addEventListener('afterprint', () => document.body.classList.remove('print-report'), { once: true });
    }
    window.print();
  };
  return (
    <button
      onClick={onClick}
      data-print-hide
      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/5 px-3 py-1.5 text-xs text-ink transition-colors hover:bg-white/10"
    >
      <Printer size={13} /> {label}
    </button>
  );
}

// The app shell is a fixed-height, scroll-clipped flex layout; printing needs it unclipped.
const PRINT_CSS = `
@media print {
  @page { size: A4 portrait; margin: 14mm; }
  html, body { background: #fff !important; }
  aside, [data-print-hide] { display: none !important; }
  body > div, main { display: block !important; height: auto !important; overflow: visible !important; background: none !important; }
  body.print-report [data-report-hide] { display: none !important; }
  .paper { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: none !important; border: 0 !important; }
  .print-break { break-before: page; }
  .avoid-break { break-inside: avoid; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

export function PrintStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />;
}

/** White document surface used for the printable business plan and exemplar report. */
export function Paper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('paper mx-auto max-w-[210mm] rounded-md bg-white px-[16mm] py-[14mm] text-[13px] leading-relaxed text-zinc-800 shadow-2xl', className)}>
      {children}
    </div>
  );
}
