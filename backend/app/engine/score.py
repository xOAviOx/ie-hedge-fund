"""Stratton Score — one 1-10 number per ticker from the full agent committee.

Every agent (6 analysts + up to 12 personas) casts a direction weighted by its
confidence. Neutral agents count in the denominator on purpose: a ticker only
scores high when a broad share of the committee is convinced, not when two
agents are loud and the rest abstain.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

PERSONA_DISPLAY = {
    "buffett_analyst": "Warren Buffett",
    "munger_analyst": "Charlie Munger",
    "graham_analyst": "Benjamin Graham",
    "pabrai_analyst": "Mohnish Pabrai",
    "lynch_analyst": "Peter Lynch",
    "fisher_analyst": "Philip Fisher",
    "wood_analyst": "Cathie Wood",
    "damodaran_analyst": "Aswath Damodaran",
    "druckenmiller_analyst": "Stanley Druckenmiller",
    "burry_analyst": "Michael Burry",
    "jhunjhunwala_analyst": "Rakesh Jhunjhunwala",
    "ackman_analyst": "Bill Ackman",
}
ANALYST_DISPLAY = {
    "fundamentals_analyst": "Fundamentals",
    "technical_analyst": "Technical",
    "sentiment_analyst": "Sentiment",
    "valuation_analyst": "Valuation",
    "growth_analyst": "Growth",
    "macro_regime_analyst": "Macro Regime",
}

_DIR = {"bullish": 1, "bearish": -1}


def agent_name(agent_id: str) -> str:
    return PERSONA_DISPLAY.get(agent_id) or ANALYST_DISPLAY.get(agent_id) or agent_id.replace("_analyst", "").replace("_", " ").title()


def is_persona(agent_id: str) -> bool:
    return agent_id in PERSONA_DISPLAY


def _net(signals: list[dict]) -> Optional[float]:
    if not signals:
        return None
    total = 0.0
    for s in signals:
        v = _DIR.get(str(s.get("signal", "neutral")).lower(), 0)
        w = max(0.0, min(1.0, float(s.get("confidence", 0) or 0) / 100.0))
        total += v * w
    return total / len(signals)


def net_to_score(net: Optional[float]) -> Optional[float]:
    if net is None:
        return None
    return round(1 + (max(-1.0, min(1.0, net)) + 1) * 4.5, 1)


def score_label(score: float) -> str:
    if score >= 8:
        return "Strong Buy"
    if score >= 6.5:
        return "Buy"
    if score > 4.5:
        return "Hold"
    if score >= 3:
        return "Sell"
    return "Strong Sell"


def _reason(agent_id: str, s: dict) -> dict:
    return {
        "agent_id": agent_id,
        "agent_name": agent_name(agent_id),
        "direction": str(s.get("signal", "neutral")).lower(),
        "confidence": float(s.get("confidence", 0) or 0),
        "reasoning": s.get("reasoning", ""),
    }


def score_ticker(
    ticker: str,
    signals_by_agent: dict[str, list[dict]],
    price: Optional[float] = None,
    as_of: Optional[str] = None,
) -> dict:
    """Score one ticker from pipeline-shaped signals ``{agent_id: [signal, ...]}``."""
    rows: list[tuple[str, dict]] = []
    for agent_id, sigs in signals_by_agent.items():
        for s in sigs:
            if s.get("ticker") == ticker:
                rows.append((agent_id, s))

    all_sigs = [s for _, s in rows]
    net = _net(all_sigs)
    score = net_to_score(net) if net is not None else 5.5
    directions = [str(s.get("signal", "neutral")).lower() for s in all_sigs]

    bulls = sorted((r for r in rows if str(r[1].get("signal")).lower() == "bullish"),
                   key=lambda r: -float(r[1].get("confidence", 0) or 0))
    bears = sorted((r for r in rows if str(r[1].get("signal")).lower() == "bearish"),
                   key=lambda r: -float(r[1].get("confidence", 0) or 0))

    return {
        "ticker": ticker,
        "score": score,
        "label": score_label(score),
        "net": round(net, 4) if net is not None else 0.0,
        "bull_count": directions.count("bullish"),
        "bear_count": directions.count("bearish"),
        "neutral_count": len(directions) - directions.count("bullish") - directions.count("bearish"),
        "agent_count": len(directions),
        "analyst_score": net_to_score(_net([s for a, s in rows if not is_persona(a)])),
        "persona_score": net_to_score(_net([s for a, s in rows if is_persona(a)])),
        "top_bullish": [_reason(a, s) for a, s in bulls[:3]],
        "top_bearish": [_reason(a, s) for a, s in bears[:3]],
        "price": price,
        "as_of": as_of or datetime.now(timezone.utc).isoformat(),
    }


def score_result(result: Any) -> list[dict]:
    """Score every ticker in a pipeline ``RunResult``, best first."""
    as_of = datetime.now(timezone.utc).isoformat()
    scores = [
        score_ticker(t, result.signals, result.current_prices.get(t), as_of)
        for t in result.tickers
    ]
    return sorted(scores, key=lambda s: -s["score"])


async def compute_scores(tickers: list[str], *, cache: Any = None, personas: Any = "all") -> list[dict]:
    """Run the deterministic pipeline (no memo) over ``tickers`` and score each."""
    from app.engine.pipeline import run_pipeline

    result = await run_pipeline(tickers, personas=personas, cache=cache, write_memo=False, resolve=True)
    return score_result(result)
