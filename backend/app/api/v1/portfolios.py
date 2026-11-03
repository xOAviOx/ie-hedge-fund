"""Model portfolios router — what each legend (or blend) would hold today."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_cache, get_current_user, get_db
from app.api.v1.fund import fund_dict
from app.data.cache import MarketCache
from app.data.models import PortfolioFollow
from app.engine.pipeline import run_pipeline
from app.fund import ledger
from app.product import portfolios as pf

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


def _spec_or_404(portfolio_id: str) -> dict:
    spec = pf.get_spec(portfolio_id)
    if spec is None:
        raise HTTPException(status_code=404, detail=f"unknown portfolio '{portfolio_id}'")
    return spec


async def _follow_state(session: AsyncSession, user: str) -> tuple[set[str], dict[str, int]]:
    mine = set((await session.execute(
        select(PortfolioFollow.portfolio_id).where(PortfolioFollow.fund_id == user)
    )).scalars().all())
    counts = dict((await session.execute(
        select(PortfolioFollow.portfolio_id, func.count()).group_by(PortfolioFollow.portfolio_id)
    )).all())
    return mine, counts


async def _signals(session: AsyncSession, user: str, cache: MarketCache) -> tuple[list[str], dict]:
    fund = await ledger.get_or_create_fund(session, user)
    await session.commit()
    universe = list(fund.universe) or list(ledger.DEFAULT_UNIVERSE)
    result = await run_pipeline(universe, personas="all", cache=cache, write_memo=False, resolve=True)
    return result.tickers, result.signals


@router.get("")
async def list_portfolios(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    universe, signals = await _signals(session, user, cache)
    mine, counts = await _follow_state(session, user)
    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "portfolios": [
            pf.build_portfolio(spec, signals, universe, followed=pid in mine, followers=counts.get(pid, 0))
            for pid, spec in pf.PORTFOLIOS.items()
        ],
    }


@router.get("/{portfolio_id}")
async def get_portfolio(
    portfolio_id: str,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    spec = _spec_or_404(portfolio_id)
    universe, signals = await _signals(session, user, cache)
    mine, counts = await _follow_state(session, user)
    return pf.build_portfolio(spec, signals, universe, followed=portfolio_id in mine,
                              followers=counts.get(portfolio_id, 0))


async def _followers(session: AsyncSession, portfolio_id: str) -> int:
    return (await session.execute(
        select(func.count()).select_from(PortfolioFollow).where(PortfolioFollow.portfolio_id == portfolio_id)
    )).scalar_one()


@router.post("/{portfolio_id}/follow")
async def follow(
    portfolio_id: str,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    _spec_or_404(portfolio_id)
    existing = (await session.execute(
        select(PortfolioFollow).where(PortfolioFollow.fund_id == user, PortfolioFollow.portfolio_id == portfolio_id)
    )).scalar_one_or_none()
    if existing is None:
        session.add(PortfolioFollow(fund_id=user, portfolio_id=portfolio_id))
        await session.commit()
    return {"id": portfolio_id, "followed": True, "followers": await _followers(session, portfolio_id)}


@router.delete("/{portfolio_id}/follow")
async def unfollow(
    portfolio_id: str,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    _spec_or_404(portfolio_id)
    await session.execute(
        delete(PortfolioFollow).where(PortfolioFollow.fund_id == user, PortfolioFollow.portfolio_id == portfolio_id)
    )
    await session.commit()
    return {"id": portfolio_id, "followed": False, "followers": await _followers(session, portfolio_id)}


@router.post("/{portfolio_id}/apply")
async def apply_portfolio(
    portfolio_id: str,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    spec = _spec_or_404(portfolio_id)
    fund = await ledger.get_or_create_fund(session, user)
    fund.active_personas = list(spec["persona_keys"])
    await session.commit()
    return fund_dict(fund)
