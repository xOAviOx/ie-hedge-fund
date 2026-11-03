import Link from 'next/link';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';

import type { ChatResponse, ChatTurn } from '@/lib/types';
import { Badge } from '@/components/ui';

export interface ChatMessageData extends ChatTurn {
  mode?: ChatResponse['mode'];
  sources?: ChatResponse['sources'];
  error?: boolean;
}

// Groups consecutive "- " lines into one list; other lines become paragraphs.
function AnswerText({ text }: { text: string }) {
  const blocks: ({ kind: 'p'; text: string } | { kind: 'ul'; items: string[] })[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.trimStart().match(/^[-•]\s+(.*)$/);
    if (bullet) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ul') last.items.push(bullet[1]);
      else blocks.push({ kind: 'ul', items: [bullet[1]] });
    } else if (line.trim()) {
      blocks.push({ kind: 'p', text: line });
    }
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.kind === 'p' ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-muted">
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
        <Bot size={14} />
      </span>
      <div className="panel-2 flex items-center gap-1 px-4 py-3">
        {[0, 150, 300].map((d) => (
          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

export default function ChatMessage({ msg }: { msg: ChatMessageData }) {
  const isUser = msg.role === 'user';
  return (
    <div className={clsx('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <span
        className={clsx(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isUser ? 'bg-white/5 text-muted' : 'bg-accent/15 text-accent',
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </span>
      <div className={clsx('max-w-[75%] space-y-2', isUser && 'text-right')}>
        <div
          className={clsx(
            'rounded-lg border px-4 py-3 text-left text-sm leading-relaxed',
            isUser
              ? 'border-accent/25 bg-accent/10 text-ink'
              : msg.error
                ? 'border-down/25 bg-down/10 text-down'
                : 'border-line bg-panel2 text-ink/90',
          )}
        >
          {isUser ? <p className="whitespace-pre-wrap">{msg.content}</p> : <AnswerText text={msg.content} />}
        </div>
        {!isUser && (msg.mode || (msg.sources && msg.sources.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {msg.mode && <Badge tone={msg.mode === 'llm' ? 'accent' : 'muted'}>{msg.mode === 'llm' ? 'AI' : 'Rules'}</Badge>}
            {msg.sources?.map((s) =>
              s.href ? (
                <Link
                  key={`${s.kind}-${s.ref}`}
                  href={s.href}
                  className="rounded border border-line px-1.5 py-0.5 text-2xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {s.label}
                </Link>
              ) : (
                <span key={`${s.kind}-${s.ref}`} className="rounded border border-line px-1.5 py-0.5 text-2xs text-muted">
                  {s.label}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
