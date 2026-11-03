# Product API contract (v1 additions)

All routes live under `/api/v1`. The caller's fund id comes from
`get_current_user` (always `"local"` in single-user mode). Timestamps are ISO-8601
strings. Money is in the fund's base currency (INR) unless a `currency` field
says otherwise. Every route must work offline in tests via `FakeCache` and
without any LLM key.

Router modules (already stubbed and registered in `backend/app/api/v1/router.py`):

| Module | Owns paths |
|---|---|
| `score.py` | `/score`, `/score/{ticker}` |
| `onboarding.py` | `/onboarding/*` |
| `portfolios.py` | `/portfolios*` |
| `health_check.py` | `/health-check*` |
| `chat.py` | `/chat*` |
| `watchlist.py` | `/watchlist*`, `/alerts*` |
| `waitlist.py` | `/waitlist*` |
| `venture.py` | `/venture/*` |

Shared scoring lives in `backend/app/engine/score.py` (`score_ticker`,
`score_result`, `compute_scores`). Do not duplicate the score math.

---

## Shared shapes

```ts
type Direction = 'bullish' | 'bearish' | 'neutral';

interface ScoreReason {
  agent_id: string;        // e.g. "buffett_analyst"
  agent_name: string;      // e.g. "Warren Buffett"
  direction: Direction;
  confidence: number;      // 0-100
  reasoning: string;
}

interface StrattonScore {
  ticker: string;
  score: number;           // 1.0-10.0, one decimal
  label: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  net: number;             // -1..1 confidence-weighted net vote
  bull_count: number;
  bear_count: number;
  neutral_count: number;
  agent_count: number;
  analyst_score: number | null;   // same scale, 6 analysts only
  persona_score: number | null;   // same scale, personas only
  top_bullish: ScoreReason[];     // up to 3, by confidence desc
  top_bearish: ScoreReason[];
  price: number | null;
  as_of: string;
}
```

## Stratton Score

- `GET /score/{ticker}` → `StrattonScore`
- `GET /score?tickers=A,B,C` → `{ as_of: string; scores: StrattonScore[] }` sorted
  by score desc. Without `tickers`, uses the fund universe.
- `GET /research/{ticker}` gains a `score: StrattonScore` field (computed from the
  same pipeline run, no second run).

## Onboarding (risk profile quiz)

- `GET /onboarding/questions` →
  `{ questions: { id: string; text: string; help: string; options: { label: string; points: number }[] }[] }`
  7 questions: `horizon`, `goal`, `drawdown` (reaction to a 20% fall), `experience`,
  `income` (stability), `markets` (India / US / both; 0 points, sets universe),
  `style` (value / growth / momentum / let the committee decide; 0 points, biases personas).
- `POST /onboarding/profile` body `{ answers: Record<string, number>; apply?: boolean }`
  (value = option index) → `InvestorProfile`. 422 if a scored question is missing.
- `GET /onboarding/profile` → `InvestorProfile | null` (200 with `null` if none yet).

```ts
interface InvestorProfile {
  risk_score: number;                 // 0-100
  profile: 'Conservative' | 'Balanced' | 'Growth' | 'Aggressive';
  summary: string;                    // 1-2 plain-English sentences
  mandate: {
    active_personas: string[];        // persona keys, e.g. ["buffett","munger"]
    position_cap_pct: number;
    universe: string[];
    markets: 'india' | 'us' | 'both';
    style: 'value' | 'growth' | 'momentum' | 'committee';
  };
  answers: Record<string, number>;
  applied: boolean;                   // true if the mandate was written to the fund
  created_at: string;
}
```

`apply: true` writes `active_personas`, `position_cap_pct` and `universe` to the fund.
The fund run must respect `position_cap_pct` (a buy may not take one position
above that % of NAV).

## Model portfolios

- `GET /portfolios` → `{ as_of: string; portfolios: ModelPortfolio[] }`
- `GET /portfolios/{id}` → `ModelPortfolio` (404 for unknown id)
- `POST /portfolios/{id}/follow` → `{ id: string; followed: true; followers: number }`
- `DELETE /portfolios/{id}/follow` → `{ id: string; followed: false; followers: number }`
- `POST /portfolios/{id}/apply` → the fund dict (same shape as `PUT /fund/config`),
  with `active_personas` set to the portfolio's persona keys.

Ids: each of the 12 persona keys, plus `committee` (all 12), `india-compounders`
(jhunjhunwala, lynch, fisher, buffett; NSE tickers only), `deep-value`
(graham, burry, pabrai), `disruptors` (wood, druckenmiller, ackman).

```ts
interface ModelPortfolio {
  id: string;
  name: string;              // "Warren Buffett", "Full Committee", ...
  tagline: string;
  description: string;
  persona_keys: string[];
  risk_level: 'Low' | 'Medium' | 'High';
  universe: string[];
  holdings: { ticker: string; weight_pct: number; direction: Direction; confidence: number; reasons: string[] }[];
  cash_weight_pct: number;   // holdings + cash = 100
  bullish_count: number;
  followed: boolean;
  followers: number;
}
```

Holdings come from one pipeline run over the fund universe: per ticker, average
the portfolio's persona votes (`+conf` bullish, `-conf` bearish, `0` neutral);
hold tickers with a positive average, weight proportional to it, cap each at 25%
with the excess in cash. No bullish tickers means 100% cash.

## Portfolio health check

- `GET /health-check/sample` → `{ csv: string }` (header `ticker,quantity,avg_cost`)
- `POST /health-check` body `{ holdings: { ticker: string; quantity: number; avg_cost?: number | null }[] }`
  (1-30 rows, quantity > 0) → `HealthReport`

```ts
interface HealthReport {
  as_of: string;
  base_currency: 'INR';
  total_value: number;
  health_score: number;     // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  holdings: {
    ticker: string; quantity: number; price: number | null; currency: string;
    value: number;            // INR
    weight_pct: number; avg_cost: number | null; pnl_pct: number | null;
    score: StrattonScore;
  }[];
  warnings: { severity: 'high' | 'medium' | 'low'; title: string; detail: string }[];
  persona_verdicts: {
    persona_key: string; display_name: string;
    bullish_weight_pct: number; bearish_weight_pct: number;
    verdict: 'Approves' | 'Mixed' | 'Disapproves'; comment: string;
  }[];
  sector_exposure: { sector: string; weight_pct: number }[];
}
```

Scoring: start at 100. Largest weight > 25% → -15 (> 40% → -25 instead). Fewer
than 5 holdings → -10. A sector > 40% → -10. Value-weighted average score below 5
→ -(5 - avg) × 8. Bearish-scored holdings > 30% of value → -10. Clamp to 0-100.
Grades: A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, else E.

## Ask the Fund (chat)

- `POST /chat` body `{ message: string; history?: { role: 'user' | 'assistant'; content: string }[] }` →

```ts
interface ChatResponse {
  answer: string;            // plain text, may contain line breaks and "- " bullets
  mode: 'llm' | 'rules';
  sources: { kind: 'run' | 'order' | 'position' | 'signal' | 'fund' | 'score'; ref: string; label: string; href: string | null }[];
  suggestions: string[];     // 3 follow-up questions
}
```

- `GET /chat/suggestions` → `{ suggestions: string[] }`

Grounding: fund state, positions, the last ~20 orders, and the latest run's
per-ticker consensus, signals and memo. With an LLM key, one LLM call answers
from that context only. Without a key, a rules engine answers common intents
(why did we buy/sell X, holdings, performance/NAV, who is bullish/bearish on X,
score of X, what is the fund, latest memo). `href` examples: `/decisions/{run_id}`,
`/research/{ticker}`.

## Watchlist and alerts

- `GET /watchlist` → `{ items: { ticker: string; added_at: string; price: number | null; change_pct: number | null; currency: string | null }[] }`
- `POST /watchlist` body `{ ticker: string }` → item (symbol resolved; idempotent)
- `DELETE /watchlist/{ticker}` → `{ removed: boolean }`
- `GET /alerts` → `{ rules: AlertRule[] }`
- `POST /alerts` body `{ ticker: string; kind: AlertKind; threshold?: number | null }` → `AlertRule`
  (422 if a threshold kind has no threshold)
- `DELETE /alerts/{id}` → `{ deleted: boolean }`
- `POST /alerts/check` → `{ checked: number; triggered: AlertEvent[] }`
- `GET /alerts/events?unread_only=false&limit=50` → `{ events: AlertEvent[]; unread: number }`
- `POST /alerts/events/read` → `{ updated: number }` (marks all read)

```ts
type AlertKind = 'price_above' | 'price_below' | 'change_pct_abs' | 'score_above' | 'score_below' | 'consensus_flip';
interface AlertRule {
  id: number; ticker: string; kind: AlertKind; threshold: number | null;
  active: boolean; created_at: string; last_triggered_at: string | null; last_value: string | null;
}
interface AlertEvent { id: number; rule_id: number | null; ticker: string; kind: AlertKind; message: string; ts: string; read: boolean }
```

Rules are edge-triggered: a threshold rule fires when its condition becomes true
(it was false on the previous check). `consensus_flip` fires when the committee
consensus differs from the last recorded one; the first check only records it.
Triggered events are also pushed to Telegram when configured. The scheduled fund
run calls the alert check after each run.

## Pricing waitlist

- `POST /waitlist` body `{ email: string; plan: 'free' | 'pro' | 'campus' | 'b2b'; name?: string; college?: string }`
  → `{ ok: true; position: number }` (unique email; re-submitting updates the plan; 422 on bad email)
- `GET /waitlist/stats` → `{ total: number; by_plan: Record<string, number> }`

## Venture discovery log and traction

- `GET /venture/interviews?kind=customer|exemplar` → `{ interviews: Interview[] }`
- `POST /venture/interviews` body `InterviewIn` → `Interview`
- `PUT /venture/interviews/{id}` body `InterviewIn` → `Interview`
- `DELETE /venture/interviews/{id}` → `{ deleted: boolean }`
- `GET /venture/metrics` →
  `{ runs: number; orders: number; nav: number | null; nav_return_pct: number | null; waitlist_total: number; interviews_customer: number; interviews_exemplar: number; agents: number; personas: number; universe_size: number }`

```ts
interface InterviewIn {
  kind: 'customer' | 'exemplar';
  name: string; segment: string; date: string;  // YYYY-MM-DD
  channel: string;                               // "In person", "Call", "Email", ...
  pains: string; gains: string; quotes: string;
  willingness_to_pay: string; notes: string;
}
interface Interview extends InterviewIn { id: number; created_at: string }
```
