import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PageHeader from '@/components/PageHeader';
import ModuleView from '@/components/learn/ModuleView';
import { MODULES, TRACKS, getModule } from '@/lib/learn';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const mod = getModule(params.slug);
  return { title: mod ? `${mod.title} — PortAI Learn Hub` : 'Learn Hub — PortAI' };
}

export default function LearnModulePage({ params }: Props) {
  const mod = getModule(params.slug);
  if (!mod) notFound();
  const track = TRACKS.find((t) => t.id === mod.track);

  return (
    <>
      <PageHeader title={mod.title} subtitle={track?.title} />
      <ModuleView slug={mod.slug} />
    </>
  );
}
