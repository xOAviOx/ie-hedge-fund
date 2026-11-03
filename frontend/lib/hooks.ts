// React Query hooks — the single data-fetching layer for the app.
// refetchInterval matches backend cache TTLs (quotes 60s) so we never poll faster
// than the cache updates (per TRANSFORM.md §4.7). No bare fetch-in-useEffect anywhere.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import type { AlertRuleIn, BacktestRequest, ChatTurn, FundConfigPatch, HoldingInput, ProfileRequest } from './types';

const QUOTE_REFETCH = 60_000; // matches quote cache TTL

export const qk = {
  fund: ['fund'] as const,
  positions: ['positions'] as const,
  orders: (limit: number) => ['orders', limit] as const,
  nav: (limit: number) => ['nav', limit] as const,
  runs: (limit: number) => ['runs', limit] as const,
  run: (id: string) => ['run', id] as const,
  research: (t: string, memo: boolean) => ['research', t, memo] as const,
  risk: ['risk'] as const,
  stats: ['stats'] as const,
  quote: (s: string) => ['quote', s] as const,
  ohlcv: (s: string, i: string) => ['ohlcv', s, i] as const,
  news: (s: string) => ['news', s] as const,
  details: (s: string) => ['details', s] as const,
};

export const useFund = () => useQuery({ queryKey: qk.fund, queryFn: api.fund });

export const usePositions = () =>
  useQuery({ queryKey: qk.positions, queryFn: api.positions, refetchInterval: QUOTE_REFETCH });

export const useOrders = (limit = 50) =>
  useQuery({ queryKey: qk.orders(limit), queryFn: () => api.orders(limit) });

export const useNavHistory = (limit = 365) =>
  useQuery({ queryKey: qk.nav(limit), queryFn: () => api.navHistory(limit) });

export const useRuns = (limit = 50) =>
  useQuery({ queryKey: qk.runs(limit), queryFn: () => api.runs(limit) });

export const useRun = (id: string) =>
  useQuery({ queryKey: qk.run(id), queryFn: () => api.run(id), enabled: !!id });

export const useResearch = (ticker: string, includeMemo: boolean, enabled: boolean) =>
  useQuery({
    queryKey: qk.research(ticker, includeMemo),
    queryFn: () => api.research(ticker, includeMemo),
    enabled: enabled && !!ticker,
    staleTime: 5 * 60_000, // analysis is cached per (tickers, date) server-side too
  });

export const useRisk = () => useQuery({ queryKey: qk.risk, queryFn: api.risk });

export const useStats = () =>
  useQuery({ queryKey: qk.stats, queryFn: api.stats, refetchInterval: QUOTE_REFETCH });

export const useQuote = (symbol: string, enabled = true) =>
  useQuery({
    queryKey: qk.quote(symbol),
    queryFn: () => api.quote(symbol),
    enabled: enabled && !!symbol,
    refetchInterval: QUOTE_REFETCH,
  });

export const useOhlcv = (symbol: string, interval = '1d', enabled = true) =>
  useQuery({
    queryKey: qk.ohlcv(symbol, interval),
    queryFn: () => api.ohlcv(symbol, interval),
    enabled: enabled && !!symbol,
  });

export const useNews = (symbol: string, enabled = true) =>
  useQuery({ queryKey: qk.news(symbol), queryFn: () => api.news(symbol), enabled: enabled && !!symbol });

const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

// ~6 weeks of daily closes for per-position sparklines (small, long-cached).
export const useSparkline = (symbol: string, enabled = true) =>
  useQuery({
    queryKey: ['spark', symbol],
    queryFn: () => api.ohlcv(symbol, '1d', isoDaysAgo(42)),
    enabled: enabled && !!symbol,
    staleTime: 60 * 60_000,
  });

// Benchmark series aligned to the fund's NAV window (rebased in the chart).
export const useBenchmark = (symbol: string, startIso: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ['benchmark', symbol, startIso ?? ''],
    queryFn: () => api.ohlcv(symbol, '1d', startIso ? startIso.slice(0, 10) : isoDaysAgo(365)),
    enabled: enabled && !!symbol,
    staleTime: 30 * 60_000,
  });

export const useDetails = (symbol: string, enabled = true) =>
  useQuery({ queryKey: qk.details(symbol), queryFn: () => api.details(symbol), enabled: enabled && !!symbol });

// ── mutations ─────────────────────────────────────────────────────────
export function useRunNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.runNow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.fund });
      qc.invalidateQueries({ queryKey: qk.positions });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['nav'] });
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: qk.risk });
    },
  });
}

export function useTogglePause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pause: boolean) => (pause ? api.pause() : api.resume()),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.fund }),
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: FundConfigPatch) => api.updateConfig(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.fund }),
  });
}

export function useStartBacktest() {
  return useMutation({ mutationFn: (body: BacktestRequest) => api.backtest.run(body) });
}

// Polls once per second while the job is running, then stops.
export function useBacktest(id: string | null) {
  return useQuery({
    queryKey: ['backtest', id],
    queryFn: () => api.backtest.get(id as string),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 1000 : false),
  });
}

// ── product features ──────────────────────────────────────────────────
export const useScoreBoard = () =>
  useQuery({ queryKey: ['score', 'board'], queryFn: () => api.score.list(), staleTime: 5 * 60_000 });

export const useScore = (ticker: string, enabled = true) =>
  useQuery({
    queryKey: ['score', 'ticker', ticker],
    queryFn: () => api.score.get(ticker),
    enabled: enabled && !!ticker,
    staleTime: 5 * 60_000,
  });

export const useQuizQuestions = () =>
  useQuery({ queryKey: ['onboarding', 'questions'], queryFn: api.onboarding.questions, staleTime: Infinity });

export const useInvestorProfile = () => useQuery({ queryKey: ['onboarding', 'profile'], queryFn: api.onboarding.profile });

export function useSubmitProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileRequest) => api.onboarding.submit(body),
    onSuccess: (profile) => {
      qc.setQueryData(['onboarding', 'profile'], profile);
      if (profile.applied) qc.invalidateQueries({ queryKey: qk.fund });
    },
  });
}

export const usePortfolios = () => useQuery({ queryKey: ['portfolios'], queryFn: api.portfolios.list, staleTime: 5 * 60_000 });

export const usePortfolio = (id: string) =>
  useQuery({ queryKey: ['portfolio', id], queryFn: () => api.portfolios.get(id), enabled: !!id, staleTime: 5 * 60_000 });

export function useFollowPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, follow }: { id: string; follow: boolean }) =>
      follow ? api.portfolios.follow(id) : api.portfolios.unfollow(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolios'] });
      qc.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useApplyPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.portfolios.apply(id),
    onSuccess: (fund) => qc.setQueryData(qk.fund, fund),
  });
}

export const useHealthSample = (enabled: boolean) =>
  useQuery({ queryKey: ['health-check', 'sample'], queryFn: api.healthCheck.sample, enabled, staleTime: Infinity });

export const useAnalyseHoldings = () =>
  useMutation({ mutationFn: (holdings: HoldingInput[]) => api.healthCheck.analyse(holdings) });

export const useChatSuggestions = () =>
  useQuery({ queryKey: ['chat', 'suggestions'], queryFn: api.chat.suggestions, staleTime: 5 * 60_000 });

export const useAskFund = () =>
  useMutation({ mutationFn: ({ message, history }: { message: string; history: ChatTurn[] }) => api.chat.ask(message, history) });

export const useWatchlist = () =>
  useQuery({ queryKey: ['watchlist'], queryFn: api.watchlist.list, refetchInterval: QUOTE_REFETCH });

export function useWatchlistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticker, remove }: { ticker: string; remove?: boolean }): Promise<void> => {
      if (remove) await api.watchlist.remove(ticker);
      else await api.watchlist.add(ticker);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}

export const useAlertRules = () => useQuery({ queryKey: ['alerts', 'rules'], queryFn: api.alerts.rules });

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AlertRuleIn) => api.alerts.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.alerts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'rules'] }),
  });
}

export const useAlertEvents = () =>
  useQuery({ queryKey: ['alerts', 'events'], queryFn: () => api.alerts.events(), refetchInterval: QUOTE_REFETCH });

export function useCheckAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.alerts.check,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useMarkAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.alerts.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', 'events'] }),
  });
}
