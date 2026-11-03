'use client';

import { useId, useState } from 'react';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';

import type { QuizQuestion } from '@/lib/learn';

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const id = useId();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter((p, i) => p === questions[i].answer).length;

  const choose = (qi: number, oi: number) => setPicked((prev) => prev.map((p, i) => (i === qi ? oi : p)));

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border border-line bg-panel p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`${id}-title`} className="text-base font-semibold text-ink">
          Check yourself
        </h2>
        <p className="tnum text-xs text-muted" aria-live="polite">
          {answered === 0 ? `${questions.length} questions` : `${correct} of ${questions.length} correct`}
        </p>
      </div>

      <ol className="mt-5 space-y-6">
        {questions.map((q, qi) => {
          const choice = picked[qi];
          const isRight = choice === q.answer;
          return (
            <li key={q.question}>
              <fieldset>
                <legend className="text-sm font-medium text-ink">
                  {qi + 1}. {q.question}
                </legend>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = choice === oi;
                    return (
                      <label
                        key={opt}
                        className={clsx(
                          'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
                          selected && isRight && 'border-accent/60 bg-accent/10 text-ink',
                          selected && !isRight && 'border-white/25 bg-white/5 text-ink',
                          !selected && 'border-line text-ink/85 hover:bg-white/[0.03]',
                        )}
                      >
                        <input
                          type="radio"
                          name={`${id}-q${qi}`}
                          checked={selected}
                          onChange={() => choose(qi, oi)}
                          className="accent-accent"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
                {choice !== null && (
                  <p className="mt-3 flex items-start gap-2 text-sm text-muted" role="status">
                    {isRight ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                    )}
                    <span>
                      <span className="font-medium text-ink">{isRight ? 'Correct.' : 'Not quite.'}</span>{' '}
                      {isRight ? q.explanation : 'Try another option.'}
                    </span>
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
