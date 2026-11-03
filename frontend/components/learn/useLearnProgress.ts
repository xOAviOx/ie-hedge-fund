'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'portai.learn.completed';
// `storage` only fires in other tabs, so same-tab listeners need their own event.
const CHANGE_EVENT = 'portai:learn-progress';

function readCompleted(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function useLearnProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCompleted(new Set(readCompleted()));
    sync();
    setReady(true);
    window.addEventListener('storage', sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const setDone = useCallback((slug: string, done: boolean) => {
    const next = readCompleted().filter((s) => s !== slug);
    if (done) next.push(slug);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { completed, ready, setDone };
}
