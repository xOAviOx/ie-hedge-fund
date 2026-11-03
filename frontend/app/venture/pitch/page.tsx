'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize, StickyNote, X } from 'lucide-react';

import { SLIDES } from '@/components/venture/PitchSlides';
import { useLiveFacts } from '@/components/venture/hooks';

const W = 1600;
const H = 900;

function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

export default function PitchPage() {
  const router = useRouter();
  const facts = useLiveFacts();
  const scale = useFitScale();
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const [origin, setOrigin] = useState('');
  const last = SLIDES.length - 1;

  useEffect(() => setOrigin(window.location.origin), []);

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(last, n))), [last]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          setI((v) => Math.min(last, v + 1));
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          setI((v) => Math.max(0, v - 1));
          break;
        case 'Home':
          setI(0);
          break;
        case 'End':
          setI(last);
          break;
        case 'n':
        case 'N':
          setNotes((v) => !v);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (!document.fullscreenElement) router.push('/venture');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last, router, toggleFullscreen]);

  const slide = SLIDES[i];

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden bg-bg"
        style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[140px]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {slide.render({ facts, origin })}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-[34px] right-[110px] tnum text-[16px] text-muted">
          {i + 1} / {SLIDES.length}
        </div>
        <div className="absolute bottom-[34px] left-[110px] text-[16px] font-semibold tracking-tight text-muted">PortAI</div>
      </div>

      {/* Click zones: left third goes back, the rest advances. */}
      <button aria-label="Previous slide" className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize" onClick={() => go(i - 1)} />
      <button aria-label="Next slide" className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize" onClick={() => go(i + 1)} />

      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((i + 1) / SLIDES.length) * 100}%` }} />
      </div>

      <div className="absolute right-3 top-3 flex gap-1 opacity-30 transition-opacity hover:opacity-100">
        <button onClick={() => setNotes((v) => !v)} title="Presenter notes (n)" className="rounded p-2 text-muted hover:bg-white/10 hover:text-ink">
          <StickyNote size={16} />
        </button>
        <button onClick={toggleFullscreen} title="Fullscreen (f)" className="rounded p-2 text-muted hover:bg-white/10 hover:text-ink">
          <Maximize size={16} />
        </button>
        <button onClick={() => router.push('/venture')} title="Exit (Esc)" className="rounded p-2 text-muted hover:bg-white/10 hover:text-ink">
          <X size={16} />
        </button>
      </div>

      {notes && (
        <div className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-3xl rounded-lg border border-line bg-panel/95 p-4 text-sm leading-relaxed text-ink shadow-2xl backdrop-blur">
          <div className="label mb-1">Presenter notes · slide {i + 1}</div>
          {slide.notes}
          <div className="mt-2 text-2xs text-muted">← → / space to navigate · Home / End · f fullscreen · n notes · Esc exit</div>
        </div>
      )}
    </div>
  );
}
