'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

import { useInvestorProfile, useQuizQuestions, useSubmitProfile } from '@/lib/hooks';
import { dateTime, tickerLabel } from '@/lib/format';
import { PERSONAS } from '@/lib/personas';
import type { InvestorProfile } from '@/lib/types';
import { Badge, ErrorState, Loading, Spinner } from '@/components/ui';

const MARKETS: Record<InvestorProfile['mandate']['markets'], string> = { india: 'India', us: 'US', both: 'India + US' };
const STYLES: Record<InvestorProfile['mandate']['style'], string> = {
  value: 'Value',
  growth: 'Growth',
  momentum: 'Momentum',
  committee: 'Committee decides',
};

function personaName(key: string): string {
  return PERSONAS.find((p) => p.key === key)?.name ?? key;
}

function RiskGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg width={180} height={112} viewBox="0 0 100 62" aria-label={`Risk score ${v} of 100`}>
      <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        fill="none"
        stroke="#4c8fe8"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${v} 100`}
      />
      <text x="50" y="50" textAnchor="middle" fill="#e6e8ec" fontSize="20" fontWeight="600" fontFamily="JetBrains Mono, monospace">
        {Math.round(v)}
      </text>
    </svg>
  );
}

function ProfileResult({
  profile,
  onApply,
  applying,
  applyError,
  onRetake,
}: {
  profile: InvestorProfile;
  onApply: () => void;
  applying: boolean;
  applyError: unknown;
  onRetake: () => void;
}) {
  const m = profile.mandate;
  const personas = m.active_personas.filter((k) => k !== 'all');
  return (
    <div className="panel p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="label">Your risk profile</span>
        <RiskGauge value={profile.risk_score} />
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{profile.profile}</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted">{profile.summary}</p>
      </div>

      <div className="mt-6 space-y-4 border-t border-line pt-5">
        <div className="label">Recommended mandate</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="label">Position cap</div>
            <div className="tnum text-lg font-semibold text-ink">{m.position_cap_pct}%</div>
          </div>
          <div>
            <div className="label">Markets</div>
            <div className="text-sm text-ink">{MARKETS[m.markets]}</div>
          </div>
          <div>
            <div className="label">Style</div>
            <div className="text-sm text-ink">{STYLES[m.style]}</div>
          </div>
        </div>
        <div>
          <div className="label mb-1.5">Personas</div>
          <div className="flex flex-wrap gap-1.5">
            {personas.length === 0 ? (
              <Badge tone="accent">Full committee (all 12)</Badge>
            ) : (
              personas.map((k) => (
                <Badge key={k} tone="accent">
                  {personaName(k)}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="label mb-1.5">Universe ({m.universe.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {m.universe.map((t) => (
              <span key={t} className="tnum rounded border border-line bg-panel2 px-2 py-1 text-2xs text-muted">
                {tickerLabel(t)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {applyError != null && (
        <div className="mt-4 rounded-md border border-down/25 bg-down/10 px-3 py-2 text-2xs text-down">
          {applyError instanceof Error ? applyError.message : 'Could not apply the mandate'}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <button onClick={onRetake} className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink">
          <RotateCcw size={13} /> Retake quiz
        </button>
        <div className="flex items-center gap-2">
          {profile.applied ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-ink">
                <Check size={14} className="text-accent" /> Applied to your fund
              </span>
              <Link
                href="/console"
                className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Go to console <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/console"
                className="rounded-md border border-line px-4 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                Skip
              </Link>
              <button
                onClick={onApply}
                disabled={applying}
                className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {applying ? <Spinner className="h-3.5 w-3.5" /> : <Check size={14} />}
                Apply to my fund
              </button>
            </>
          )}
        </div>
      </div>
      <p className="mt-3 text-2xs text-muted">Taken {dateTime(profile.created_at)} · paper fund, not financial advice.</p>
    </div>
  );
}

export default function OnboardingPage() {
  const questions = useQuizQuestions();
  const existing = useInvestorProfile();
  const submit = useSubmitProfile();

  const [retaking, setRetaking] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // Held locally so the result stays on screen while an apply request is pending.
  const [result, setResult] = useState<InvestorProfile | null>(null);

  const qs = questions.data?.questions ?? [];
  const profile = result ?? (retaking ? undefined : existing.data ?? undefined);
  const showQuiz = !profile;
  const q = qs[step];
  const isLast = step === qs.length - 1;

  const restart = () => {
    submit.reset();
    setResult(null);
    setAnswers({});
    setStep(0);
    setRetaking(true);
  };

  const next = () => {
    if (isLast) submit.mutate({ answers, apply: false }, { onSuccess: setResult });
    else setStep((s) => s + 1);
  };

  const apply = () => {
    if (!profile) return;
    submit.mutate({ answers: profile.answers, apply: true }, { onSuccess: setResult });
  };

  let body: React.ReactNode;
  if (questions.isLoading || existing.isLoading) {
    body = <Loading label="Loading quiz" />;
  } else if (questions.isError || existing.isError) {
    body = (
      <ErrorState
        error={questions.error ?? existing.error}
        onRetry={() => {
          questions.refetch();
          existing.refetch();
        }}
      />
    );
  } else if (profile) {
    body = (
      <ProfileResult
        profile={profile}
        onApply={apply}
        applying={submit.isPending}
        applyError={submit.isError ? submit.error : null}
        onRetake={restart}
      />
    );
  } else if (!q) {
    body = <ErrorState error={new Error('No quiz questions available.')} onRetry={() => questions.refetch()} />;
  } else {
    const selected = answers[q.id];
    body = (
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <span className="label">
            Question <span className="tnum">{step + 1}</span> of <span className="tnum">{qs.length}</span>
          </span>
          <span className="tnum text-2xs text-muted">{Math.round(((step + (selected != null ? 1 : 0)) / qs.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((step + (selected != null ? 1 : 0)) / qs.length) * 100}%` }}
          />
        </div>

        <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink">{q.text}</h2>
        {q.help && <p className="mt-1 text-xs text-muted">{q.help}</p>}

        <div className="mt-5 space-y-2">
          {q.options.map((o, i) => {
            const on = selected === i;
            return (
              <button
                key={o.label}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors',
                  on ? 'border-accent/50 bg-accent/10 text-ink' : 'border-line text-ink/90 hover:bg-white/[0.03]',
                )}
              >
                <span
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    on ? 'border-accent bg-accent text-white' : 'border-line',
                  )}
                >
                  {on && <Check size={10} />}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>

        {submit.isError && (
          <div className="mt-4 rounded-md border border-down/25 bg-down/10 px-3 py-2 text-2xs text-down">
            {submit.error instanceof Error ? submit.error.message : 'Could not score your answers'}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={next}
            disabled={selected == null || submit.isPending}
            className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submit.isPending && <Spinner className="h-3.5 w-3.5" />}
            {isLast ? 'See my profile' : 'Next'} {!submit.isPending && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
            <ShieldCheck size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-ink">PortAI</div>
            <div className="text-2xs uppercase tracking-widest text-muted">Risk profile</div>
          </div>
        </Link>
        <Link href="/console" className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink">
          <ArrowLeft size={14} /> Back to the app
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {showQuiz && !questions.isLoading && (
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Tune the fund to you</h1>
              <p className="mt-1 text-sm text-muted">
                {qs.length || 7} quick questions. We map your answers to a risk profile and a fund mandate.
              </p>
            </div>
          )}
          {body}
        </div>
      </main>
    </div>
  );
}
