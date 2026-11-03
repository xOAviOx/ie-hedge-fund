// What the product is and how it works — shared by the overview, pitch, poster and plan.

export const SOLUTION = {
  statement:
    'PortAI runs a paper hedge fund with an AI investment committee. Six analyst models and twelve investor personas score every stock, a risk manager aggregates their views, a portfolio manager places paper trades, and one AI-written memo explains the run. Every signal and order is stored and can be audited.',
  differentiator:
    'Most tools give you an answer. PortAI shows you the argument: who was bullish, who was bearish, how confident each was, and why the fund acted.',
};

export const HOW_IT_WORKS = [
  { step: 'Data', detail: 'End-of-day NSE and US prices, fundamentals and news through a cached data layer' },
  { step: 'Committee', detail: '6 analyst models + 12 investor personas score each stock with deterministic rules' },
  { step: 'Risk', detail: 'A risk manager aggregates conviction and enforces position caps' },
  { step: 'Trade', detail: 'A portfolio manager places paper orders against a ₹10 lakh ledger' },
  { step: 'Explain', detail: 'One LLM call writes a plain-English memo; every signal is saved to the Decision Room' },
];

export const FEATURES = [
  { name: 'Fund Console', detail: 'NAV vs NIFTY 50, positions, cash, orders, run-now and a kill switch' },
  { name: 'Decision Room', detail: 'The audit trail: every agent’s direction, confidence and factors per run' },
  { name: 'Stratton Score', detail: 'A 0–100 committee score for any stock with the reasons behind it' },
  { name: 'Ask the Fund', detail: 'Chat with the fund about its holdings and decisions' },
  { name: 'Backtest Lab', detail: 'Replay the committee over past windows against a benchmark' },
  { name: 'Learn Hub', detail: 'Short lessons that turn each decision into a teaching moment' },
];
