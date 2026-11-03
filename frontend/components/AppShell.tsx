'use client';

import { usePathname } from 'next/navigation';

import Sidebar from '@/components/Sidebar';

// Routes that render full-bleed without the app chrome: the public marketing
// pages, onboarding, auth, and the presentation/print surfaces.
const BARE_EXACT = ['/'];
const BARE_PREFIXES = ['/auth', '/callback', '/onboarding', '/pricing', '/venture/pitch', '/venture/poster'];

export function isBareRoute(pathname: string): boolean {
  return BARE_EXACT.includes(pathname) || BARE_PREFIXES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';

  if (isBareRoute(pathname)) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="grid-bg flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
