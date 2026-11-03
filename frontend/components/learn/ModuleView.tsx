'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Circle } from 'lucide-react';

import { TRACKS, getModule, neighbours } from '@/lib/learn';
import Quiz from '@/components/learn/Quiz';
import { useLearnProgress } from '@/components/learn/useLearnProgress';

export default function ModuleView({ slug }: { slug: string }) {
  const mod = getModule(slug);
  const { completed, ready, setDone } = useLearnProgress();
  if (!mod) return null;

  const track = TRACKS.find((t) => t.id === mod.track);
  const { prev, next } = neighbours(slug);
  const done = completed.has(slug);

  return (
    <article className="mx-auto max-w-3xl px-6 py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/learn" className="hover:text-ink">
          Learn Hub
        </Link>
        <span aria-hidden> / </span>
        <span>{track?.title}</span>
      </nav>

      <p className="mt-4 text-lg leading-relaxed text-ink/90">{mod.summary}</p>
      <p className="mt-2 text-xs text-muted">{mod.minutes} min read</p>

      <div className="mt-8 space-y-8">
        {mod.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-base font-semibold text-ink">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 text-sm leading-7 text-ink/80">
                {p}
              </p>
            ))}
            {s.formula && (
              <p className="tnum mt-3 rounded-md border border-line bg-panel2 px-4 py-3 text-sm text-ink">{s.formula}</p>
            )}
            {s.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-ink/80 marker:text-muted">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {mod.rules && (
          <section>
            <h2 className="text-base font-semibold text-ink">The exact rules</h2>
            <p className="mt-3 text-sm leading-7 text-ink/80">
              Each rule is checked in order and only its first matching condition counts. If a figure is missing, the
              rule is skipped.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel2 text-2xs uppercase tracking-wider text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Metric</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">When</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {mod.rules.map((g) =>
                    g.branches.map((b, i) => (
                      <tr key={`${g.metric}-${b.when}`} className={clsx(i === 0 && 'border-t border-line')}>
                        <td className="px-4 py-2.5 align-top text-ink">{i === 0 ? g.metric : ''}</td>
                        <td className="px-4 py-2.5 align-top text-ink/80">{b.when}</td>
                        <td className="tnum whitespace-nowrap px-4 py-2.5 text-right align-top text-ink">
                          +{b.points} {b.vote === 'bull' ? 'bullish' : 'bearish'}
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/80">
              Adding it up: the persona votes bullish when bullish points exceed bearish points by at least two, with
              confidence of 55 plus 8 per bullish point (capped at 90). Bearish works the same way in reverse. Anything
              closer is neutral, with confidence of 50 plus 5 per point of difference.
            </p>
          </section>
        )}

        <aside aria-labelledby="takeaways" className="rounded-lg border border-accent/25 bg-accent/[0.06] p-6">
          <h2 id="takeaways" className="text-sm font-semibold text-ink">
            Key takeaways
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/85">
            {mod.takeaways.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </aside>

        <Quiz key={slug} questions={mod.quiz} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={!ready}
            onClick={() => setDone(slug, !done)}
            aria-pressed={done}
            className={clsx(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
              done ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line text-ink hover:bg-white/5',
            )}
          >
            {done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
            {done ? 'Completed' : 'Mark complete'}
          </button>
          {mod.related && (
            <Link href={mod.related.href} className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
              {mod.related.label}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <nav aria-label="Module navigation" className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="group rounded-lg border border-line p-4 hover:bg-white/[0.03]">
            <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-muted">
              <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
            </span>
            <span className="mt-1 block text-sm text-ink group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/learn/${next.slug}`}
            className="group rounded-lg border border-line p-4 text-right hover:bg-white/[0.03]"
          >
            <span className="flex items-center justify-end gap-1.5 text-2xs uppercase tracking-wider text-muted">
              Next <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
            <span className="mt-1 block text-sm text-ink group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
