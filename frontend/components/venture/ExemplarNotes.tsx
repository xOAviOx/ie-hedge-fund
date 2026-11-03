'use client';

import { useInterviews } from './hooks';

/** Exemplar interactions rendered for the printed report (light paper styling). */
export default function ExemplarNotes() {
  const { data, isError } = useInterviews('exemplar');
  if (isError || !data || data.length === 0)
    return (
      <p>
        No interactions logged yet. The course requires at least two; notes will appear here automatically once they are added to the
        interaction log.
      </p>
    );
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {data.map((i) => (
        <li key={i.id}>
          <b>{i.name}</b> ({[i.segment, i.channel, i.date].filter(Boolean).join(', ')}).{' '}
          {[i.pains && `Challenges: ${i.pains}`, i.gains && `What worked: ${i.gains}`, i.willingness_to_pay && `Advice: ${i.willingness_to_pay}`, i.notes]
            .filter(Boolean)
            .join(' ')}
          {i.quotes && <span className="italic"> “{i.quotes}”</span>}
        </li>
      ))}
    </ol>
  );
}
