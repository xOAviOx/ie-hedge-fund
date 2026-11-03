'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Presentation, StickyNote } from 'lucide-react';

import { COMPANY } from '@/lib/company';
import { VENTURE_TABS } from '@/lib/venture/course';
import { PrintStyles } from '@/components/venture/ui';

const BARE = ['/venture/pitch', '/venture/poster'];

export default function VentureLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/venture';
  if (BARE.some((b) => pathname === b || pathname.startsWith(`${b}/`))) return <>{children}</>;

  return (
    <div className="min-h-full">
      <PrintStyles />
      <header data-print-hide className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-4">
          <div>
            <div className="label">
              {COMPANY.course} · {COMPANY.university}
            </div>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">Venture</h1>
          </div>
          <div className="flex gap-2 pb-1">
            <Link href="/venture/pitch" className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white">
              <Presentation size={13} /> Pitch mode
            </Link>
            <Link href="/venture/poster" className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-ink hover:bg-white/5">
              <StickyNote size={13} /> A2 poster
            </Link>
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto px-4">
          {VENTURE_TABS.map((t) => {
            const active = t.href === '/venture' ? pathname === '/venture' : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={clsx(
                  'whitespace-nowrap border-b-2 px-2.5 py-2 text-xs transition-colors',
                  active ? 'border-accent font-medium text-ink' : 'border-transparent text-muted hover:text-ink',
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
