"""Portfolio health check: report shape, INR valuation, scoring rules, validation."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.api.deps import get_cache
from app.main import app
from app.product.health import build_report, grade_for
from tests._fakes import FakeCache

app.dependency_overrides[get_cache] = lambda: FakeCache()


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _sig(t, d, c):
    return {"ticker": t, "signal": d, "confidence": c, "reasoning": "x"}


def test_grades():
    assert [grade_for(s) for s in (90, 85, 70, 55, 40, 10)] == ["A", "A", "B", "C", "D", "E"]


def test_build_report_scoring_rules():
    holdings = [{"ticker": "A.NS", "quantity": 90, "avg_cost": 50.0}, {"ticker": "B.NS", "quantity": 10, "avg_cost": None}]
    signals = {
        "buffett_analyst": [_sig("A.NS", "bearish", 100), _sig("B.NS", "bullish", 100)],
        "technical_analyst": [_sig("A.NS", "bearish", 100), _sig("B.NS", "bullish", 100)],
    }
    rep = build_report(holdings, signals, {"A.NS": 100.0, "B.NS": 100.0}, {"A.NS": "Energy", "B.NS": "Energy"}, 83.0)
    assert rep["total_value"] == 10_000 and rep["holdings"][0]["weight_pct"] == 90
    assert rep["holdings"][0]["pnl_pct"] == 100.0 and rep["holdings"][1]["pnl_pct"] is None
    # -25 (A is 90%), -10 (<5 holdings), -10 (Energy 100%),
    # avg score 0.9*1 + 0.1*10 = 1.9 -> -(5-1.9)*8 = -24.8, -10 (90% bearish) -> 20.2
    assert rep["health_score"] == 20.2 and rep["grade"] == "E"
    assert {w["severity"] for w in rep["warnings"]} >= {"high", "medium"}
    buffett = next(v for v in rep["persona_verdicts"] if v["persona_key"] == "buffett")
    assert buffett["verdict"] == "Disapproves" and buffett["bearish_weight_pct"] == 90
    assert "led by A" in buffett["comment"]
    assert len(rep["persona_verdicts"]) == 12
    assert rep["sector_exposure"] == [{"sector": "Energy", "weight_pct": 100.0}]


def test_health_check_api():
    async def go():
        async with _client() as c:
            r = await c.get("/api/v1/health-check/sample")
            csv = r.json()["csv"]
            lines = csv.strip().splitlines()
            assert lines[0] == "ticker,quantity,avg_cost" and len(lines) == 8

            rows = []
            for line in lines[1:]:
                t, q, cost = line.split(",")
                rows.append({"ticker": t, "quantity": float(q), "avg_cost": float(cost)})
            r = await c.post("/api/v1/health-check", json={"holdings": rows})
            assert r.status_code == 200, r.text
            rep = r.json()
            assert rep["base_currency"] == "INR" and len(rep["holdings"]) == 7
            assert 0 <= rep["health_score"] <= 100 and rep["grade"] in "ABCDE"
            aapl = next(h for h in rep["holdings"] if h["ticker"] == "AAPL")
            assert aapl["currency"] == "USD" and aapl["value"] == round(5 * aapl["price"] * 83.0, 2)
            assert abs(sum(h["weight_pct"] for h in rep["holdings"]) - 100) < 0.05
            assert all(h["score"]["agent_count"] == 18 for h in rep["holdings"])
            assert len(rep["persona_verdicts"]) == 12
            assert rep["sector_exposure"][0]["sector"] == "Unknown"

            bad = [
                {"holdings": []},
                {"holdings": [{"ticker": "TCS", "quantity": 0}]},
                {"holdings": [{"ticker": "TCS", "quantity": 1}] * 31},
                {"holdings": [{"quantity": 1}]},
            ]
            for b in bad:
                assert (await c.post("/api/v1/health-check", json=b)).status_code == 422

    asyncio.run(go())
