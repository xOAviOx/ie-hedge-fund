"""Model portfolios: what each investor (or blend) would hold today.

Holdings come from one pipeline run over the fund universe. Per ticker, the
portfolio's persona votes are averaged (+confidence bullish, -confidence bearish,
0 neutral); tickers with a positive average are held, weighted by it, each capped
at 25% with the excess left in cash.
"""
from __future__ import annotations

from typing import Any, Optional

from app.engine.personas import get_persona_engine
from app.product.onboarding import ALL_PERSONAS

MAX_WEIGHT_PCT = 25.0

# id -> (name, tagline, description, persona_keys, risk_level, nse_only)
_SPECS: list[tuple[str, str, str, str, list[str], str, bool]] = [
    ("buffett", "Warren Buffett", "Wonderful businesses with durable moats.",
     "Value investing with an economic-moat focus: high and durable returns on equity, "
     "conservative balance sheets, real free cash flow, and a sensible entry price.",
     ["buffett"], "Low", False),
    ("munger", "Charlie Munger", "Quality businesses at a fair price.",
     "Pays a fair price for exceptional quality rather than a cheap price for mediocrity: "
     "strong margins, high returns on capital and little debt.",
     ["munger"], "Low", False),
    ("graham", "Benjamin Graham", "Deep value with a strict margin of safety.",
     "The father of value investing: buys only when the price sits well below conservative "
     "estimates of worth, with liquid balance sheets and a record of earnings.",
     ["graham"], "Low", False),
    ("pabrai", "Mohnish Pabrai", "Heads I win, tails I don't lose much.",
     "Concentrated dhandho value: a few simple, cash-generative businesses bought when the "
     "downside is small and the upside is large.",
     ["pabrai"], "Medium", False),
    ("lynch", "Peter Lynch", "Growth at a reasonable price.",
     "Hunts for companies growing earnings fast without paying up for it, using the PEG "
     "ratio as the guardrail between growth and value.",
     ["lynch"], "Medium", False),
    ("fisher", "Philip Fisher", "Scuttlebutt growth investing.",
     "Backs companies with long runways for sales growth, strong margins and the research "
     "edge to keep compounding for years.",
     ["fisher"], "Medium", False),
    ("wood", "Cathie Wood", "Disruptive innovation, five years out.",
     "Disruptive-innovation growth: rapid revenue growth and heavy reinvestment in "
     "technology platforms, accepting high valuations and volatility.",
     ["wood"], "High", False),
    ("damodaran", "Aswath Damodaran", "Every price needs a story and a number.",
     "Intrinsic valuation and cash-flow discipline: buys when the cash flows a business can "
     "generate justify more than the market is asking.",
     ["damodaran"], "Medium", False),
    ("druckenmiller", "Stanley Druckenmiller", "Macro-driven momentum.",
     "Rides relative strength and price trends when the macro backdrop supports them, and "
     "cuts quickly when it does not.",
     ["druckenmiller"], "High", False),
    ("burry", "Michael Burry", "Contrarian deep value.",
     "Goes where others will not: unloved, cheap stocks with hard asset or cash-flow "
     "support, often against the prevailing narrative.",
     ["burry"], "High", False),
    ("jhunjhunwala", "Rakesh Jhunjhunwala", "Bet on India's growth story.",
     "India-style growth-plus-value hybrid: strong businesses riding domestic growth, "
     "bought with conviction and held through cycles.",
     ["jhunjhunwala"], "Medium", False),
    ("ackman", "Bill Ackman", "Activist value with hard catalysts.",
     "Concentrated positions in high-quality, predictable businesses where a clear "
     "catalyst can unlock value.",
     ["ackman"], "High", False),
    ("committee", "Full Committee", "All twelve legends, one consensus.",
     "Every persona votes on every stock; only names with net conviction across value, "
     "growth, macro and contrarian styles make the cut.",
     list(ALL_PERSONAS), "Medium", False),
    ("india-compounders", "India Compounders", "NSE leaders built to compound for decades.",
     "Jhunjhunwala, Lynch, Fisher and Buffett on Indian equities only: durable growth "
     "businesses riding the domestic consumption and credit cycle.",
     ["jhunjhunwala", "lynch", "fisher", "buffett"], "Medium", True),
    ("deep-value", "Deep Value", "Cheap, unloved, and protected on the downside.",
     "Graham, Burry and Pabrai: stocks priced well below conservative worth, where the "
     "margin of safety does the heavy lifting.",
     ["graham", "burry", "pabrai"], "Medium", False),
    ("disruptors", "Disruptors", "Innovation and momentum with a catalyst.",
     "Wood, Druckenmiller and Ackman: fast growers, strong trends and concentrated "
     "catalyst bets. Expect big swings in both directions.",
     ["wood", "druckenmiller", "ackman"], "High", False),
]

PORTFOLIOS: dict[str, dict] = {
    pid: {
        "id": pid, "name": name, "tagline": tagline, "description": desc,
        "persona_keys": keys, "risk_level": risk, "nse_only": nse_only,
    }
    for pid, name, tagline, desc, keys, risk, nse_only in _SPECS
}


def _persona_signal(signals: dict[str, list[dict]], agent_id: str, ticker: str) -> Optional[dict]:
    return next((s for s in signals.get(agent_id, []) if s.get("ticker") == ticker), None)


def build_holdings(signals: dict[str, list[dict]], persona_keys: list[str], universe: list[str]) -> list[dict]:
    """Average the personas' votes per ticker and weight the positive ones."""
    configs = get_persona_engine().configs
    agents = [(configs[k].agent_id, configs[k].display_name) for k in persona_keys if k in configs]

    picks: list[tuple[str, float, list[str]]] = []
    for ticker in universe:
        votes, reasons = [], []
        for agent_id, name in agents:
            s = _persona_signal(signals, agent_id, ticker)
            if s is None:
                continue
            direction = str(s.get("signal", "neutral")).lower()
            conf = float(s.get("confidence", 0) or 0)
            votes.append(conf if direction == "bullish" else -conf if direction == "bearish" else 0.0)
            if direction == "bullish":
                reasons.append(f"{name}: {s.get('reasoning', '')}")
        avg = sum(votes) / len(votes) if votes else 0.0
        if avg > 0:
            picks.append((ticker, avg, reasons))

    total = sum(avg for _, avg, _ in picks)
    holdings = [
        {
            "ticker": t,
            "weight_pct": round(min(MAX_WEIGHT_PCT, avg / total * 100.0), 2),
            "direction": "bullish",
            "confidence": round(avg, 1),
            "reasons": reasons,
        }
        for t, avg, reasons in picks
    ]
    return sorted(holdings, key=lambda h: (-h["weight_pct"], h["ticker"]))


def build_portfolio(
    spec: dict,
    signals: dict[str, list[dict]],
    fund_universe: list[str],
    *,
    followed: bool = False,
    followers: int = 0,
) -> dict:
    universe = [t for t in fund_universe if t.endswith(".NS")] if spec["nse_only"] else list(fund_universe)
    holdings = build_holdings(signals, spec["persona_keys"], universe)
    invested = round(sum(h["weight_pct"] for h in holdings), 2)
    return {
        "id": spec["id"],
        "name": spec["name"],
        "tagline": spec["tagline"],
        "description": spec["description"],
        "persona_keys": list(spec["persona_keys"]),
        "risk_level": spec["risk_level"],
        "universe": universe,
        "holdings": holdings,
        "cash_weight_pct": round(100.0 - invested, 2),
        "bullish_count": len(holdings),
        "followed": followed,
        "followers": followers,
    }


def all_portfolio_ids() -> list[str]:
    return list(PORTFOLIOS)


def get_spec(portfolio_id: str) -> Optional[dict[str, Any]]:
    return PORTFOLIOS.get(portfolio_id)
