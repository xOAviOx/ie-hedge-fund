import type { Metadata } from 'next';

import PageHeader from '@/components/PageHeader';
import LearnIndex from '@/components/learn/LearnIndex';

export const metadata: Metadata = { title: 'Learn Hub — PortAI' };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Learn Hub"
        subtitle="Short modules on how the fund thinks, what the numbers mean, and the rules that protect Indian investors."
      />
      <LearnIndex />
    </>
  );
}
