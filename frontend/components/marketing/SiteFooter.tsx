import Link from 'next/link';

import { COMPANY } from '@/lib/company';
import { Logo } from '@/components/marketing/SiteNav';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/console', label: 'Fund Console' },
      { href: '/decisions', label: 'Decision Room' },
      { href: '/score', label: 'Stratton Score' },
      { href: '/portfolios', label: 'Model portfolios' },
      { href: '/backtest', label: 'Backtest Lab' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/learn', label: 'Learn Hub' },
      { href: '/onboarding', label: 'Risk quiz' },
      { href: '/learn/why-fo-traders-lose', label: 'Why F&O traders lose' },
      { href: '/learn/reading-a-stratton-score', label: 'Reading a Stratton Score' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/venture', label: 'Venture' },
      { href: '/pricing#waitlist', label: 'Join the waitlist' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{COMPANY.tagline}</p>
          <p className="mt-4 text-xs text-muted">
            {COMPANY.city} · {COMPANY.course}
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="label">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink/75 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted">
          <p>
            Paper trading only. Not investment advice. {COMPANY.name} is a student venture project at{' '}
            {COMPANY.university}.
          </p>
          <p className="tnum">
            © {COMPANY.founded} {COMPANY.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
