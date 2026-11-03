// The pitch deck slides. Each slide renders on a fixed 1600×900 stage that the
// page scales to the viewport.
'use client';

import React from 'react';
import { clsx } from 'clsx';

import { COMPANY, PRICING, PROBLEM_STATS, TEAM } from '@/lib/company';
import { HOW_IT_WORKS, SOLUTION } from '@/lib/venture/product';
import { HC_PLACEMENTS, HC_QUADRANTS, JUGAAD, type HCQuadrant } from '@/lib/venture/strategy';
import { SEGMENTS, VPCS } from '@/lib/venture/customers';
import { ASK, REGULATORY, ROADMAP } from '@/lib/venture/model';
import { DEFAULT_ASSUMPTIONS, DEFAULT_PROJECTION, breakEven, count, inr, unitEconomics } from '@/lib/venture/financials';
import { DEFAULT_SIZING, sizing } from '@/lib/venture/sizing';
import { money, pct } from '@/lib/format';
import { NestedCircles, PositioningMap, RevenueCostBars } from './charts';
import type { LiveFacts } from './hooks';

export const REPO_URL = 'github.com/xOAviOx/ie-hedge-fund';

export interface Slide {
  id: string;
  notes: string;
  render: (ctx: { facts: LiveFacts; origin: string }) => React.ReactNode;
}

function Frame({ kicker, title, children }: { kicker: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col px-[110px] py-[80px]">
      <div className="text-[20px] font-medium uppercase tracking-[0.2em] text-accent">{kicker}</div>
      <h2 className="mt-4 max-w-[1300px] text-[56px] font-semibold leading-[1.1] tracking-tight text-ink">{title}</h2>
      <div className="mt-12 flex-1">{children}</div>
    </div>
  );
}

const Big = ({ value, label, cls }: { value: React.ReactNode; label: React.ReactNode; cls?: string }) => (
  <div>
    <div className={clsx('tnum text-[64px] font-semibold leading-none tracking-tight', cls ?? 'text-ink')}>{value}</div>
    <div className="mt-3 text-[22px] leading-snug text-muted">{label}</div>
  </div>
);

const p = DEFAULT_PROJECTION;
const sz = sizing(DEFAULT_SIZING);
const ue = unitEconomics(DEFAULT_ASSUMPTIONS);
const be = breakEven(DEFAULT_ASSUMPTIONS, 2);
const firstProfit = p.find((r) => r.ebitda > 0);

export const SLIDES: Slide[] = [
  {
    id: 'title',
    notes: 'Introduce the team and the one-line idea. Pause on the tagline.',
    render: () => (
      <div className="flex h-full flex-col justify-between px-[110px] py-[90px]">
        <div className="text-[20px] uppercase tracking-[0.2em] text-muted">{COMPANY.course} · {COMPANY.university}</div>
        <div>
          <div className="text-[150px] font-bold leading-none tracking-tighter text-ink">{COMPANY.name}</div>
          <div className="mt-6 text-[48px] font-medium text-accent">{COMPANY.tagline}</div>
        </div>
        <div className="flex gap-12 text-[22px]">
          {TEAM.map((t) => (
            <div key={t.name}>
              <div className="font-semibold text-ink">{t.name}</div>
              <div className="text-[17px] text-muted">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'problem',
    notes: 'Tell Rohan’s story in 20 seconds: ₹25,000 of savings, ₹18,000 lost on tips and options. Then the SEBI number: he is the norm, not the exception.',
    render: () => (
      <Frame kicker="The problem" title="Retail India has access to markets, but not the reasoning.">
        <div className="grid grid-cols-3 gap-16">
          {PROBLEM_STATS.slice(0, 3).map((s) => (
            <Big key={s.label} value={s.value} label={<>{s.label}<div className="mt-2 text-[15px] text-muted/70">{s.source}</div></>} />
          ))}
        </div>
        <p className="mt-16 max-w-[1200px] text-[28px] leading-snug text-muted">
          Advice is an opaque tip, an unregulated influencer, or a professional product with a <span className="text-ink">₹50 lakh minimum</span>.
        </p>
      </Frame>
    ),
  },
  {
    id: 'solution',
    notes: 'One sentence: an AI investment committee you can audit. Walk the five steps left to right.',
    render: () => (
      <Frame kicker="The solution" title={SOLUTION.differentiator}>
        <div className="grid grid-cols-5 gap-5">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.step} className="rounded-xl border border-line bg-panel p-6">
              <div className="tnum text-[18px] text-accent">0{i + 1}</div>
              <div className="mt-3 text-[30px] font-semibold text-ink">{s.step}</div>
              <p className="mt-3 text-[18px] leading-snug text-muted">{s.detail}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    id: 'demo',
    notes: 'These numbers are live from the running product. Switch to the Decision Room tab to show one run’s debate if time allows.',
    render: ({ facts, origin }) => (
      <Frame kicker="Live product" title="It already works — these numbers are live.">
        <div className="grid grid-cols-3 gap-x-16 gap-y-14">
          <Big value={money(facts.nav, 'INR', 0)} label="Paper fund NAV" />
          <Big value={pct(facts.navReturnPct)} label="Return since start" cls={facts.navReturnPct == null ? 'text-ink' : facts.navReturnPct >= 0 ? 'text-up' : 'text-down'} />
          <Big value={facts.runs ?? '—'} label="Autonomous fund runs" />
          <Big value={facts.agents} label={`Agents (${facts.personas} investor personas)`} />
          <Big value={facts.orders ?? '—'} label="Paper orders, each explained" />
          <Big value={facts.waitlist ?? '—'} label="People on the Pro waitlist" />
        </div>
        <div className="mt-14 text-[20px] text-muted">
          {facts.live ? 'Live from' : 'API offline — start the backend to show live data at'} <span className="text-ink">{origin}/console</span>
        </div>
      </Frame>
    ),
  },
  {
    id: 'innovation',
    notes: 'Henderson-Clark: the components exist; the innovation is how we connect them. Mention jugaad: the whole run costs a fraction of a rupee.',
    render: () => {
      const order: HCQuadrant[] = ['incremental', 'modular', 'architectural', 'radical'];
      return (
        <Frame kicker="Innovation" title="Architectural innovation: familiar parts, new architecture.">
          <div className="grid grid-cols-[1fr_520px] gap-16">
            <div className="grid grid-cols-2 gap-4">
              {order.map((q) => {
                const items = HC_PLACEMENTS.filter((h) => h.quadrant === q);
                const ours = items.some((h) => h.us);
                return (
                  <div key={q} className={clsx('rounded-xl border p-6', ours ? 'border-accent bg-accent/10' : 'border-line bg-panel')}>
                    <div className={clsx('text-[28px] font-semibold', ours ? 'text-accent' : 'text-ink')}>{HC_QUADRANTS[q].title}</div>
                    <div className="mt-2 text-[16px] text-muted">{HC_QUADRANTS[q].rule}</div>
                    <div className="mt-4 text-[19px] text-ink/90">{items.map((h) => h.name).join(' · ') || '—'}</div>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="text-[18px] uppercase tracking-[0.15em] text-muted">{JUGAAD.title}</div>
              <ul className="mt-5 space-y-4 text-[22px] leading-snug text-muted">
                {JUGAAD.points.slice(0, 3).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Frame>
      );
    },
  },
  {
    id: 'market',
    notes: 'TAM is every unique NSE investor at our Pro price — an upper bound. SOM equals Year-3 paid users in our model. All estimates.',
    render: () => (
      <Frame kicker="Market (estimates)" title="A large market; we start with a focused slice.">
        <div className="grid grid-cols-[520px_1fr] items-center gap-20">
          <NestedCircles tam={sz.tam} sam={sz.sam} som={sz.som} />
          <div className="space-y-10">
            <Big value={inr(sz.tam, 0)} label={`TAM — ${count(DEFAULT_SIZING.tamUsers)} unique investors (NSE, Jan 2025) × ₹2,499`} />
            <Big value={inr(sz.sam, 0)} label={`SAM — ${count(DEFAULT_SIZING.samUsers)} digitally active DIY investors aged 18–40`} />
            <Big value={inr(sz.som)} label={`SOM — ${count(DEFAULT_SIZING.somUsers)} paid users by Year 3`} cls="text-accent" />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    id: 'competition',
    notes: 'Everyone either automates or explains. Nobody does both. Brokers automate execution, quant products stay opaque, screeners leave the work to you.',
    render: () => (
      <Frame kicker="Competition" title="Nobody combines automation with full explainability.">
        <div className="mx-auto max-w-[820px]">
          <PositioningMap compact />
        </div>
      </Frame>
    ),
  },
  {
    id: 'customer',
    notes: 'Beachhead is students like us. Be honest: interviews are in progress — mention how many are logged.',
    render: () => {
      const v = VPCS[0];
      return (
        <Frame kicker="Customer and value proposition" title={`Beachhead: ${SEGMENTS[0].name.toLowerCase()} (${SEGMENTS[0].age}).`}>
          <div className="grid grid-cols-3 gap-10">
            {[
              { h: 'Their pains', items: v.pains },
              { h: 'What we relieve', items: v.relievers },
              { h: 'What they gain', items: v.creators },
            ].map((c) => (
              <div key={c.h} className="rounded-xl border border-line bg-panel p-8">
                <div className="text-[18px] uppercase tracking-[0.15em] text-accent">{c.h}</div>
                <ul className="mt-5 space-y-4 text-[24px] leading-snug text-ink/90">
                  {c.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[20px] text-muted">Next: DIY investors 25–40, colleges, then brokers and edtech via API.</p>
        </Frame>
      );
    },
  },
  {
    id: 'model',
    notes: 'Freemium. Free is cheap to serve because the engine is deterministic. Campus contracts bring hundreds of students per sale.',
    render: () => (
      <Frame kicker="Business model" title="Free to learn. Pay for depth.">
        <div className="grid grid-cols-4 gap-6">
          {PRICING.map((t) => (
            <div key={t.id} className={clsx('rounded-xl border p-8', t.highlighted ? 'border-accent bg-accent/10' : 'border-line bg-panel')}>
              <div className="text-[24px] font-semibold text-ink">{t.name}</div>
              <div className="tnum mt-4 text-[52px] font-semibold text-ink">{t.price}</div>
              <div className="text-[18px] text-muted">{t.cadence}</div>
              <div className="mt-6 text-[19px] leading-snug text-muted">{t.audience}</div>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    id: 'financials',
    notes: 'All estimates. Say the break-even number and the LTV/CAC. Point out Campus and API reduce reliance on consumer conversion.',
    render: () => (
      <Frame kicker="Financials (estimates)" title={`${inr(p[0].revenue)} in Year 1 to ${inr(p[4].revenue)} in Year 5.`}>
        <div className="grid grid-cols-[1fr_520px] gap-16">
          <div>
            <RevenueCostBars rows={p} />
            <div className="mt-2 text-[16px] text-muted">Blue: revenue · Grey: total cost</div>
          </div>
          <div className="space-y-10">
            <Big value={firstProfit ? `Year ${firstProfit.year}` : '> Y5'} label="First EBITDA-positive year" />
            <Big value={be.paidUsersNeeded != null ? count(be.paidUsersNeeded) : '—'} label="Pro users to break even on the Year-3 cost base" />
            <Big value={`${ue.ltvToCac?.toFixed(1) ?? '—'}×`} label={`LTV / CAC (LTV ${inr(ue.ltv)}, CAC ${inr(ue.cac)})`} />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    id: 'moat',
    notes: 'Regulation is our moat: we are built for SEBI’s AI-disclosure duty and the black-box algo rule. Phase 2 is RA registration.',
    render: () => (
      <Frame kicker="Regulatory moat and roadmap" title="Built for where SEBI is going.">
        <div className="grid grid-cols-3 gap-6">
          {ROADMAP.map((r, i) => (
            <div key={r.phase} className={clsx('rounded-xl border p-8', i === 0 ? 'border-accent bg-accent/10' : 'border-line bg-panel')}>
              <div className="text-[18px] uppercase tracking-[0.15em] text-accent">{r.phase} · {r.when}</div>
              <div className="mt-3 text-[32px] font-semibold text-ink">{r.title}</div>
              <p className="mt-4 text-[20px] leading-snug text-muted">{r.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-12 gap-y-3 text-[19px] text-muted">
          {REGULATORY.slice(1).map((r) => (
            <div key={r.rule}>• <span className="text-ink">{r.rule}</span></div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    id: 'ask',
    notes: 'State the ask clearly, then the milestone it buys: SEBI RA registration and the Year-2 user target.',
    render: () => (
      <Frame kicker="The ask" title={<>{ASK.label} for {ASK.runwayMonths} months.</>}>
        <div className="grid grid-cols-[1fr_420px] gap-20">
          <div className="space-y-7">
            {ASK.useOfFunds.map((u) => (
              <div key={u.item}>
                <div className="flex justify-between text-[24px]">
                  <span className="text-ink">{u.item}</span>
                  <span className="tnum text-muted">{u.pct}% · {inr((ASK.amount * u.pct) / 100, 1)}</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-8 text-[24px] leading-snug text-muted">
            <div className="text-[18px] uppercase tracking-[0.15em] text-accent">Milestones it buys</div>
            <p>SEBI Research Analyst registration</p>
            <p>{count(p[1].users)} registered users and {DEFAULT_ASSUMPTIONS.colleges[1]} campus partners</p>
            <p>First API partner</p>
          </div>
        </div>
      </Frame>
    ),
  },
  {
    id: 'thanks',
    notes: 'Thank the panel and invite them to try the product. Leave this slide up during questions.',
    render: ({ origin }) => (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="text-[110px] font-bold tracking-tighter text-ink">Thank you</div>
        <div className="mt-4 text-[36px] text-accent">{COMPANY.tagline}</div>
        <div className="mt-16 space-y-3 text-[24px] text-muted">
          <div>Try it: <span className="text-ink">{origin}</span></div>
          <div>Code: <span className="text-ink">{REPO_URL}</span></div>
          <div className="pt-6 text-[18px]">{TEAM.map((t) => t.name).join(' · ')}</div>
        </div>
      </div>
    ),
  },
];
