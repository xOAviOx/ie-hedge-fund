import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  FileSearch,
  FlaskConical,
  Gauge,
  Gavel,
  HeartPulse,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Power,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { COMPANY, PROBLEM_STATS, PROBLEM_STORY, TEAM } from '@/lib/company';
import { PERSONAS } from '@/lib/personas';
import Reveal from '@/components/marketing/Reveal';
import SiteFooter from '@/components/marketing/SiteFooter';
import SiteNav from '@/components/marketing/SiteNav';

const ANALYSTS = ['Fundamentals', 'Technical', 'Sentiment', 'Valuation', 'Growth', 'Macro regime'];

const FACTS = [
  { value: '₹10 lakh', label: 'paper fund' },
  { value: '18', label: 'agents vote on every stock' },
  { value: '15:45 IST', label: 'daily run, after the NSE close' },
  { value: '1', label: 'LLM call per run, only to write the memo' },
];

const PIPELINE = [
  {
    title: 'Market data',
    body: 'End-of-day prices, fundamentals and news for NSE and US stocks, fetched once and cached.',
  },
  {
    title: 'The debate',
    body: '6 analyst models and 12 investor personas each vote bullish, bearish or neutral, with a confidence and the factors behind it.',
  },
  {
    title: 'Risk manager',
    body: 'Counts the votes. A direction needs a lead of at least two, and every position gets a size cap.',
  },
  {
    title: 'Portfolio manager',
    body: 'Buys on a confident bullish consensus with at most 30% of cash, and sells holdings on a bearish one.',
  },
  {
    title: 'Paper ledger',
    body: 'Orders fill at the close against the ₹10 lakh paper fund, and NAV is recorded against the benchmark.',
  },
  {
    title: 'Memo and audit trail',
    body: 'One LLM call writes a plain-English memo. Every signal, order and memo is stored for review.',
  },
];

const SURFACES: { href: string; title: string; body: string; icon: LucideIcon }[] = [
  {
    href: '/console',
    title: 'Fund Console',
    body: 'NAV against the NIFTY 50 or S&P 500, positions, cash, recent orders and the kill-switch.',
    icon: LayoutDashboard,
  },
  {
    href: '/decisions',
    title: 'Decision Room',
    body: 'Every run’s debate, verdict and memo, agent by agent.',
    icon: Gavel,
  },
  {
    href: '/score',
    title: 'Stratton Score',
    body: 'One 1–10 number for a stock, from the whole committee’s confidence-weighted vote.',
    icon: Gauge,
  },
  {
    href: '/chat',
    title: 'Ask the Fund',
    body: 'Ask in plain English why the fund holds a stock or what a persona thinks of it.',
    icon: MessageSquare,
  },
  {
    href: '/portfolios',
    title: 'Model portfolios',
    body: '16 portfolios, each following a different investing style, to compare side by side.',
    icon: Briefcase,
  },
  {
    href: '/watchlist',
    title: 'Watchlist alerts',
    body: 'Alerts on price moves, score thresholds and committee consensus flips, also on Telegram.',
    icon: Bell,
  },
  {
    href: '/health-check',
    title: 'Health Check',
    body: 'Put your own holdings in front of the committee and the risk desk.',
    icon: HeartPulse,
  },
  {
    href: '/backtest',
    title: 'Backtest Lab',
    body: 'Replay the pipeline over a past window, point in time, against the benchmark.',
    icon: FlaskConical,
  },
  {
    href: '/risk',
    title: 'Risk Desk',
    body: 'VaR, volatility, beta, Sharpe, drawdown and holdings correlation.',
    icon: ShieldAlert,
  },
  {
    href: '/learn',
    title: 'Learn Hub',
    body: 'Short modules on the personas, the metrics and SEBI’s rules, with quizzes.',
    icon: BookOpen,
  },
];

const TRUST: { title: string; body: string; icon: LucideIcon; href?: string }[] = [
  {
    title: 'Paper trading only',
    body: 'No broker connection and no real money. The fund trades a paper ledger on end-of-day data, in line with SEBI’s 2024 rule on price data.',
    icon: Lock,
    href: '/learn/sebi-real-time-data-rule',
  },
  {
    title: 'Not investment advice',
    body: 'Scores and trades are the output of published rules, shown for learning. They are not recommendations to buy or sell.',
    icon: Scale,
  },
  {
    title: 'Full audit trail',
    body: 'Every run stores each agent’s vote, confidence and factors, the risk verdict, the orders and the memo.',
    icon: FileSearch,
    href: '/learn/reading-the-decision-room',
  },
  {
    title: 'Kill-switch',
    body: 'One switch pauses the fund. A paused fund skips its scheduled runs until it is switched back on.',
    icon: Power,
  },
  {
    title: 'Path to SEBI registration',
    body: 'Before any score is offered as a recommendation, PortAI will register as a SEBI Research Analyst.',
    icon: ClipboardCheck,
    href: '/learn/research-analyst-vs-investment-adviser',
  },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
  maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 40%, transparent 100%)',
  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 40%, transparent 100%)',
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="tnum text-xs uppercase tracking-[0.18em] text-accent">{children}</p>;
}

function Screenshot({ src, alt, caption, aspect }: { src: string; alt: string; caption: string; aspect: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-panel shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <figcaption className="tnum flex items-center justify-between border-b border-line px-4 py-2.5 text-2xs text-muted">
        <span>{caption}</span>
        <span aria-hidden>portai</span>
      </figcaption>
      <div className={aspect}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover object-top" loading="lazy" />
      </div>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID_STYLE} />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 lg:pt-28">
            <Reveal>
              <Eyebrow>AI paper hedge fund · NSE and US equities</Eyebrow>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl">
                {COMPANY.tagline}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70">{COMPANY.oneLiner}</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/console"
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Open the app <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white/5"
                >
                  Take the 2-minute risk quiz
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 md:grid-cols-4">
                {FACTS.map((f) => (
                  <div key={f.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-sm text-muted">{f.label}</dt>
                    <dd className="tnum text-2xl font-semibold text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.2} className="mt-16">
              <Screenshot
                src="/img/05-backtest.png"
                alt="Backtest Lab showing the fund’s equity curve against the NIFTY 50, with total return, Sharpe ratio, max drawdown and the trade log"
                caption="Backtest Lab · one year, four tickers, 34 agent-driven trades"
                aspect="aspect-[16/10]"
              />
            </Reveal>
          </div>
        </section>

        <section id="problem" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <Eyebrow>The problem</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Retail India has access to markets, but not the reasoning.
              </h2>
              <h3 className="mt-10 text-sm font-semibold text-ink">{PROBLEM_STORY.title}</h3>
              {PROBLEM_STORY.paragraphs.slice(0, 2).map((p) => (
                <p key={p} className="mt-4 text-[15px] leading-7 text-ink/70">
                  {p}
                </p>
              ))}
            </Reveal>

            <div className="lg:col-span-7">
              <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                {PROBLEM_STATS.map((s, i) => (
                  <li key={s.label} className="bg-bg">
                    <Reveal delay={i * 0.06} className="flex h-full flex-col p-7">
                      <p className="tnum text-4xl font-semibold tracking-tight text-ink">{s.value}</p>
                      <p className="mt-3 flex-1 text-sm leading-6 text-ink/70">{s.label}</p>
                      <p className="mt-5 text-xs text-muted">
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline decoration-white/20 underline-offset-4 hover:text-ink"
                          >
                            {s.source}
                            <ArrowUpRight className="h-3 w-3" aria-hidden />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        ) : (
                          s.source
                        )}
                        {s.estimate && ' · team estimate'}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <Reveal>
                <p className="mt-8 border-l-2 border-accent pl-5 text-[15px] leading-7 text-ink/85">
                  {PROBLEM_STORY.paragraphs[3]}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="max-w-2xl">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                One disciplined loop, every trading day.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-ink/70">
                At 15:45 IST, after the NSE closes, the fund runs itself. The decisions come from written rules applied to
                real data, so the same inputs always give the same trades.
              </p>
            </Reveal>

            <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {PIPELINE.map((step, i) => (
                <li key={step.title} className="bg-bg">
                  <Reveal delay={i * 0.05} className="h-full p-7">
                    <span className="tnum text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{step.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>

            <div className="mt-20 grid items-center gap-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <h3 className="text-2xl font-semibold tracking-tight text-ink">Every trade has a paper trail.</h3>
                <p className="mt-4 text-[15px] leading-7 text-ink/70">
                  The Decision Room opens each run like a case file: the memo first, then every persona and analyst model
                  with its direction, confidence and the exact rule that fired, and finally the portfolio manager’s
                  order.
                </p>
                <Link
                  href="/learn/reading-the-decision-room"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  How to read the Decision Room <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-7">
                <Screenshot
                  src="/img/03-decision-detail.png"
                  alt="Decision Room run detail: the AI-written fund memo followed by the per-ticker debate of 12 investor personas and 6 analyst models"
                  caption="Decision Room · run detail"
                  aspect="aspect-[4/3]"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <section id="product" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <Eyebrow>Product</Eyebrow>
                <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                  Ten tools around one fund.
                </h2>
              </div>
              <Link href="/console" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                Open the app <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>

            <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
              {SURFACES.map((s) => (
                <li key={s.href} className="bg-bg">
                  <Link href={s.href} className="group flex h-full flex-col p-6 transition-colors hover:bg-panel">
                    <s.icon className="h-5 w-5 text-accent" aria-hidden />
                    <h3 className="mt-5 text-sm font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-ink/60">{s.body}</p>
                    <span className="tnum mt-5 flex items-center gap-1 text-2xs text-muted group-hover:text-accent">
                      {s.href} <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Reveal className="mt-14">
              <Screenshot
                src="/img/01-fund-console.png"
                alt="Fund Console showing net asset value, cash, the NAV versus NIFTY 50 chart, positions, recent orders and the stock universe"
                caption="Fund Console · ₹10,00,000 paper fund"
                aspect="aspect-[16/9]"
              />
            </Reveal>
          </div>
        </section>

        <section id="committee" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="max-w-2xl">
              <Eyebrow>Meet the committee</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Twelve investing styles that rarely agree.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-ink/70">
                Each persona applies a short list of published rules drawn from that investor’s philosophy. Value
                investors and momentum traders read the same stock differently, which is why a broad majority is needed
                before the fund acts.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PERSONAS.map((p, i) => (
                <li key={p.key}>
                  <Reveal delay={(i % 4) * 0.04} className="h-full">
                    <Link
                      href={`/learn/persona-${p.key}`}
                      className="group flex h-full flex-col rounded-xl border border-line p-5 transition-colors hover:border-white/15 hover:bg-panel"
                    >
                      <span
                        aria-hidden
                        className="tnum flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-ink"
                      >
                        {initials(p.name)}
                      </span>
                      <h3 className="mt-4 text-sm font-semibold text-ink">{p.name}</h3>
                      <p className="mt-1.5 flex-1 text-sm leading-6 text-ink/60">{p.blurb}</p>
                      <span className="mt-4 text-2xs text-muted group-hover:text-accent">See the rules →</span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal className="mt-10 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-2 text-muted">Plus six analyst models:</span>
              {ANALYSTS.map((a) => (
                <span key={a} className="rounded-full border border-line px-3 py-1 text-xs text-ink/80">
                  {a}
                </span>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="trust" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="max-w-2xl">
              <Eyebrow>Trust and compliance</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Built to be checked, not taken on faith.
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {TRUST.map((t, i) => (
                <li key={t.title}>
                  <Reveal delay={(i % 3) * 0.05}>
                    <t.icon className="h-5 w-5 text-accent" aria-hidden />
                    <h3 className="mt-4 text-base font-semibold text-ink">{t.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{t.body}</p>
                    {t.href && (
                      <Link href={t.href} className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                        Learn more <ArrowRight className="h-3 w-3" aria-hidden />
                      </Link>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="team" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="max-w-2xl">
              <Eyebrow>Team</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Built by {TEAM.length} founders at {COMPANY.university}.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-ink/70">
                {COMPANY.name} started in {COMPANY.course}, {COMPANY.city}, {COMPANY.founded}.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {TEAM.map((m, i) => (
                <li key={m.name}>
                  <Reveal delay={i * 0.04} className="h-full rounded-xl border border-line p-5">
                    <span
                      aria-hidden
                      className="tnum flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent"
                    >
                      {initials(m.name)}
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-ink">{m.name}</h3>
                    <p className="mt-1 text-xs text-accent">{m.role}</p>
                    <p className="mt-3 text-sm leading-6 text-ink/60">{m.focus}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="waitlist">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal className="rounded-2xl border border-line bg-panel px-8 py-14 sm:px-14">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Watch the committee before you risk a rupee.
                  </h2>
                  <p className="mt-4 text-[15px] leading-7 text-ink/70">
                    The Paper plan is free. Join the waitlist for Pro, Campus or the API and we will email you when it
                    opens.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/pricing#waitlist"
                    className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                  >
                    Join the waitlist <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-md border border-white/15 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white/5"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
