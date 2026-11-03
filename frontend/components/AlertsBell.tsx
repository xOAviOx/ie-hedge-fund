'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

import { useAlertEvents } from '@/lib/hooks';

export default function AlertsBell() {
  const events = useAlertEvents();
  const unread = events.data?.unread ?? 0;
  return (
    <Link
      href="/watchlist"
      title={unread ? `${unread} unread alerts` : 'Alerts'}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/[0.03] hover:text-ink"
    >
      <Bell size={15} />
      {unread > 0 && (
        <span className="tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
