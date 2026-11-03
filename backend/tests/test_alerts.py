"""Watchlist + edge-triggered alerts (offline via FakeCache)."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.api.deps import get_cache
from app.data.models_engagement import AlertRule
from app.engagement import alerts as alerts_mod
from app.fund import scheduler
from app.main import app
from app.data.providers.base import Quote
from tests._fakes import FakeCache, make_memory_db

app.dependency_overrides[get_cache] = lambda: FakeCache()


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def test_watchlist_crud():
    async def go():
        async with _client() as c:
            r = await c.post("/api/v1/watchlist", json={"ticker": "reliance"})
            assert r.status_code == 200
            item = r.json()
            assert item["ticker"] == "RELIANCE.NS" and item["price"] == 159.0 and item["added_at"]
            r = await c.post("/api/v1/watchlist", json={"ticker": "RELIANCE.NS"})
            assert r.status_code == 200
            r = await c.get("/api/v1/watchlist")
            tickers = [i["ticker"] for i in r.json()["items"]]
            assert tickers.count("RELIANCE.NS") == 1
            r = await c.delete("/api/v1/watchlist/RELIANCE")
            assert r.json() == {"removed": True}
            r = await c.delete("/api/v1/watchlist/RELIANCE")
            assert r.json() == {"removed": False}

    asyncio.run(go())


def test_alert_rules_and_events():
    async def go():
        async with _client() as c:
            for rule in (await c.get("/api/v1/alerts")).json()["rules"]:
                await c.delete(f"/api/v1/alerts/{rule['id']}")

            r = await c.post("/api/v1/alerts", json={"ticker": "RELIANCE", "kind": "price_above"})
            assert r.status_code == 422
            r = await c.post("/api/v1/alerts", json={"ticker": "RELIANCE", "kind": "bogus", "threshold": 1})
            assert r.status_code == 422

            created = {}
            for kind, th in (("price_above", 150), ("price_below", 100), ("change_pct_abs", 0.5),
                             ("score_above", 1), ("consensus_flip", None)):
                r = await c.post("/api/v1/alerts", json={"ticker": "RELIANCE", "kind": kind, "threshold": th})
                assert r.status_code == 200, r.text
                created[kind] = r.json()
                assert created[kind]["active"] is True and created[kind]["last_value"] is None

            r = await c.post("/api/v1/alerts/check")
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["checked"] == 5
            kinds = {e["kind"]: e for e in body["triggered"]}
            assert set(kinds) == {"price_above", "change_pct_abs", "score_above"}
            assert kinds["price_above"]["message"] == "RELIANCE.NS crossed above ₹150 (now ₹159.00)"

            # Edge-triggered: nothing changed, nothing fires.
            r = await c.post("/api/v1/alerts/check")
            assert r.json()["triggered"] == []

            rules = {x["kind"]: x for x in (await c.get("/api/v1/alerts")).json()["rules"]}
            current = rules["consensus_flip"]["last_value"]
            assert current in ("bullish", "bearish", "neutral")
            assert rules["price_above"]["last_triggered_at"] is not None

            from app.data.db import async_session_maker
            other = "bearish" if current != "bearish" else "bullish"
            async with async_session_maker() as s:
                row = await s.get(AlertRule, rules["consensus_flip"]["id"])
                row.last_value = other
                await s.commit()
            r = await c.post("/api/v1/alerts/check")
            trig = r.json()["triggered"]
            assert len(trig) == 1 and trig[0]["message"].startswith(f"Committee flipped on RELIANCE.NS: {other} → {current}")

            r = await c.get("/api/v1/alerts/events", params={"unread_only": True})
            assert r.status_code == 200 and r.json()["unread"] >= 4
            assert all(not e["read"] for e in r.json()["events"])
            r = await c.post("/api/v1/alerts/events/read")
            assert r.json()["updated"] >= 4
            r = await c.get("/api/v1/alerts/events")
            assert r.json()["unread"] == 0 and r.json()["events"]

            rid = created["price_below"]["id"]
            assert (await c.delete(f"/api/v1/alerts/{rid}")).json() == {"deleted": True}
            assert (await c.delete(f"/api/v1/alerts/{rid}")).json() == {"deleted": False}

    asyncio.run(go())


class _PriceCache(FakeCache):
    def __init__(self):
        super().__init__()
        self.price = 140.0

    async def get_quote(self, symbol, *_a, **_k):
        q = await super().get_quote(symbol)
        return Quote(symbol=symbol, price=self.price, change_pct=q.change_pct, ts=q.ts)


def test_threshold_fires_only_on_crossing():
    async def go():
        engine, maker = await make_memory_db()
        cache = _PriceCache()
        async with maker() as s:
            s.add(AlertRule(fund_id="f", ticker="AAPL", kind="price_above", threshold=150.0))
            await s.commit()
        fired = []
        for price in (140, 160, 170, 140, 155.5):
            cache.price = price
            async with maker() as s:
                out = await alerts_mod.check_alerts(s, "f", cache, notify=False)
            fired.append([e["message"] for e in out["triggered"]])
        assert fired == [[], ["AAPL crossed above $150 (now $160.00)"], [], [], ["AAPL crossed above $150 (now $155.50)"]]
        await engine.dispose()

    asyncio.run(go())


def test_scheduler_runs_alert_check_even_if_run_fails(monkeypatch):
    calls = []

    async def boom(*_a, **_k):
        raise RuntimeError("run failed")

    async def fake_check(session, fund_id, cache, **_k):
        calls.append(fund_id)
        return {"checked": 0, "triggered": []}

    monkeypatch.setattr(scheduler, "run_fund", boom)
    monkeypatch.setattr(alerts_mod, "check_alerts", fake_check)
    asyncio.run(scheduler._run_default_fund())
    assert calls == ["local"]
