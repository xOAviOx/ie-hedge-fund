"""Portfolio health check router — score an uploaded portfolio against the committee."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import get_cache
from app.data.cache import MarketCache
from app.data.symbols import resolve_symbol
from app.engine.pipeline import run_pipeline
from app.fund.service import fetch_fx_usdinr
from app.product import health

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health-check", tags=["health_check"])


class HoldingIn(BaseModel):
    ticker: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    avg_cost: Optional[float] = Field(default=None, ge=0)


class HealthCheckIn(BaseModel):
    holdings: list[HoldingIn] = Field(min_length=1, max_length=30)


async def _sector(cache: Any, symbol: str) -> Optional[str]:
    try:
        d = await cache.get_details(symbol)
        return d.sector if d else None
    except Exception as e:  # noqa: BLE001
        logger.warning("details fetch failed for %s: %s", symbol, e)
        return None


@router.get("/sample")
async def sample() -> dict:
    return {"csv": health.SAMPLE_CSV}


@router.post("")
async def health_check(body: HealthCheckIn, cache: MarketCache = Depends(get_cache)) -> dict:
    merged: dict[str, dict] = {}
    for h in body.holdings:
        try:
            t = resolve_symbol(h.ticker)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e)) from e
        if t not in merged:
            merged[t] = {"ticker": t, "quantity": 0.0, "cost": 0.0, "cost_qty": 0.0}
        m = merged[t]
        m["quantity"] += h.quantity
        if h.avg_cost is not None:
            m["cost"] += h.avg_cost * h.quantity
            m["cost_qty"] += h.quantity
    holdings = [
        {"ticker": t, "quantity": m["quantity"],
         "avg_cost": round(m["cost"] / m["cost_qty"], 4) if m["cost_qty"] else None}
        for t, m in merged.items()
    ]
    tickers = list(merged)

    result = await run_pipeline(tickers, personas="all", cache=cache, write_memo=False, resolve=False)
    fx_usdinr, sectors = await asyncio.gather(
        fetch_fx_usdinr(cache), asyncio.gather(*[_sector(cache, t) for t in tickers]),
    )
    return health.build_report(
        holdings, result.signals, result.current_prices, dict(zip(tickers, sectors)), fx_usdinr,
    )
