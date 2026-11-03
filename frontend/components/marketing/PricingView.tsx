'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

import { PRICING } from '@/lib/company';
import type { PricingTier } from '@/lib/company';
import { getWaitlistStats, joinWaitlist } from '@/lib/marketing/waitlistApi';
import type { WaitlistPlan, WaitlistStats } from '@/lib/marketing/waitlistApi';

type Billing = 'monthly' | 'yearly';
type Cell = boolean | string;

// Column order matches PRICING: Paper, Pro, Campus, API.
const COMPARISON: { feature: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { feature: 'AI-run ₹10 lakh paper fund', cells: [true, true, true, false] },
  { feature: 'Decision Room audit trail', cells: [true, true, true, 'White-label widgets'] },
  { feature: 'Weekly AI memo', cells: [true, true, true, false] },
  { feature: 'Stratton Scores', cells: ['10 stocks a day', 'Unlimited', 'Unlimited', 'Via REST API'] },
  { feature: 'Persona signals', cells: [true, true, true, 'Via REST API'] },
  { feature: 'Ask the Fund AI chat', cells: [false, true, true, false] },
  { feature: 'Model portfolios', cells: [false, 'All 16', 'All 16', false] },
  { feature: 'Portfolio Health Check', cells: [false, true, true, false] },
  { feature: 'Watchlist alerts on Telegram', cells: [false, true, true, false] },
  { feature: 'Backtests', cells: [false, 'Unlimited', 'Unlimited', false] },
  { feature: 'Learn Hub', cells: ['Full', 'Full', 'Course-aligned modules', false] },
  { feature: 'Inter-college leagues and faculty dashboard', cells: [false, false, true, false] },
  { feature: 'Custom universes and personas', cells: [false, false, false, true] },
  { feature: 'SLA and dedicated support', cells: [false, false, false, true] },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is it real money?',
    a: 'No. Every trade is a paper trade on a simulated ₹10 lakh fund. PortAI has no broker connection and never holds or moves your money.',
  },
  {
    q: 'Is PortAI registered with SEBI?',
    a: 'Not yet. PortAI is education and paper-trading software and does not give investment advice. Registering as a SEBI Research Analyst is on our roadmap, and we will do it before any score is offered as a recommendation.',
  },
  {
    q: 'What data does it use?',
    a: 'End-of-day prices, fundamentals and news for NSE and US stocks from public market-data sources. The fund runs once each weekday at 15:45 IST, after the NSE close. SEBI does not allow real-time prices in virtual-trading products, so we do not use them.',
  },
  {
    q: 'Is the AI just a chatbot guessing?',
    a: 'No. Trading decisions come from 18 rule-based agents whose rules are published in the Learn Hub. A single LLM call per run only writes the plain-English memo.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes. Paid plans will be month to month or yearly, and you can cancel at any time. You keep the free Paper plan, your paper fund and its history.',
  },
  {
    q: 'Does joining the waitlist cost anything?',
    a: 'No. Joining is free and commits you to nothing. We will email you when your plan opens.',
  },
  {
    q: 'How does Campus pricing work?',
    a: 'Campus is billed to the college or finance club, not to individual students. Join the waitlist with the Campus plan and your college name and we will get in touch.',
  },
];

function splitAnnual(note: string): { price: string; rest: string } {
  const m = note.match(/^(\S+)\s+(.*)$/);
  return m ? { price: m[1], rest: m[2] } : { price: note, rest: '' };
}

function isPlan(v: string | null): v is WaitlistPlan {
  return PRICING.some((t) => t.id === v);
}

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <Check className="mx-auto h-4 w-4 text-accent" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden className="text-white/20">
          —
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-ink/85">{value}</span>;
}

function TierCard({ tier, onChoose }: { tier: PricingTier; onChoose: (id: WaitlistPlan) => void }) {
  const [billing, setBilling] = useState<Billing>('monthly');
  const yearly = tier.id === 'pro' && billing === 'yearly' && tier.annualNote;
  const annual = tier.annualNote ? splitAnnual(tier.annualNote) : null;

  return (
    <li
      className={clsx(
        'relative flex flex-col rounded-xl border p-7',
        tier.highlighted ? 'border-accent/60 bg-panel shadow-[0_0_0_1px_rgba(76,143,232,0.25)]' : 'border-line',
      )}
    >
      {tier.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-accent px-2.5 py-0.5 text-2xs font-semibold text-white">
          Most popular
        </span>
      )}
      <h2 className="text-base font-semibold text-ink">{tier.name}</h2>
      <p className="mt-1 min-h-[40px] text-sm text-muted">{tier.audience}</p>

      {tier.id === 'pro' && tier.annualNote && (
        <div role="group" aria-label="Billing period" className="mt-5 inline-flex self-start rounded-md border border-line p-0.5 text-xs">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={billing === b}
              onClick={() => setBilling(b)}
              className={clsx(
                'rounded px-3 py-1 capitalize transition-colors',
                billing === b ? 'bg-white/10 text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <p className="mt-5 flex items-baseline gap-2">
        <span className="tnum text-4xl font-semibold tracking-tight text-ink">
          {yearly && annual ? annual.price : tier.price}
        </span>
        <span className="text-sm text-muted">{yearly && annual ? annual.rest : tier.cadence}</span>
      </p>
      {tier.id !== 'pro' && tier.annualNote && <p className="mt-1 text-xs text-muted">{tier.annualNote}</p>}

      <ul className="mt-7 flex-1 space-y-3 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-2.5 text-ink/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChoose(tier.id)}
        className={clsx(
          'mt-8 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
          tier.highlighted ? 'bg-accent text-white hover:bg-accent/90' : 'border border-white/15 text-ink hover:bg-white/5',
        )}
      >
        {tier.cta}
      </button>
    </li>
  );
}

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'done'; position: number } | { kind: 'error'; message: string };

function WaitlistForm({
  plan,
  setPlan,
  emailRef,
}: {
  plan: WaitlistPlan;
  setPlan: (p: WaitlistPlan) => void;
  emailRef: React.RefObject<HTMLInputElement>;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  const loadStats = useCallback(() => {
    getWaitlistStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'submitting' });
    try {
      const res = await joinWaitlist({ email, plan, name, college });
      setStatus({ kind: 'done', position: res.position });
      loadStats();
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' });
    }
  };

  const field =
    'mt-1.5 w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent/60';

  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="scroll-mt-20">
      <div className="grid gap-12 rounded-2xl border border-line bg-panel p-8 sm:p-12 lg:grid-cols-2">
        <div>
          <h2 id="waitlist-title" className="text-3xl font-semibold tracking-tight text-ink">
            Join the waitlist
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-ink/70">
            Pick a plan and we will email you when it opens. If you already joined, submitting again updates your
            plan.
          </p>
          {stats && (
            <p className="mt-8 text-sm text-muted" aria-live="polite">
              <span className="tnum text-3xl font-semibold text-ink">{stats.total.toLocaleString('en-IN')}</span>{' '}
              {stats.total === 1 ? 'person has' : 'people have'} joined so far.
            </p>
          )}
        </div>

        {status.kind === 'done' ? (
          <div role="status" className="flex flex-col justify-center rounded-xl border border-accent/30 bg-accent/[0.06] p-8">
            <Check className="h-6 w-6 text-accent" aria-hidden />
            <p className="mt-4 text-2xl font-semibold text-ink">
              You’re <span className="tnum">#{status.position.toLocaleString('en-IN')}</span> on the waitlist.
            </p>
            <p className="mt-2 text-sm text-muted">We will email {email.trim()} when your plan opens.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="wl-email" className="text-sm text-ink">
                Email
              </label>
              <input
                id="wl-email"
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="wl-plan" className="text-sm text-ink">
                Plan
              </label>
              <select
                id="wl-plan"
                value={plan}
                onChange={(e) => isPlan(e.target.value) && setPlan(e.target.value)}
                className={field}
              >
                {PRICING.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.price} {t.cadence}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wl-name" className="text-sm text-ink">
                  Name <span className="text-muted">(optional)</span>
                </label>
                <input
                  id="wl-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="wl-college" className="text-sm text-ink">
                  College <span className="text-muted">(optional)</span>
                </label>
                <input
                  id="wl-college"
                  autoComplete="organization"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className={field}
                />
              </div>
            </div>
            {status.kind === 'error' && (
              <p role="alert" className="border-l-2 border-white/30 pl-3 text-sm text-ink">
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={status.kind === 'submitting'}
              className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {status.kind === 'submitting' ? 'Joining…' : 'Join the waitlist'}
            </button>
            <p className="text-xs text-muted">We only use your email to tell you about PortAI. No spam.</p>
          </form>
        )}
      </div>
    </section>
  );
}

export default function PricingView() {
  const [plan, setPlan] = useState<WaitlistPlan>('pro');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('plan');
    if (isPlan(fromUrl)) setPlan(fromUrl);
  }, []);

  const choose = (id: WaitlistPlan) => {
    setPlan(id);
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    emailRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-28 px-6 pb-28 pt-20">
      <header className="max-w-2xl">
        <p className="tnum text-xs uppercase tracking-[0.18em] text-accent">Pricing</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-5xl">
          Free to learn. Paid when you want more of the committee.
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-ink/70">
          Every plan is paper trading on end-of-day data. Paid plans are not open yet: choose one to join its waitlist.
        </p>
      </header>

      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PRICING.map((t) => (
          <TierCard key={t.id} tier={t} onChoose={choose} />
        ))}
      </ul>

      <section aria-labelledby="compare-title">
        <h2 id="compare-title" className="text-2xl font-semibold tracking-tight text-ink">
          Compare plans
        </h2>
        <div className="mt-8 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-panel">
                <th scope="col" className="px-5 py-4 text-left font-medium text-muted">
                  Feature
                </th>
                {PRICING.map((t) => (
                  <th
                    key={t.id}
                    scope="col"
                    className={clsx('px-5 py-4 text-center font-semibold', t.highlighted ? 'text-accent' : 'text-ink')}
                  >
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-3.5 text-left font-normal text-ink/85">
                    {row.feature}
                  </th>
                  {row.cells.map((c, i) => (
                    <td key={PRICING[i].id} className="px-5 py-3.5 text-center">
                      <CellValue value={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="grid gap-10 lg:grid-cols-12">
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight text-ink lg:col-span-4">
          Questions
        </h2>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <WaitlistForm plan={plan} setPlan={setPlan} emailRef={emailRef} />
    </div>
  );
}
