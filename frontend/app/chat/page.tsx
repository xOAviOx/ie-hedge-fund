'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';

import { useAskFund, useChatSuggestions } from '@/lib/hooks';
import PageHeader from '@/components/PageHeader';
import { Spinner } from '@/components/ui';
import ChatMessage, { TypingIndicator, type ChatMessageData } from '@/components/chat/ChatMessage';

const STORAGE_KEY = 'portai.chat.v1';
const HISTORY_TURNS = 8;

interface Stored {
  messages: ChatMessageData[];
  suggestions: string[];
}

export default function ChatPage() {
  const initial = useChatSuggestions();
  const ask = useAskFund();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [input, setInput] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // sessionStorage is read after mount so server and client markup match.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        setMessages(s.messages ?? []);
        if (s.suggestions?.length) setSuggestions(s.suggestions);
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const s: Stored = { messages, suggestions: suggestions ?? [] };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [messages, suggestions, hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, ask.isPending]);

  const send = (text: string) => {
    const message = text.trim();
    if (!message || ask.isPending) return;
    const history = messages
      .filter((m) => !m.error)
      .slice(-HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    ask.mutate(
      { message, history },
      {
        onSuccess: (res) => {
          setMessages((m) => [...m, { role: 'assistant', content: res.answer, mode: res.mode, sources: res.sources }]);
          if (res.suggestions.length) setSuggestions(res.suggestions);
        },
        onError: (err) =>
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: err instanceof Error ? err.message : 'Something went wrong', error: true },
          ]),
      },
    );
  };

  const chips = suggestions ?? initial.data?.suggestions ?? [];

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Ask the Fund"
        subtitle="Ask why the fund traded, what it holds, and what the committee thinks."
        actions={
          messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setSuggestions(null);
              }}
              className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink"
            >
              <Trash2 size={14} /> Clear
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {hydrated && messages.length === 0 && (
            <div className="panel p-6 text-center">
              <div className="text-sm text-ink">Ask anything about the Stratton Fund.</div>
              <p className="mt-1 text-xs text-muted">
                Answers come from the fund&apos;s own positions, orders, signals and memos — nothing else.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} msg={m} />
          ))}
          {ask.isPending && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-line bg-panel px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={ask.isPending}
                  className="rounded-full border border-line px-3 py-1 text-2xs text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Why did we buy RELIANCE?"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || ask.isPending}
              className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ask.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Send size={14} />}
              Ask
            </button>
          </form>
          <p className="text-2xs text-muted">Paper fund for education. Answers are not financial advice.</p>
        </div>
      </div>
    </div>
  );
}
