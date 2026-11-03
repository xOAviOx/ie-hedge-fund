'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';

import { COMPANY } from '@/lib/company';

const LINKS = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/learn', label: 'Learn' },
  { href: '/venture', label: 'Venture' },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${COMPANY.name} home`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <rect x="0.75" y="0.75" width="22.5" height="22.5" rx="5" fill="none" stroke="#4c8fe8" strokeWidth="1.5" />
        <rect x="6" y="12" width="2.5" height="6" rx="0.5" fill="#4c8fe8" />
        <rect x="10.75" y="9" width="2.5" height="9" rx="0.5" fill="#4c8fe8" />
        <rect x="15.5" y="6" width="2.5" height="12" rx="0.5" fill="#e6e8ec" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-ink">{COMPANY.name}</span>
    </Link>
  );
}

export default function SiteNav() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => !href.startsWith('/#') && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Logo />

        <ul className="hidden items-center gap-7 text-sm md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={clsx('transition-colors hover:text-ink', isActive(l.href) ? 'text-ink' : 'text-muted')}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/onboarding" className="text-sm text-muted transition-colors hover:text-ink">
            Take the risk quiz
          </Link>
          <Link
            href="/console"
            className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Open the app
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-muted hover:text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-line px-6 py-4 md:hidden">
          <ul className="space-y-3 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block text-ink/85 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/onboarding" onClick={() => setOpen(false)} className="block text-ink/85 hover:text-ink">
                Take the risk quiz
              </Link>
            </li>
          </ul>
          <Link
            href="/console"
            className="mt-4 block rounded-md bg-accent px-3.5 py-2 text-center text-sm font-medium text-white"
          >
            Open the app
          </Link>
        </div>
      )}
    </header>
  );
}
