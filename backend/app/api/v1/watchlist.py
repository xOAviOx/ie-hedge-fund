"""Watchlist and alerts router (``/watchlist*`` and ``/alerts*``)."""
from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, model_validator
from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_cache, get_current_user, get_db
from app.data.cache import MarketCache
from app.data.models_engagement import AlertEvent, AlertRule, WatchlistItem
from app.data.symbols import resolve_symbol
from app.engagement.alerts import THRESHOLD_KINDS, check_alerts, event_dict, rule_dict

router = APIRouter(tags=["watchlist"])

AlertKind = Literal["price_above", "price_below", "change_pct_abs", "score_above", "score_below", "consensus_flip"]


def _resolve(raw: str) -> str:
    try:
        return resolve_symbol(raw)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


async def _item(cache: MarketCache, w: WatchlistItem) -> dict:
    out = {"ticker": w.ticker, "added_at": w.added_at.isoformat(), "price": None, "change_pct": None, "currency": None}
    try:
        q = await cache.get_quote(w.ticker)
        out.update(price=q.price, change_pct=q.change_pct, currency=q.currency)
    except Exception:  # noqa: BLE001 — quotes are best-effort
        pass
    return out


# ── Watchlist ────────────────────────────────────────────────────────


class WatchIn(BaseModel):
    ticker: str


@router.get("/watchlist")
async def get_watchlist(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    rows = (await session.execute(
        select(WatchlistItem).where(WatchlistItem.fund_id == user).order_by(WatchlistItem.added_at, WatchlistItem.id)
    )).scalars().all()
    return {"items": [await _item(cache, w) for w in rows]}


@router.post("/watchlist")
async def add_watch(
    body: WatchIn,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    ticker = _resolve(body.ticker)
    row = (await session.execute(
        select(WatchlistItem).where(WatchlistItem.fund_id == user, WatchlistItem.ticker == ticker)
    )).scalar_one_or_none()
    if row is None:
        row = WatchlistItem(fund_id=user, ticker=ticker)
        session.add(row)
        await session.commit()
    return await _item(cache, row)


@router.delete("/watchlist/{ticker}")
async def remove_watch(
    ticker: str, user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> dict:
    sym = _resolve(ticker)
    row = (await session.execute(
        select(WatchlistItem).where(WatchlistItem.fund_id == user, WatchlistItem.ticker == sym)
    )).scalar_one_or_none()
    if row is None:
        return {"removed": False}
    await session.delete(row)
    await session.commit()
    return {"removed": True}


# ── Alerts ───────────────────────────────────────────────────────────


class AlertIn(BaseModel):
    ticker: str
    kind: AlertKind
    threshold: Optional[float] = None

    @model_validator(mode="after")
    def _needs_threshold(self) -> "AlertIn":
        if self.kind in THRESHOLD_KINDS and self.threshold is None:
            raise ValueError(f"kind {self.kind!r} requires a threshold")
        return self


@router.get("/alerts")
async def list_rules(user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)) -> dict:
    rows = (await session.execute(
        select(AlertRule).where(AlertRule.fund_id == user).order_by(desc(AlertRule.created_at), desc(AlertRule.id))
    )).scalars().all()
    return {"rules": [rule_dict(r) for r in rows]}


@router.post("/alerts")
async def create_rule(
    body: AlertIn, user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> dict:
    rule = AlertRule(
        fund_id=user, ticker=_resolve(body.ticker), kind=body.kind,
        threshold=None if body.kind == "consensus_flip" else body.threshold, active=True,
    )
    session.add(rule)
    await session.commit()
    return rule_dict(rule)


@router.post("/alerts/check")
async def run_check(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    return await check_alerts(session, user, cache)


@router.get("/alerts/events")
async def list_events(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=500),
) -> dict:
    q = select(AlertEvent).where(AlertEvent.fund_id == user)
    if unread_only:
        q = q.where(AlertEvent.read.is_(False))
    rows = (await session.execute(q.order_by(desc(AlertEvent.ts), desc(AlertEvent.id)).limit(limit))).scalars().all()
    unread = (await session.execute(
        select(func.count()).select_from(AlertEvent).where(AlertEvent.fund_id == user, AlertEvent.read.is_(False))
    )).scalar_one()
    return {"events": [event_dict(e) for e in rows], "unread": unread}


@router.post("/alerts/events/read")
async def mark_read(user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)) -> dict:
    res = await session.execute(
        update(AlertEvent).where(AlertEvent.fund_id == user, AlertEvent.read.is_(False)).values(read=True)
    )
    await session.commit()
    return {"updated": res.rowcount or 0}


@router.delete("/alerts/{rule_id}")
async def delete_rule(
    rule_id: int, user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> dict:
    rule = await session.get(AlertRule, rule_id)
    if rule is None or rule.fund_id != user:
        return {"deleted": False}
    await session.delete(rule)
    await session.commit()
    return {"deleted": True}
