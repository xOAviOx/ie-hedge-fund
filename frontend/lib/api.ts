// Typed API client for the PortAI FastAPI backend (app/api/v1/*).
// One place that knows the base URL and error shape; every hook calls through it.

import type {
  Fund,
  FundConfigPatch,
  FxRate,
  MetaStats,
  NavPoint,
  News,
  OHLCV,
  Order,
  Position,
  Quote,
  ResearchResult,
  RiskReport,
  RunDetail,
  RunNowResult,
  RunSummary,
  SearchResult,
  BacktestRequest,
  BacktestStartResponse,
  BacktestStatus,
  AlertEvent,
  AlertRule,
  AlertRuleIn,
  ChatResponse,
  ChatTurn,
  FollowResult,
  HealthReport,
  HoldingInput,
  InvestorProfile,
  ModelPortfolio,
  ProfileRequest,
  QuizQuestion,
  ScoreBoard,
  StrattonScore,
  WatchlistItem,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

const V1 = `${API_BASE}/api/v1`;

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${V1}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      cache: 'no-store',
    });
  } catch (e) {
    throw new ApiError(0, `Network error — is the API running at ${API_BASE}?`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // meta
  stats: () => request<MetaStats>('/meta/stats'),
  health: () => request<{ status: string }>('/meta/health'),

  // market
  quote: (symbol: string) => request<Quote>(`/market/quote/${encodeURIComponent(symbol)}`),
  ohlcv: (symbol: string, interval = '1d', start?: string, end?: string) =>
    request<OHLCV>(`/market/ohlcv/${encodeURIComponent(symbol)}${qs({ interval, start, end })}`),
  news: (symbol: string, limit = 20) =>
    request<News>(`/market/news/${encodeURIComponent(symbol)}${qs({ limit })}`),
  fx: (pair: string) => request<FxRate>(`/market/fx/${encodeURIComponent(pair)}`),
  search: (q: string) => request<SearchResult>(`/market/search${qs({ q })}`),
  // Ticker details are exposed through /market/search (which resolves + fetches details).
  details: (symbol: string) =>
    request<SearchResult>(`/market/search${qs({ q: symbol })}`).then((s) => s.details),

  // fund
  fund: () => request<Fund>('/fund'),
  positions: () => request<Position[]>('/fund/positions'),
  orders: (limit = 50) => request<Order[]>(`/fund/orders${qs({ limit })}`),
  navHistory: (limit = 365) => request<NavPoint[]>(`/fund/nav${qs({ limit })}`),
  runNow: () => request<RunNowResult>('/fund/run', { method: 'POST' }),
  pause: () => request<{ fund_id: string; is_paused: boolean }>('/fund/pause', { method: 'POST' }),
  resume: () => request<{ fund_id: string; is_paused: boolean }>('/fund/resume', { method: 'POST' }),
  updateConfig: (patch: FundConfigPatch) =>
    request<Fund>('/fund/config', { method: 'PUT', body: JSON.stringify(patch) }),

  // decisions
  runs: (limit = 50) => request<RunSummary[]>(`/decisions${qs({ limit })}`),
  run: (runId: string) => request<RunDetail>(`/decisions/${encodeURIComponent(runId)}`),

  // research
  research: (ticker: string, includeMemo = false) =>
    request<ResearchResult>(`/research/${encodeURIComponent(ticker)}${qs({ include_memo: includeMemo })}`),

  // risk
  risk: () => request<RiskReport>('/risk'),

  // backtest
  backtest: {
    run: (body: BacktestRequest) =>
      request<BacktestStartResponse>('/backtest/run', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => request<BacktestStatus>(`/backtest/${encodeURIComponent(id)}`),
  },

  // stratton score
  score: {
    list: (tickers?: string[]) =>
      request<ScoreBoard>(`/score${qs({ tickers: tickers?.length ? tickers.join(',') : undefined })}`),
    get: (ticker: string) => request<StrattonScore>(`/score/${encodeURIComponent(ticker)}`),
  },

  // onboarding
  onboarding: {
    questions: () => request<{ questions: QuizQuestion[] }>('/onboarding/questions'),
    profile: () => request<InvestorProfile | null>('/onboarding/profile'),
    submit: (body: ProfileRequest) =>
      request<InvestorProfile>('/onboarding/profile', { method: 'POST', body: JSON.stringify(body) }),
  },

  // model portfolios
  portfolios: {
    list: () => request<{ as_of: string; portfolios: ModelPortfolio[] }>('/portfolios'),
    get: (id: string) => request<ModelPortfolio>(`/portfolios/${encodeURIComponent(id)}`),
    follow: (id: string) => request<FollowResult>(`/portfolios/${encodeURIComponent(id)}/follow`, { method: 'POST' }),
    unfollow: (id: string) =>
      request<FollowResult>(`/portfolios/${encodeURIComponent(id)}/follow`, { method: 'DELETE' }),
    apply: (id: string) => request<Fund>(`/portfolios/${encodeURIComponent(id)}/apply`, { method: 'POST' }),
  },

  // health check
  healthCheck: {
    sample: () => request<{ csv: string }>('/health-check/sample'),
    analyse: (holdings: HoldingInput[]) =>
      request<HealthReport>('/health-check', { method: 'POST', body: JSON.stringify({ holdings }) }),
  },

  // chat
  chat: {
    ask: (message: string, history: ChatTurn[]) =>
      request<ChatResponse>('/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
    suggestions: () => request<{ suggestions: string[] }>('/chat/suggestions'),
  },

  // watchlist & alerts
  watchlist: {
    list: () => request<{ items: WatchlistItem[] }>('/watchlist'),
    add: (ticker: string) => request<WatchlistItem>('/watchlist', { method: 'POST', body: JSON.stringify({ ticker }) }),
    remove: (ticker: string) =>
      request<{ removed: boolean }>(`/watchlist/${encodeURIComponent(ticker)}`, { method: 'DELETE' }),
  },
  alerts: {
    rules: () => request<{ rules: AlertRule[] }>('/alerts'),
    create: (body: AlertRuleIn) => request<AlertRule>('/alerts', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: number) => request<{ deleted: boolean }>(`/alerts/${id}`, { method: 'DELETE' }),
    check: () => request<{ checked: number; triggered: AlertEvent[] }>('/alerts/check', { method: 'POST' }),
    events: (unreadOnly = false, limit = 50) =>
      request<{ events: AlertEvent[]; unread: number }>(`/alerts/events${qs({ unread_only: unreadOnly, limit })}`),
    markRead: () => request<{ updated: number }>('/alerts/events/read', { method: 'POST' }),
  },
};
