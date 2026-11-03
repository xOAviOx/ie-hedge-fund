"""Stratton Score router — committee-wide 1-10 scores per ticker."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_cache, get_current_user, get_db
from app.data.cache import MarketCache
from app.data.symbols import resolve_symbol
from app.engine.score import compute_scores
from app.fund import ledger

router = APIRouter(prefix="/score", tags=["score"])


@router.get("")
async def scores(
    tickers: Optional[str] = Query(None, description="Comma-separated symbols; defaults to the fund universe"),
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    if tickers:
        symbols = [t.strip() for t in tickers.split(",") if t.strip()]
    else:
        fund = await ledger.get_or_create_fund(session, user)
        await session.commit()
        symbols = list(fund.universe) or list(ledger.DEFAULT_UNIVERSE)
    try:
        symbols = list(dict.fromkeys(resolve_symbol(s) for s in symbols))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    if not symbols:
        raise HTTPException(status_code=422, detail="no tickers given")
    result = await compute_scores(symbols, cache=cache)
    return {"as_of": datetime.now(timezone.utc).isoformat(), "scores": result}


@router.get("/{ticker}")
async def score_one(ticker: str, cache: MarketCache = Depends(get_cache)) -> dict:
    try:
        symbol = resolve_symbol(ticker)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    return (await compute_scores([symbol], cache=cache))[0]
