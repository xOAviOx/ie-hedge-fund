"""Model portfolios: holdings math, follow/unfollow, apply, 404s."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.api.deps import get_cache
from app.main import app
from app.product.portfolios import PORTFOLIOS, build_holdings
from tests._fakes import FakeCache

app.dependency_overrides[get_cache] = lambda: FakeCache()


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _sig(t, d, c, r="why"):
    return {"ticker": t, "signal": d, "confidence": c, "reasoning": r}


def test_build_holdings_weights_and_cap():
    signals = {
        "buffett_analyst": [_sig("A", "bullish", 90), _sig("B", "bullish", 30), _sig("C", "bearish", 80)],
        "munger_analyst": [_sig("A", "bullish", 70), _sig("B", "neutral", 50), _sig("C", "bullish", 20)],
    }
    h = build_holdings(signals, ["buffett", "munger"], ["A", "B", "C"])
    # A avg 80, B avg 15, C avg -30 -> A, B held; A 84% capped to 25, B 15.79%.
    assert [x["ticker"] for x in h] == ["A", "B"]
    assert h[0]["weight_pct"] == 25.0 and h[1]["weight_pct"] == 15.79
    assert h[0]["confidence"] == 80.0 and h[0]["reasons"][0].startswith("Warren Buffett:")

    assert build_holdings({"buffett_analyst": [_sig("A", "bearish", 50)]}, ["buffett"], ["A"]) == []


def test_portfolios_api():
    async def go():
        async with _client() as c:
            r = await c.get("/api/v1/portfolios")
            assert r.status_code == 200, r.text
            body = r.json()
            ids = [p["id"] for p in body["portfolios"]]
            assert len(ids) == 16 and set(ids) == set(PORTFOLIOS)
            for p in body["portfolios"]:
                total = sum(h["weight_pct"] for h in p["holdings"]) + p["cash_weight_pct"]
                assert abs(total - 100) < 0.05
                assert all(h["weight_pct"] <= 25 for h in p["holdings"])
                assert p["bullish_count"] == len(p["holdings"])
                assert p["risk_level"] in ("Low", "Medium", "High")
            india = next(p for p in body["portfolios"] if p["id"] == "india-compounders")
            assert all(t.endswith(".NS") for t in india["universe"])
            committee = next(p for p in body["portfolios"] if p["id"] == "committee")
            assert len(committee["persona_keys"]) == 12

            assert (await c.get("/api/v1/portfolios/nope")).status_code == 404
            assert (await c.post("/api/v1/portfolios/nope/follow")).status_code == 404
            assert (await c.post("/api/v1/portfolios/nope/apply")).status_code == 404

            r = await c.post("/api/v1/portfolios/buffett/follow")
            assert r.json() == {"id": "buffett", "followed": True, "followers": 1}
            r = await c.post("/api/v1/portfolios/buffett/follow")  # idempotent
            assert r.json()["followers"] == 1
            r = await c.get("/api/v1/portfolios/buffett")
            assert r.status_code == 200 and r.json()["followed"] is True and r.json()["followers"] == 1
            r = await c.delete("/api/v1/portfolios/buffett/follow")
            assert r.json() == {"id": "buffett", "followed": False, "followers": 0}

            before = (await c.get("/api/v1/fund")).json()
            r = await c.post("/api/v1/portfolios/deep-value/apply")
            assert r.status_code == 200
            assert r.json()["active_personas"] == ["graham", "burry", "pabrai"]
            assert "position_cap_pct" in r.json()
            await c.put("/api/v1/fund/config", json={"active_personas": before["active_personas"]})

    asyncio.run(go())
