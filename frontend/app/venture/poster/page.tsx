'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react';

import { COMPANY, PRICING, PROBLEM_STATS, TEAM } from '@/lib/company';
import { FEATURES, HOW_IT_WORKS, SOLUTION } from '@/lib/venture/product';
import { ROADMAP } from '@/lib/venture/model';
import { DEFAULT_ASSUMPTIONS, DEFAULT_PROJECTION, breakEven, count, inr, unitEconomics } from '@/lib/venture/financials';
import { DEFAULT_SIZING, sizing } from '@/lib/venture/sizing';
import { NestedCircles, RevenueCostBars } from '@/components/venture/charts';
import { REPO_URL } from '@/components/venture/PitchSlides';

// A2 portrait at 96 dpi.
const POSTER_W = 1587;
const POSTER_H = 2245;

// Dark on screen, light when printed: colours are CSS variables swapped in @media print.
const POSTER_CSS = `
.poster { --p-bg:#08090c; --p-panel:#0d0f14; --p-line:rgba(255,255,255,0.10); --p-ink:#e6e8ec; --p-muted:#8a919c; --p-accent:#4c8fe8; --p-soft:rgba(76,143,232,0.10); }
@media print {
  @page { size: A2 portrait; margin: 0; }
  html, body { background: #fff !important; }
  .poster-chrome { display: none !important; }
  .poster-root { background: #fff !important; min-height: 0 !important; }
  .poster-stage { height: auto !important; padding: 0 !important; display: block !important; }
  .poster-stage > div { transform: none !important; }
  .poster { --p-bg:#ffffff; --p-panel:#f4f6fa; --p-line:#d4d8df; --p-ink:#111318; --p-muted:#4b5260; --p-accent:#1f5fbf; --p-soft:#e7eefb; width: 420mm !important; height: 594mm !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

function Block({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--p-line)] bg-[var(--p-panel)] p-8 ${className}`}>
      <h2 className="mb-5 text-[20px] font-semibold uppercase tracking-[0.18em] text-[var(--p-accent)]">{title}</h2>
      {children}
    </section>
  );
}

export default function PosterPage() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 48) / POSTER_W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const p = DEFAULT_PROJECTION;
  const sz = sizing(DEFAULT_SIZING);
  const ue = unitEconomics(DEFAULT_ASSUMPTIONS);
  const be = breakEven(DEFAULT_ASSUMPTIONS, 2);
  const firstProfit = p.find((r) => r.ebitda > 0);

  return (
    <div className="poster-root min-h-screen bg-black">
      <style dangerouslySetInnerHTML={{ __html: POSTER_CSS }} />
      <div className="poster-chrome sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 px-6 py-3 backdrop-blur">
        <Link href="/venture" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
          <ArrowLeft size={14} /> Venture
        </Link>
        <span className="text-xs text-muted">A2 portrait poster · 420 × 594 mm · prints in a light ink-friendly palette</span>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white">
          <Printer size={13} /> Print poster
        </button>
      </div>

      <div className="poster-stage flex justify-center py-6" style={{ height: POSTER_H * scale + 48 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <article
            className="poster flex flex-col gap-8 overflow-hidden bg-[var(--p-bg)] p-[72px] text-[var(--p-ink)]"
            style={{ width: POSTER_W, height: POSTER_H }}
          >
            <header className="flex items-end justify-between border-b border-[var(--p-line)] pb-10">
              <div>
                <div className="text-[22px] uppercase tracking-[0.25em] text-[var(--p-muted)]">{COMPANY.university} · {COMPANY.course}</div>
                <h1 className="mt-6 text-[170px] font-bold leading-none tracking-tighter">{COMPANY.name}</h1>
                <p className="mt-5 text-[52px] font-medium text-[var(--p-accent)]">{COMPANY.tagline}</p>
              </div>
            </header>
            <p className="max-w-[1300px] text-[30px] leading-snug text-[var(--p-muted)]">{COMPANY.oneLiner}</p>

            <div className="grid grid-cols-2 gap-8">
              <Block title="The problem">
                <div className="text-[120px] font-bold leading-none tracking-tight">{PROBLEM_STATS[0].value}</div>
                <p className="mt-3 text-[26px] leading-snug">{PROBLEM_STATS[0].label}</p>
                <p className="text-[16px] text-[var(--p-muted)]">{PROBLEM_STATS[0].source}</p>
                <div className="mt-6 grid grid-cols-3 gap-5">
                  {PROBLEM_STATS.slice(1).map((s) => (
                    <div key={s.label}>
                      <div className="text-[40px] font-semibold leading-none">{s.value}</div>
                      <p className="mt-2 text-[17px] leading-snug text-[var(--p-muted)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Block>
              <Block title="Our solution">
                <p className="text-[30px] leading-snug">{SOLUTION.statement}</p>
                <p className="mt-6 rounded-xl bg-[var(--p-soft)] p-5 text-[24px] leading-snug text-[var(--p-accent)]">{SOLUTION.differentiator}</p>
              </Block>
            </div>

            <Block title="How it works">
              <div className="flex items-stretch gap-3">
                {HOW_IT_WORKS.map((s, i) => (
                  <div key={s.step} className="flex flex-1 items-center gap-3">
                    <div className="h-full flex-1 rounded-xl border border-[var(--p-line)] bg-[var(--p-bg)] p-5">
                      <div className="text-[18px] text-[var(--p-accent)]">0{i + 1}</div>
                      <div className="mt-1 text-[30px] font-semibold">{s.step}</div>
                      <p className="mt-2 text-[18px] leading-snug text-[var(--p-muted)]">{s.detail}</p>
                    </div>
                    {i < HOW_IT_WORKS.length - 1 && <ArrowRight size={28} className="shrink-0 text-[var(--p-accent)]" />}
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Features">
              <div className="grid grid-cols-3 gap-x-10 gap-y-6">
                {FEATURES.map((f) => (
                  <div key={f.name}>
                    <div className="text-[26px] font-semibold">{f.name}</div>
                    <p className="mt-1 text-[19px] leading-snug text-[var(--p-muted)]">{f.detail}</p>
                  </div>
                ))}
              </div>
            </Block>

            <div className="grid grid-cols-[1fr_1.25fr] gap-8">
              <Block title="Market size (estimates)">
                <div className="grid grid-cols-[260px_1fr] items-center gap-6">
                  <NestedCircles tam={sz.tam} sam={sz.sam} som={sz.som} ink="var(--p-ink)" />
                  <div className="space-y-4 text-[19px] leading-snug text-[var(--p-muted)]">
                    <p><b className="text-[28px] text-[var(--p-ink)]">{inr(sz.tam, 0)}</b><br />TAM: {count(DEFAULT_SIZING.tamUsers)} unique investors × ₹2,499</p>
                    <p><b className="text-[28px] text-[var(--p-ink)]">{inr(sz.sam, 0)}</b><br />SAM: {count(DEFAULT_SIZING.samUsers)} DIY investors 18–40</p>
                    <p><b className="text-[28px] text-[var(--p-accent)]">{inr(sz.som)}</b><br />SOM: {count(DEFAULT_SIZING.somUsers)} paid users by Year 3</p>
                  </div>
                </div>
              </Block>
              <Block title="Business model">
                <div className="grid grid-cols-4 gap-4">
                  {PRICING.map((t) => (
                    <div key={t.id} className={`rounded-xl border p-4 ${t.highlighted ? 'border-[var(--p-accent)] bg-[var(--p-soft)]' : 'border-[var(--p-line)]'}`}>
                      <div className="text-[22px] font-semibold">{t.name}</div>
                      <div className="mt-2 text-[34px] font-bold leading-none">{t.price}</div>
                      <div className="mt-1 text-[15px] text-[var(--p-muted)]">{t.cadence}</div>
                      <p className="mt-3 text-[16px] leading-snug text-[var(--p-muted)]">{t.audience}</p>
                    </div>
                  ))}
                </div>
              </Block>
            </div>

            <div className="grid grid-cols-[1.25fr_1fr] gap-8">
              <Block title="Financial highlights (estimates)">
                <div className="grid grid-cols-[1fr_300px] items-end gap-8">
                  <RevenueCostBars rows={p} muted="var(--p-muted)" />
                  <div className="space-y-4 text-[18px] text-[var(--p-muted)]">
                    <p><b className="text-[30px] text-[var(--p-ink)]">{inr(p[4].revenue)}</b><br />Year-5 revenue</p>
                    <p><b className="text-[30px] text-[var(--p-ink)]">{firstProfit ? `Year ${firstProfit.year}` : '> Y5'}</b><br />first EBITDA-positive year</p>
                    <p><b className="text-[30px] text-[var(--p-ink)]">{ue.ltvToCac?.toFixed(1)}×</b><br />LTV / CAC · break-even {be.paidUsersNeeded != null ? count(be.paidUsersNeeded) : '—'} Pro users</p>
                  </div>
                </div>
              </Block>
              <Block title="Roadmap">
                <ol className="space-y-5">
                  {ROADMAP.map((r) => (
                    <li key={r.phase} className="border-l-4 border-[var(--p-accent)] pl-5">
                      <div className="text-[16px] uppercase tracking-[0.15em] text-[var(--p-muted)]">{r.phase} · {r.when}</div>
                      <div className="text-[26px] font-semibold">{r.title}</div>
                      <p className="text-[17px] leading-snug text-[var(--p-muted)]">{r.detail}</p>
                    </li>
                  ))}
                </ol>
              </Block>
            </div>

            <footer className="mt-auto flex items-end justify-between border-t border-[var(--p-line)] pt-8">
              <div className="flex gap-10">
                {TEAM.map((t) => (
                  <div key={t.name}>
                    <div className="text-[24px] font-semibold">{t.name}</div>
                    <div className="text-[16px] text-[var(--p-muted)]">{t.role}</div>
                  </div>
                ))}
              </div>
              <div className="text-right text-[20px] text-[var(--p-muted)]">
                <div className="text-[var(--p-ink)]">{REPO_URL}</div>
                <div>Paper trading only. Not investment advice.</div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
