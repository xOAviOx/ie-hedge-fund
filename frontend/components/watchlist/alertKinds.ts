import type { AlertKind } from '@/lib/types';

export const ALERT_KINDS: { kind: AlertKind; label: string; unit?: string }[] = [
  { kind: 'price_above', label: 'Price rises above', unit: 'price' },
  { kind: 'price_below', label: 'Price falls below', unit: 'price' },
  { kind: 'change_pct_abs', label: 'Daily move exceeds ±%', unit: '%' },
  { kind: 'score_above', label: 'Stratton Score rises above', unit: '1-10' },
  { kind: 'score_below', label: 'Stratton Score falls below', unit: '1-10' },
  { kind: 'consensus_flip', label: 'Committee consensus flips' },
];

export const needsThreshold = (kind: AlertKind) => kind !== 'consensus_flip';

export function alertLabel(kind: AlertKind): string {
  return ALERT_KINDS.find((k) => k.kind === kind)?.label ?? kind;
}
