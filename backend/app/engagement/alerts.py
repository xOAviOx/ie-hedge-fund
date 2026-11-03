"""Alert evaluation — edge-triggered price, move, score and consensus alerts.

Each rule keeps the last observed value in ``last_value``. A threshold rule fires
only when its condition is true now and was false for the previous observation
(no previous observation counts as false). ``consensus_flip`` stores the last
committee direction and fires when it changes; the first check only records it.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models_engagement import AlertEvent, AlertRule
from app.notifications import telegram

logger = logging.getLogger(__name__)

THRESHOLD_KINDS = ("price_above", "price_below", "change_pct_abs", "score_above", "score_below")
ALERT_KINDS = THRESHOLD_KINDS + ("consensus_flip",)
_QUOTE_KINDS = {"price_above", "price_below", "change_pct_abs"}
_SCORE_KINDS = {"score_above", "score_below", "consensus_flip"}


def currency_symbol(ticker: str) -> str:
    return "₹" if ticker.upper().endswith((".NS", ".BO")) else "$"


def money(ticker: str, value: float) -> str:
    sym = currency_symbol(ticker)
    if float(value).is_integer():
        return f"{sym}{value:,.0f}"
    return f"{sym}{value:,.2f}"


def consensus_of(score: dict) -> str:
    label = score.get("label", "Hold")
    if label in ("Strong Buy", "Buy"):
        return "bullish"
    if label in ("Strong Sell", "Sell"):
        return "bearish"
    return "neutral"


def _iso(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


def rule_dict(r: AlertRule) -> dict:
    return {
        "id": r.id, "ticker": r.ticker, "kind": r.kind, "threshold": r.threshold,
        "active": bool(r.active), "created_at": _iso(r.created_at),
        "last_triggered_at": _iso(r.last_triggered_at), "last_value": r.last_value,
    }


def event_dict(e: AlertEvent) -> dict:
    return {
        "id": e.id, "rule_id": e.rule_id, "ticker": e.ticker, "kind": e.kind,
        "message": e.message, "ts": _iso(e.ts), "read": bool(e.read),
    }


def _condition(kind: str, value: float, threshold: float) -> bool:
    if kind in ("price_above", "score_above"):
        return value >= threshold
    if kind in ("price_below", "score_below"):
        return value <= threshold
    if kind == "change_pct_abs":
        return abs(value) >= threshold
    return False


def _threshold_message(rule: AlertRule, value: float) -> str:
    t, th = rule.ticker, float(rule.threshold or 0)
    if rule.kind == "price_above":
        return f"{t} crossed above {money(t, th)} (now {currency_symbol(t)}{value:,.2f})"
    if rule.kind == "price_below":
        return f"{t} fell below {money(t, th)} (now {currency_symbol(t)}{value:,.2f})"
    if rule.kind == "change_pct_abs":
        return f"{t} moved {value:+.2f}% today (alert at ±{th:g}%)"
    if rule.kind == "score_above":
        return f"{t} Stratton Score rose to {value:.1f} (alert at {th:g})"
    return f"{t} Stratton Score fell to {value:.1f} (alert at {th:g})"


async def _quotes(cache: Any, tickers: set[str]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for t in sorted(tickers):
        try:
            out[t] = await cache.get_quote(t)
        except Exception as e:  # noqa: BLE001 — one bad quote must not stop the check
            logger.warning("Alert quote failed for %s: %s", t, e)
    return out


async def _scores(cache: Any, tickers: set[str]) -> dict[str, dict]:
    if not tickers:
        return {}
    from app.engine.score import compute_scores

    try:
        return {s["ticker"]: s for s in await compute_scores(sorted(tickers), cache=cache)}
    except Exception as e:  # noqa: BLE001
        logger.warning("Alert score computation failed: %s", e)
        return {}


async def check_alerts(
    session: AsyncSession, fund_id: str, cache: Any, *, notify: bool = True
) -> dict:
    """Evaluate every active rule for ``fund_id``; persist and return triggered events."""
    rules = (await session.execute(
        select(AlertRule).where(AlertRule.fund_id == fund_id, AlertRule.active.is_(True))
    )).scalars().all()

    quotes = await _quotes(cache, {r.ticker for r in rules if r.kind in _QUOTE_KINDS})
    scores = await _scores(cache, {r.ticker for r in rules if r.kind in _SCORE_KINDS})

    now = datetime.now(timezone.utc)
    checked = 0
    events: list[AlertEvent] = []
    for rule in rules:
        message: Optional[str] = None
        if rule.kind == "consensus_flip":
            score = scores.get(rule.ticker)
            if score is None:
                continue
            current = consensus_of(score)
            if rule.last_value is not None and rule.last_value != current:
                message = (f"Committee flipped on {rule.ticker}: {rule.last_value} → {current} "
                           f"(score {score['score']:.1f})")
            rule.last_value = current
        else:
            if rule.kind in _QUOTE_KINDS:
                q = quotes.get(rule.ticker)
                value = None if q is None else (q.price if rule.kind != "change_pct_abs" else q.change_pct)
            else:
                s = scores.get(rule.ticker)
                value = None if s is None else s["score"]
            if value is None or rule.threshold is None:
                continue
            value = float(value)
            was = False
            if rule.last_value is not None:
                try:
                    was = _condition(rule.kind, float(rule.last_value), rule.threshold)
                except ValueError:
                    was = False
            if _condition(rule.kind, value, rule.threshold) and not was:
                message = _threshold_message(rule, value)
            rule.last_value = f"{value:.4f}".rstrip("0").rstrip(".")
        checked += 1
        if message:
            rule.last_triggered_at = now
            ev = AlertEvent(fund_id=fund_id, rule_id=rule.id, ticker=rule.ticker,
                            kind=rule.kind, message=message, ts=now, read=False)
            session.add(ev)
            events.append(ev)

    await session.commit()

    if notify:
        for ev in events:
            try:
                await telegram.send_message(f"*PortAI alert*\n{ev.message}")
            except Exception as e:  # noqa: BLE001
                logger.warning("Alert Telegram push failed: %s", e)

    return {"checked": checked, "triggered": [event_dict(e) for e in events]}
