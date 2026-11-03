"""Stratton Score API: single ticker, batch, fund-universe default, research field."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.api.deps import get_cache
from app.main import app
from tests._fakes import FakeCache

app.dependency_overrides[get_cache] = lambda: FakeCache()

KEYS = {
    "ticker", "score", "label", "net", "bull_count", "bear_count", "neutral_count", "agent_count",
    "analyst_score", "persona_score", "top_bullish", "top_bearish", "price", "as_of",
}


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def test_score_endpoints():
    async def go():
        async with _client() as c:
            r = await c.get("/api/v1/score/MOAT")
            assert r.status_code == 200, r.text
            s = r.json()
            assert set(s) == KEYS and s["ticker"] == "MOAT.NS"
            assert 1 <= s["score"] <= 10 and s["agent_count"] == 18

            r = await c.get("/api/v1/score", params={"tickers": "MOAT,AAPL"})
            body = r.json()
            assert r.status_code == 200 and body["as_of"]
            assert {x["ticker"] for x in body["scores"]} == {"MOAT.NS", "AAPL"}
            sc = [x["score"] for x in body["scores"]]
            assert sc == sorted(sc, reverse=True)

            r = await c.get("/api/v1/score")
            assert r.status_code == 200 and r.json()["scores"]

            r = await c.get("/api/v1/research/MOAT")
            assert r.status_code == 200
            rs = r.json()["score"]
            assert set(rs) == KEYS and rs["score"] == s["score"]

    asyncio.run(go())
