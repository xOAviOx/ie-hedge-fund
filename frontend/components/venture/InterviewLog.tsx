'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import type { Interview, InterviewIn, InterviewKind } from '@/lib/ventureApi';
import { ErrorState, Loading } from '@/components/ui';
import { useInterviewMutations, useInterviews } from './hooks';

const today = () => new Date().toISOString().slice(0, 10);

const blank = (kind: InterviewKind): InterviewIn => ({
  kind,
  name: '',
  segment: '',
  date: today(),
  channel: 'In person',
  pains: '',
  gains: '',
  quotes: '',
  willingness_to_pay: '',
  notes: '',
});

const CHANNELS = ['In person', 'Call', 'Video call', 'Email', 'LinkedIn', 'Event'];

type TextField = Exclude<keyof InterviewIn, 'kind'>;

const LABELS: Record<InterviewKind, Partial<Record<TextField, string>>> = {
  customer: {
    name: 'Name or initials',
    segment: 'Segment',
    pains: 'Pains they described',
    gains: 'Gains they want',
    quotes: 'Exact quotes',
    willingness_to_pay: 'Willingness to pay',
    notes: 'Notes and what we learned',
  },
  exemplar: {
    name: 'Person and role at smallcase',
    segment: 'Team / function',
    pains: 'Challenges they faced',
    gains: 'What worked for them',
    quotes: 'Exact quotes',
    willingness_to_pay: 'Advice for PortAI',
    notes: 'Notes',
  },
};

const inputCls =
  'w-full rounded-md border border-line bg-bg px-2.5 py-1.5 text-sm text-ink placeholder:text-muted/60 focus:border-accent/60';

function InterviewForm({
  kind,
  initial,
  onCancel,
  onSubmit,
  busy,
  error,
}: {
  kind: InterviewKind;
  initial: InterviewIn;
  onCancel: () => void;
  onSubmit: (v: InterviewIn) => void;
  busy: boolean;
  error: unknown;
}) {
  const [v, setV] = useState<InterviewIn>(initial);
  const L = LABELS[kind];
  const set = (k: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const area = (k: TextField) => (
    <label className="space-y-1">
      <span className="label">{L[k]}</span>
      <textarea rows={2} value={v[k]} onChange={set(k)} className={inputCls} />
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="panel-2 space-y-3 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="space-y-1 sm:col-span-2">
          <span className="label">{L.name}</span>
          <input required value={v.name} onChange={set('name')} className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="label">Date</span>
          <input type="date" required value={v.date} onChange={set('date')} className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className="label">Channel</span>
          <select value={v.channel} onChange={set('channel')} className={inputCls}>
            {CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-4">
          <span className="label">{L.segment}</span>
          <input value={v.segment} onChange={set('segment')} className={inputCls} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {area('pains')}
        {area('gains')}
        {area('quotes')}
        {area('willingness_to_pay')}
      </div>
      {area('notes')}
      {error != null && <p className="text-xs text-down">{error instanceof Error ? error.message : 'Could not save'}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink">
          Cancel
        </button>
        <button disabled={busy} className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value }: { label?: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="label">{label}</div>
      <p className="whitespace-pre-line text-sm text-muted">{value}</p>
    </div>
  );
}

export default function InterviewLog({
  kind,
  min,
  emptyHint,
  scriptHref,
}: {
  kind: InterviewKind;
  min: number;
  emptyHint: string;
  scriptHref: string;
}) {
  const q = useInterviews(kind);
  const { create, update, remove } = useInterviewMutations(kind);
  const [editing, setEditing] = useState<Interview | 'new' | null>(null);
  const L = LABELS[kind];
  const list = q.data ?? [];

  const close = () => setEditing(null);
  const save = (body: InterviewIn) => {
    if (editing === 'new') create.mutate(body, { onSuccess: close });
    else if (editing) update.mutate({ id: editing.id, body }, { onSuccess: close });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          <span className={list.length >= min ? 'text-up' : 'text-ink'}>{list.length}</span> of {min} required logged
        </p>
        {editing === null && (
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white"
          >
            <Plus size={13} /> Add {kind === 'customer' ? 'interview' : 'interaction'}
          </button>
        )}
      </div>

      {editing !== null && (
        <InterviewForm
          key={editing === 'new' ? 'new' : editing.id}
          kind={kind}
          initial={editing === 'new' ? blank(kind) : { ...editing }}
          onCancel={close}
          onSubmit={save}
          busy={create.isPending || update.isPending}
          error={create.error ?? update.error}
        />
      )}

      {q.isLoading ? (
        <Loading label="Loading log" />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : list.length === 0 ? (
        <div className="panel border-dashed p-6 text-center text-sm text-muted">
          <p className="text-ink">Nothing logged yet.</p>
          <p className="mx-auto mt-1 max-w-lg">{emptyHint}</p>
          <Link href={scriptHref} className="mt-2 inline-block text-xs text-accent hover:underline">
            Use the question script →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((i) => (
            <article key={i.id} className="panel space-y-2 p-4">
              <header className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-ink">{i.name}</h4>
                  <p className="text-2xs text-muted">
                    {[i.segment, i.channel, i.date].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(i)} title="Edit" className="rounded p-1 text-muted hover:bg-white/5 hover:text-ink">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete the entry for ${i.name}?`)) remove.mutate(i.id);
                    }}
                    title="Delete"
                    className="rounded p-1 text-muted hover:bg-white/5 hover:text-down"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </header>
              <Field label={L.pains} value={i.pains} />
              <Field label={L.gains} value={i.gains} />
              {i.quotes && <blockquote className="border-l-2 border-accent/50 pl-3 text-sm italic text-ink/90">{i.quotes}</blockquote>}
              <Field label={L.willingness_to_pay} value={i.willingness_to_pay} />
              <Field label={L.notes} value={i.notes} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
