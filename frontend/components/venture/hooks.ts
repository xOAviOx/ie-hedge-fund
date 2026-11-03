'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ventureApi, type InterviewIn, type InterviewKind } from '@/lib/ventureApi';

export const ventureKeys = {
  metrics: ['venture', 'metrics'] as const,
  interviews: (kind: InterviewKind) => ['venture', 'interviews', kind] as const,
};

export const useVentureMetrics = () =>
  useQuery({ queryKey: ventureKeys.metrics, queryFn: ventureApi.metrics, refetchInterval: 60_000 });

/** Live product facts with a fallback to the core fund API if /venture/metrics is unavailable. */
export function useLiveFacts() {
  const metrics = useVentureMetrics();
  const fund = useQuery({ queryKey: ['fund'], queryFn: api.fund, enabled: metrics.isError });
  const runs = useQuery({ queryKey: ['runs', 50], queryFn: () => api.runs(50), enabled: metrics.isError });
  if (metrics.data) {
    const m = metrics.data;
    return {
      live: true,
      nav: m.nav,
      navReturnPct: m.nav_return_pct,
      runs: m.runs,
      orders: m.orders,
      agents: m.agents,
      personas: m.personas,
      universe: m.universe_size,
      waitlist: m.waitlist_total as number | null,
    };
  }
  const f = fund.data;
  return {
    live: Boolean(f),
    nav: f?.latest_nav ?? null,
    navReturnPct: f && f.starting_cash > 0 ? (f.latest_nav / f.starting_cash - 1) * 100 : null,
    runs: runs.data?.length ?? null,
    orders: runs.data ? runs.data.reduce((s, r) => s + r.order_count, 0) : null,
    agents: 18,
    personas: f?.active_personas.length ?? 12,
    universe: f?.universe.length ?? null,
    waitlist: null as number | null,
  };
}

export type LiveFacts = ReturnType<typeof useLiveFacts>;

export const useInterviews = (kind: InterviewKind) =>
  useQuery({ queryKey: ventureKeys.interviews(kind), queryFn: () => ventureApi.interviews(kind) });

export function useInterviewMutations(kind: InterviewKind) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ventureKeys.interviews(kind) });
    qc.invalidateQueries({ queryKey: ventureKeys.metrics });
  };
  return {
    create: useMutation({ mutationFn: (b: InterviewIn) => ventureApi.createInterview(b), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: InterviewIn }) => ventureApi.updateInterview(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: number) => ventureApi.deleteInterview(id), onSuccess: invalidate }),
  };
}
