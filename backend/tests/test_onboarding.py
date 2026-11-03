"""Onboarding quiz: scoring thresholds, mandate mapping, persistence and apply."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.api.deps import get_cache
from app.main import app
from app.product.onboarding import ALL_PERSONAS, build_profile
from tests._fakes import FakeCache

app.dependency_overrides[get_cache] = lambda: FakeCache()

MAX = {"horizon": 3, "goal": 3, "drawdown": 3, "experience": 3, "income": 3}
MIN = {"horizon": 0, "goal": 0, "drawdown": 0, "experience": 0, "income": 0}


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def test_profile_thresholds_and_mandates():
    low = build_profile({**MIN, "markets": 0, "style": 0})
    assert low["risk_score"] == 0 and low["profile"] == "Conservative"
    assert low["mandate"]["position_cap_pct"] == 10
    assert low["mandate"]["active_personas"] == ["graham", "buffett", "munger", "pabrai"]
    assert low["mandate"]["universe"] and all(t.endswith(".NS") for t in low["mandate"]["universe"])

    high = build_profile({**MAX, "markets": 1, "style": 1})
    assert high["risk_score"] == 100 and high["profile"] == "Aggressive"
    assert high["mandate"]["position_cap_pct"] == 30
    assert {"lynch", "fisher", "wood"} <= set(high["mandate"]["active_personas"])
    assert high["mandate"]["universe"] and not any(t.endswith(".NS") for t in high["mandate"]["universe"])

    mid = build_profile({"horizon": 2, "goal": 2, "drawdown": 1, "experience": 1, "income": 1})
    assert mid["profile"] == "Balanced" and mid["mandate"]["markets"] == "both"
    assert mid["mandate"]["style"] == "committee" and mid["mandate"]["active_personas"] == ALL_PERSONAS

    growth = build_profile({**MAX, "goal": 1, "drawdown": 1, "style": 2})
    assert growth["profile"] == "Growth" and "druckenmiller" in growth["mandate"]["active_personas"]


def test_onboarding_api_flow():
    async def go():
        async with _client() as c:
            r = await c.get("/api/v1/onboarding/questions")
            assert r.status_code == 200
            qs = r.json()["questions"]
            assert [q["id"] for q in qs] == ["horizon", "goal", "drawdown", "experience", "income", "markets", "style"]
            assert all(q["options"] and q["help"] for q in qs)

            r = await c.post("/api/v1/onboarding/profile", json={"answers": {"horizon": 1}})
            assert r.status_code == 422
            r = await c.post("/api/v1/onboarding/profile", json={"answers": {**MAX, "horizon": 9}})
            assert r.status_code == 422
            r = await c.post("/api/v1/onboarding/profile", json={})
            assert r.status_code == 422

            r = await c.post("/api/v1/onboarding/profile", json={"answers": {**MIN, "markets": 0, "style": 0}})
            assert r.status_code == 200, r.text
            p = r.json()
            assert p["profile"] == "Conservative" and p["applied"] is False and p["summary"]
            assert p["created_at"]

            before = (await c.get("/api/v1/fund")).json()
            r = await c.post("/api/v1/onboarding/profile",
                             json={"answers": {**MAX, "markets": 2, "style": 3}, "apply": True})
            assert r.status_code == 200
            p = r.json()
            assert p["applied"] is True and p["profile"] == "Aggressive"

            r = await c.get("/api/v1/onboarding/profile")
            assert r.status_code == 200 and r.json()["risk_score"] == 100

            fund = (await c.get("/api/v1/fund")).json()
            assert fund["position_cap_pct"] == 30
            assert fund["active_personas"] == ALL_PERSONAS
            assert fund["universe"] == p["mandate"]["universe"]

            await c.put("/api/v1/fund/config", json={
                "universe": before["universe"], "active_personas": before["active_personas"],
                "position_cap_pct": before["position_cap_pct"],
            })

    asyncio.run(go())
