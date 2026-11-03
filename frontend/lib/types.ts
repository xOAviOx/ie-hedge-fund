// API contract types — mirror the FastAPI v1 responses exactly (app/api/v1/*).
// Kept in one place so every page/hook shares the same shapes. No `any`.

export type Direction = 'bullish' | 'bearish' | 'neutral';
export type OrderAction = 'buy' | 'sell' | 'hold';

// ── market ────────────────────────────────────────────────────────────
export interface Quote {
  symbol: string;
  price: number;
  currency: string | null;
  previous_close: number | null;
  change: number | null;
  change_pct: number | null;
  ts: string;
}

export interface OHLCVBar {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface OHLCV {
  symbol: string;
  interval: string;
  bars: OHLCVBar[];
}

export interface NewsItem {
  title: string;
  publisher: string | null;
  link: string | null;
  published: string | null;
  summary: string | null;
}

export interface News {
  symbol: string;
  items: NewsItem[];
}

export interface FxRate {
  pair: string;
  rate: number;
  ts: string;
}

export interface TickerDetails {
  symbol: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  currency: string | null;
  exchange: string | null;
  employees: number | null;
  description: string | null;
  shares_outstanding: number | null;
}

export interface SearchResult {
  query: string;
  symbol: string;
  details: TickerDetails | null;
}

// ── fund ──────────────────────────────────────────────────────────────
export interface Fund {
  fund_id: string;
  base_currency: string;
  starting_cash: number;
  cash: number;
  universe: string[];
  position_cap_pct: number;
  active_personas: string[];
  schedule_cron: string;
  is_paused: boolean;
  latest_nav: number;
}

export interface Position {
  ticker: string;
  shares: number;
  avg_cost: number;
  currency: string;
  cost_basis: number;
}

export interface Order {
  id: number;
  run_id: string | null;
  ticker: string;
  action: OrderAction;
  quantity: number;
  price: number;
  reasoning: string;
  ts: string;
}

export interface NavPoint {
  ts: string;
  nav: number;
  cash: number;
  positions_value: number;
}

export interface RunNowResult {
  status: 'ok' | 'paused';
  fund_id: string;
  run_id: string | null;
  universe?: string[];
  orders?: OrderLite[];
  nav?: number;
  cash?: number;
  positions_value?: number;
  memo?: string | null;
  timings?: Record<string, number>;
}

export interface FundConfigPatch {
  universe?: string[];
  active_personas?: string[];
  position_cap_pct?: number;
  schedule_cron?: string;
  base_currency?: string;
}

// ── decisions ─────────────────────────────────────────────────────────
export interface RunSummary {
  run_id: string;
  ts: string;
  universe: string[];
  latency_ms: number;
  has_memo: boolean;
  order_count: number;
}

export interface DecisionSignal {
  agent: string;
  direction: Direction;
  confidence: number;
  factors: string;
}

export interface OrderLite {
  ticker: string;
  action: OrderAction;
  quantity: number;
  price: number;
  reasoning: string;
}

export interface RunDetail {
  run_id: string;
  ts: string;
  universe: string[];
  latency_ms: number;
  llm_cost: number;
  memo: string | null;
  signals_by_ticker: Record<string, DecisionSignal[]>;
  orders: OrderLite[];
}

// ── research ──────────────────────────────────────────────────────────
export interface RawSignal {
  agent_id: string;
  ticker: string;
  signal: Direction;
  confidence: number;
  reasoning: string;
}

export interface RiskConsensus {
  ticker: string;
  signal: Direction;
  confidence: number;
  bull_count: number;
  bear_count: number;
}

export interface ResearchResult {
  ticker: string;
  price: number | null;
  risk: RiskConsensus | null;
  order: OrderLite | null;
  signals: Record<string, RawSignal>;
  memo: string | null;
  timings: Record<string, number>;
  score?: StrattonScore | null;
}

// ── risk ──────────────────────────────────────────────────────────────
export interface RiskExposure {
  ticker: string;
  cost_basis: number;
  weight_pct: number;
}

export interface CorrelationMatrix {
  tickers: string[];
  matrix: (number | null)[][];
}

export interface RiskReport {
  nav_points: number;
  current_nav: number | null;
  volatility_pct: number | null;
  max_drawdown_pct: number | null;
  exposure: RiskExposure[];
  note: string;
  // Phase 6 depth — computed from cached OHLCV
  benchmark: string;
  annualized_vol_pct: number | null;
  var_95_pct: number | null;
  sharpe: number | null;
  beta: number | null;
  portfolio_drawdown_pct: number | null;
  correlation: CorrelationMatrix;
  monthly_returns: Record<string, number>;
  data_points: number;
}

// ── meta ──────────────────────────────────────────────────────────────
export interface CacheStats {
  cache_hits: number;
  cache_misses: number;
  provider_calls: number;
  errors: number;
  hit_rate: number;
}

export interface SchedulerJob {
  id: string;
  next_run_time: string | null;
}

export interface MetaStats {
  cache: CacheStats;
  llm_cost: number;
  scheduler: { running: boolean; jobs: SchedulerJob[] };
}

// ── backtest ──────────────────────────────────────────────────────────
export interface BacktestMetrics {
  total_return_pct: number | null;
  sharpe_ratio: number | null;
  max_drawdown_pct: number | null;
  total_trades: number;
  win_rate_pct: number | null;
  profit_factor: number | null;
}

export interface EquityPoint {
  date: string;
  value: number;
  benchmark: number | null;
}

export interface BacktestTrade {
  date: string;
  ticker: string;
  action: OrderAction;
  quantity: number;
  price: number;
  trigger: string;
}

export interface BacktestParamsOut {
  universe: string[];
  start: string;
  end: string;
  initial_cash: number;
  step_days: number;
  personas: string[] | string;
  benchmark: string;
}

export interface BacktestRequest {
  universe?: string[];
  start?: string;
  end?: string;
  initial_cash?: number;
  step_days?: number;
  personas?: string[];
  benchmark?: string;
}

export interface BacktestStartResponse {
  backtest_id: string;
  status: string;
  params: BacktestParamsOut;
}

export interface BacktestStatus {
  backtest_id: string;
  status: 'running' | 'done' | 'error';
  progress: number;
  params: BacktestParamsOut;
  error: string | null;
  created_at: string;
  tickers?: string[];
  metrics?: BacktestMetrics;
  equity_curve?: EquityPoint[];
  trades?: BacktestTrade[];
  benchmark?: string;
  disclosure?: string;
}

// ── stratton score ────────────────────────────────────────────────────
export type ScoreLabel = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';

export interface ScoreReason {
  agent_id: string;
  agent_name: string;
  direction: Direction;
  confidence: number;
  reasoning: string;
}

export interface StrattonScore {
  ticker: string;
  score: number;
  label: ScoreLabel;
  net: number;
  bull_count: number;
  bear_count: number;
  neutral_count: number;
  agent_count: number;
  analyst_score: number | null;
  persona_score: number | null;
  top_bullish: ScoreReason[];
  top_bearish: ScoreReason[];
  price: number | null;
  as_of: string;
}

export interface ScoreBoard {
  as_of: string;
  scores: StrattonScore[];
}

// ── onboarding ────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  text: string;
  help: string;
  options: { label: string; points: number }[];
}

export type RiskProfileName = 'Conservative' | 'Balanced' | 'Growth' | 'Aggressive';

export interface InvestorProfile {
  risk_score: number;
  profile: RiskProfileName;
  summary: string;
  mandate: {
    active_personas: string[];
    position_cap_pct: number;
    universe: string[];
    markets: 'india' | 'us' | 'both';
    style: 'value' | 'growth' | 'momentum' | 'committee';
  };
  answers: Record<string, number>;
  applied: boolean;
  created_at: string;
}

export interface ProfileRequest {
  answers: Record<string, number>;
  apply?: boolean;
}

// ── model portfolios ──────────────────────────────────────────────────
export interface PortfolioHolding {
  ticker: string;
  weight_pct: number;
  direction: Direction;
  confidence: number;
  reasons: string[];
}

export interface ModelPortfolio {
  id: string;
  name: string;
  tagline: string;
  description: string;
  persona_keys: string[];
  risk_level: 'Low' | 'Medium' | 'High';
  universe: string[];
  holdings: PortfolioHolding[];
  cash_weight_pct: number;
  bullish_count: number;
  followed: boolean;
  followers: number;
}

export interface FollowResult {
  id: string;
  followed: boolean;
  followers: number;
}

// ── health check ──────────────────────────────────────────────────────
export interface HoldingInput {
  ticker: string;
  quantity: number;
  avg_cost?: number | null;
}

export interface HealthHolding {
  ticker: string;
  quantity: number;
  price: number | null;
  currency: string;
  value: number;
  weight_pct: number;
  avg_cost: number | null;
  pnl_pct: number | null;
  score: StrattonScore;
}

export type Severity = 'high' | 'medium' | 'low';
export type Verdict = 'Approves' | 'Mixed' | 'Disapproves';

export interface HealthReport {
  as_of: string;
  base_currency: 'INR';
  total_value: number;
  health_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  holdings: HealthHolding[];
  warnings: { severity: Severity; title: string; detail: string }[];
  persona_verdicts: {
    persona_key: string;
    display_name: string;
    bullish_weight_pct: number;
    bearish_weight_pct: number;
    verdict: Verdict;
    comment: string;
  }[];
  sector_exposure: { sector: string; weight_pct: number }[];
}

// ── chat ──────────────────────────────────────────────────────────────
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSource {
  kind: 'run' | 'order' | 'position' | 'signal' | 'fund' | 'score';
  ref: string;
  label: string;
  href: string | null;
}

export interface ChatResponse {
  answer: string;
  mode: 'llm' | 'rules';
  sources: ChatSource[];
  suggestions: string[];
}

// ── watchlist & alerts ────────────────────────────────────────────────
export interface WatchlistItem {
  ticker: string;
  added_at: string;
  price: number | null;
  change_pct: number | null;
  currency: string | null;
}

export type AlertKind = 'price_above' | 'price_below' | 'change_pct_abs' | 'score_above' | 'score_below' | 'consensus_flip';

export interface AlertRule {
  id: number;
  ticker: string;
  kind: AlertKind;
  threshold: number | null;
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_value: string | null;
}

export interface AlertRuleIn {
  ticker: string;
  kind: AlertKind;
  threshold?: number | null;
}

export interface AlertEvent {
  id: number;
  rule_id: number | null;
  ticker: string;
  kind: AlertKind;
  message: string;
  ts: string;
  read: boolean;
}
