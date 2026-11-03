'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

import { MODULES, TRACKS, modulesInTrack } from '@/lib/learn';
import { useLearnProgress } from '@/components/learn/useLearnProgress';

export default function LearnIndex() {
  const { completed } = useLearnProgress();
  const doneCount = MODULES.filter((m) => completed.has(m.slug)).length;
  const pct = Math.round((doneCount / MODULES.length) * 100);
  const firstOpen = MODULES.find((m) => !completed.has(m.slug));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
      <section aria-labelledby="progress" className="panel flex flex-wrap items-center gap-6 p-5">
        <div className="min-w-[240px] flex-1">
          <div className="flex items-baseline justify-between">
            <h2 id="progress" className="label">
              Your progress
            </h2>
            <span className="tnum text-xs text-muted">
              {doneCount} / {MODULES.length} modules
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Modules completed"
          >
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {firstOpen && (
          <Link
            href={`/learn/${firstOpen.slug}`}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            {doneCount === 0 ? 'Start with' : 'Continue with'} “{firstOpen.title}”
          </Link>
        )}
      </section>

      {TRACKS.map((track, ti) => {
        const mods = modulesInTrack(track.id);
        const trackDone = mods.filter((m) => completed.has(m.slug)).length;
        return (
          <section key={track.id} aria-labelledby={`track-${track.id}`}>
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
              <div>
                <p className="tnum text-2xs text-muted">Track {ti + 1}</p>
                <h2 id={`track-${track.id}`} className="text-base font-semibold text-ink">
                  {track.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted">{track.description}</p>
              </div>
              <span className="tnum text-xs text-muted">
                {trackDone} / {mods.length}
              </span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mods.map((m) => {
                const done = completed.has(m.slug);
                return (
                  <li key={m.slug}>
                    <Link
                      href={`/learn/${m.slug}`}
                      className="panel flex h-full flex-col gap-2 p-4 transition-colors hover:border-white/15 hover:bg-panel2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium text-ink">{m.title}</h3>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-label="Completed" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-white/20" aria-label="Not completed" />
                        )}
                      </div>
                      <p className="flex-1 text-xs leading-5 text-muted">{m.summary}</p>
                      <span className="flex items-center gap-1 text-2xs text-muted">
                        <Clock className="h-3 w-3" aria-hidden /> {m.minutes} min
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
