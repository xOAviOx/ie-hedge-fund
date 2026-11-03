'use client';

import { useState } from 'react';

import { DEFAULT_SIZING, SIZING_SOURCES, sizing, type SizingInputs } from '@/lib/venture/sizing';
import { DEFAULT_ASSUMPTIONS, count, inr } from '@/lib/venture/financials';
import { NestedCircles } from '@/components/venture/charts';
import { Card, Estimate, Page, Section, Source } from '@/components/venture/ui';

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
  note,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  note: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="label">{label}</span>
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="tnum w-32 rounded border border-line bg-bg px-2 py-0.5 text-right text-xs text-ink"
        />
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#4c8fe8]" />
      <div className="flex justify-between gap-2 text-2xs text-muted">
        <span>{note}</span>
        <span className="tnum text-ink">{fmt(value)}</span>
      </div>
    </div>
  );
}

export default function SizingPage() {
  const [s, setS] = useState<SizingInputs>(DEFAULT_SIZING);
  const r = sizing(s);
  const set = (k: keyof SizingInputs) => (v: number) => setS((p) => ({ ...p, [k]: v }));
  return (
    <Page>
      <Section
        kicker="Session 5"
        title="TAM / SAM / SOM"
        intro="Move the sliders to test assumptions. Values are annual revenue at the Pro list price. SOM defaults to the Year-3 paid users in the financial model, so sizing and the business plan stay consistent."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel space-y-5 p-5">
            <Slider label="TAM users" value={s.tamUsers} min={10_000_000} max={200_000_000} step={1_000_000} onChange={set('tamUsers')} fmt={count} note={<Source source={SIZING_SOURCES.tam.source} url={SIZING_SOURCES.tam.url} />} />
            <Slider label="SAM users" value={s.samUsers} min={1_000_000} max={50_000_000} step={500_000} onChange={set('samUsers')} fmt={count} note={<Estimate>Team estimate</Estimate>} />
            <Slider label="SOM users (Year 3 paid)" value={s.somUsers} min={1_000} max={200_000} step={1_000} onChange={set('somUsers')} fmt={count} note={<Estimate>From financial model</Estimate>} />
            <Slider label="Price per user / year (₹)" value={s.price} min={500} max={6_000} step={50} onChange={set('price')} fmt={(v) => inr(v)} note={SIZING_SOURCES.price.source} />
            <button onClick={() => setS(DEFAULT_SIZING)} className="text-xs text-accent hover:underline">
              Reset to defaults
            </button>
          </div>
          <div className="panel flex items-center justify-center p-4">
            <NestedCircles tam={r.tam} sam={r.sam} som={r.som} className="max-w-md" />
          </div>
        </div>
      </Section>

      <Section title="Formulas">
        <div className="grid gap-3 md:grid-cols-3">
          <Card title="TAM — total addressable market">
            <p className="tnum text-ink">{count(s.tamUsers)} × {inr(s.price)} = {inr(r.tam)}</p>
            <p className="mt-2 text-xs">{SIZING_SOURCES.tam.label}</p>
          </Card>
          <Card title="SAM — serviceable available market">
            <p className="tnum text-ink">{count(s.samUsers)} × {inr(s.price)} = {inr(r.sam)}</p>
            <p className="mt-2 text-xs">{SIZING_SOURCES.sam.label} {(r.samShare * 100).toFixed(1)}% of TAM.</p>
          </Card>
          <Card title="SOM — serviceable obtainable market">
            <p className="tnum text-ink">{count(s.somUsers)} × {inr(s.price)} = {inr(r.som)}</p>
            <p className="mt-2 text-xs">
              {SIZING_SOURCES.som.label} {(r.somShare * 100).toFixed(2)}% of SAM. The model books this at a blended {inr(DEFAULT_ASSUMPTIONS.proArpu)} per
              user ({inr(s.somUsers * DEFAULT_ASSUMPTIONS.proArpu)}), below list price because of discounts and monthly plans.
            </p>
          </Card>
        </div>
        <p className="text-2xs text-muted">
          TAM counts every unique investor even though many are inactive; it is an upper bound, not a forecast. Campus and API revenue are not included in these figures.
        </p>
      </Section>
    </Page>
  );
}
