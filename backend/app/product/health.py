"""Portfolio health check: score a user's holdings against the committee.

Pure functions over one pipeline run. Values are in INR; USD holdings convert at
the USDINR rate. See ``docs/PRODUCT_API.md`` for the scoring rules.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.engine.personas import get_persona_engine
from app.engine.score import score_ticker
from app.fund.nav import currency_of, fx_to_base

BASE = "INR"

SAMPLE_CSV = (
    "ticker,quantity,avg_cost\n"
    "RELIANCE,25,2450\n"
    "TCS,10,3600\n"
    "HDFCBANK,30,1550\n"
    "INFY,20,1500\n"
    "ITC,100,430\n"
    "BHARTIARTL,15,1200\n"
    "AAPL,5,180\n"
)


def _short(ticker: str) -> str:
    return ticker.removesuffix(".NS").removesuffix(".BO")


def grade_for(score: float) -> str:
    if score >= 85:
        return "A"
    if score >= 70:
        return "B"
    if score >= 55:
        return "C"
    if score >= 40:
        return "D"
    return "E"


def _verdict(display_name: str, key: str, bull: float, bear: float, lead_bull: Optional[str], lead_bear: Optional[str]) -> dict:
    if bull > bear + 20:
        verdict = "Approves"
        comment = f"Bullish on {bull:.0f}% of your holdings by value" + (f", led by {_short(lead_bull)}." if lead_bull else ".")
    elif bear > bull + 20:
        verdict = "Disapproves"
        comment = f"Bearish on {bear:.0f}% of your holdings by value" + (f", led by {_short(lead_bear)}." if lead_bear else ".")
    else:
        verdict = "Mixed"
        comment = f"Split view: bullish on {bull:.0f}% and bearish on {bear:.0f}% of your holdings by value."
    return {
        "persona_key": key, "display_name": display_name,
        "bullish_weight_pct": round(bull, 2), "bearish_weight_pct": round(bear, 2),
        "verdict": verdict, "comment": comment,
    }


def build_report(
    holdings: list[dict],
    signals: dict[str, list[dict]],
    prices: dict[str, float],
    sectors: dict[str, Optional[str]],
    fx_usdinr: float,
) -> dict:
    """``holdings``: ``[{ticker (resolved), quantity, avg_cost}]`` with unique tickers."""
    as_of = datetime.now(timezone.utc).isoformat()

    rows = []
    for h in holdings:
        t = h["ticker"]
        price = prices.get(t)
        price = float(price) if price else None
        cur = currency_of(t)
        value = h["quantity"] * price * fx_to_base(cur, BASE, fx_usdinr) if price else 0.0
        avg_cost = h.get("avg_cost")
        pnl = round((price / avg_cost - 1) * 100, 2) if price and avg_cost else None
        rows.append({
            "ticker": t, "quantity": h["quantity"], "price": price, "currency": cur,
            "value": round(value, 2), "weight_pct": 0.0, "avg_cost": avg_cost, "pnl_pct": pnl,
            "score": score_ticker(t, signals, price, as_of),
        })

    total = sum(r["value"] for r in rows)
    for r in rows:
        r["weight_pct"] = round(r["value"] / total * 100, 2) if total > 0 else 0.0
    rows.sort(key=lambda r: (-r["value"], r["ticker"]))
    weights = {r["ticker"]: (r["value"] / total * 100 if total > 0 else 0.0) for r in rows}

    sector_w: dict[str, float] = {}
    for r in rows:
        sec = sectors.get(r["ticker"]) or "Unknown"
        sector_w[sec] = sector_w.get(sec, 0.0) + weights[r["ticker"]]
    sector_exposure = [
        {"sector": s, "weight_pct": round(w, 2)}
        for s, w in sorted(sector_w.items(), key=lambda kv: (-kv[1], kv[0]))
    ]

    health = 100.0
    warnings: list[dict] = []
    top = rows[0] if rows else None
    top_w = weights[top["ticker"]] if top else 0.0
    if top_w > 40:
        health -= 25
        warnings.append({"severity": "high", "title": f"{_short(top['ticker'])} dominates your portfolio",
                         "detail": f"{top_w:.0f}% of your money sits in one stock. A single bad result could hurt the whole portfolio."})
    elif top_w > 25:
        health -= 15
        warnings.append({"severity": "medium", "title": f"Heavy position in {_short(top['ticker'])}",
                         "detail": f"{top_w:.0f}% of your money is in one stock. Most professional funds keep single positions below 25%."})

    if len(rows) < 5:
        health -= 10
        warnings.append({"severity": "medium", "title": "Too few holdings",
                         "detail": f"You hold {len(rows)} stock{'s' if len(rows) != 1 else ''}. Five or more spreads company-specific risk."})

    big_sector = next((s for s in sector_exposure if s["weight_pct"] > 40 and s["sector"] != "Unknown"), None)
    if big_sector:
        health -= 10
        warnings.append({"severity": "medium", "title": f"Concentrated in {big_sector['sector']}",
                         "detail": f"{big_sector['weight_pct']:.0f}% of your money is in one sector, so a sector-wide downturn would hit hard."})

    if rows:
        if total > 0:
            avg_score = sum(r["score"]["score"] * weights[r["ticker"]] for r in rows) / 100.0
        else:
            avg_score = sum(r["score"]["score"] for r in rows) / len(rows)
        if avg_score < 5:
            health -= (5 - avg_score) * 8
            warnings.append({"severity": "high" if avg_score < 4 else "medium", "title": "Weak committee view",
                             "detail": f"Your value-weighted Stratton Score is {avg_score:.1f}/10; the committee leans negative on what you own."})

    bearish_w = sum(weights[r["ticker"]] for r in rows if r["score"]["label"] in ("Sell", "Strong Sell"))
    if bearish_w > 30:
        health -= 10
        warnings.append({"severity": "high", "title": "Large bearish exposure",
                         "detail": f"{bearish_w:.0f}% of your money is in stocks the committee rates Sell or Strong Sell."})

    missing = [_short(r["ticker"]) for r in rows if r["price"] is None]
    if missing:
        warnings.append({"severity": "low", "title": "Missing prices",
                         "detail": f"No price found for {', '.join(missing)}; valued at zero in this report."})

    health = max(0.0, min(100.0, health))

    verdicts = []
    by_weight = [r["ticker"] for r in rows]
    for key, cfg in get_persona_engine().configs.items():
        bull_t, bear_t = [], []
        for t in by_weight:
            s = next((x for x in signals.get(cfg.agent_id, []) if x.get("ticker") == t), None)
            d = str(s.get("signal", "neutral")).lower() if s else "neutral"
            if d == "bullish":
                bull_t.append(t)
            elif d == "bearish":
                bear_t.append(t)
        verdicts.append(_verdict(
            cfg.display_name, key,
            sum(weights[t] for t in bull_t), sum(weights[t] for t in bear_t),
            bull_t[0] if bull_t else None, bear_t[0] if bear_t else None,
        ))

    return {
        "as_of": as_of,
        "base_currency": BASE,
        "total_value": round(total, 2),
        "health_score": round(health, 1),
        "grade": grade_for(health),
        "holdings": rows,
        "warnings": warnings,
        "persona_verdicts": verdicts,
        "sector_exposure": sector_exposure,
    }
