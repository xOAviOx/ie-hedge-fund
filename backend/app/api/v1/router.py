"""API v1 aggregator — mounts every v1 sub-router under one APIRouter."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import (
    backtest,
    chat,
    decisions,
    fund,
    health_check,
    market,
    meta,
    onboarding,
    portfolios,
    research,
    risk,
    score,
    venture,
    waitlist,
    watchlist,
)

api_router = APIRouter()
for _module in (
    meta, market, fund, decisions, research, risk, backtest,
    score, onboarding, portfolios, health_check,
    chat, watchlist, waitlist, venture,
):
    api_router.include_router(_module.router)
