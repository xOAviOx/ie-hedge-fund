'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Microscope,
  Presentation,
  Rocket,
  ScrollText,
  Settings as SettingsIcon,
  ShieldCheck,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import AlertsBell from '@/components/AlertsBell';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Fund',
    items: [
      { label: 'Fund Console', href: '/console', icon: LayoutDashboard },
      { label: 'Decision Room', href: '/decisions', icon: ScrollText },
      { label: 'Ask the Fund', href: '/chat', icon: MessageSquare },
      { label: 'Model Portfolios', href: '/portfolios', icon: Briefcase },
      { label: 'Watchlist & Alerts', href: '/watchlist', icon: Eye },
    ],
  },
  {
    title: 'Research',
    items: [
      { label: 'Research', href: '/research', icon: Microscope },
      { label: 'Stratton Score', href: '/score', icon: Gauge },
      { label: 'Health Check', href: '/health-check', icon: HeartPulse },
      { label: 'Backtest Lab', href: '/backtest', icon: FlaskConical },
      { label: 'Risk Desk', href: '/risk', icon: Activity },
    ],
  },
  {
    title: 'Learn',
    items: [
      { label: 'Learn Hub', href: '/learn', icon: BookOpen },
      { label: 'Risk Profile', href: '/onboarding', icon: ClipboardCheck },
      { label: 'Pricing', href: '/pricing', icon: Tag },
    ],
  },
  {
    title: 'Venture',
    items: [
      { label: 'Venture Overview', href: '/venture', icon: Rocket },
      { label: 'Pitch Mode', href: '/venture/pitch', icon: Presentation },
    ],
  },
];

// Longest matching href wins, so /venture/pitch doesn't also light up /venture.
function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const g of GROUPS) {
    for (const { href } of [...g.items, { href: '/settings' }]) {
      if (pathname === href || pathname.startsWith(`${href}/`)) {
        if (!best || href.length > best.length) best = href;
      }
    }
  }
  return best;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors',
        active ? 'bg-white/[0.06] font-medium text-ink' : 'text-muted hover:bg-white/[0.03] hover:text-ink',
      )}
    >
      <Icon size={15} className={active ? 'text-accent' : ''} />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const active = activeHref(pathname);
  const { user, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-line bg-panel">
      <Link href="/" className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
          <ShieldCheck size={18} />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-ink">PortAI</div>
          <div className="text-2xs uppercase tracking-widest text-muted">Stratton Fund</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="label px-3 pb-1">{g.title}</div>
            <div className="space-y-0.5">
              {g.items.map((item) => (
                <NavLink key={item.href} item={item} active={active === item.href} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-line px-2 py-3">
        <div className="flex items-center gap-1">
          <div className="flex-1">
            <NavLink item={{ label: 'Settings', href: '/settings', icon: SettingsIcon }} active={active === '/settings'} />
          </div>
          <AlertsBell />
        </div>
        <div className="px-1">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-accent">
                  <UserIcon size={14} />
                </span>
                <span className="truncate text-2xs text-muted">{user.email ?? 'Signed in'}</span>
              </div>
              <button onClick={() => signOut()} title="Sign out" className="text-muted transition-colors hover:text-down">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-ink transition-colors hover:bg-white/5"
            >
              <UserIcon size={14} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
