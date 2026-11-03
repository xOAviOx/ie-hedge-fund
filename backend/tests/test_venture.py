"""Venture discovery log CRUD + traction metrics."""
from __future__ import annotations

import asyncio

import httpx
from httpx import ASGITransport

from app.main import app


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


_BASE = {
    "kind": "customer", "name": "Priya", "segment": "Student investor", "date": "2025-03-01",
    "channel": "In person", "pains": "Too many tips", "gains": "Clear reasoning", "quotes": "\"Show me why\"",
    "willingness_to_pay": "Rs 199/month", "notes": "",
}


def test_interviews_crud_and_metrics():
    async def go():
        async with _client() as c:
            m0 = (await c.get("/api/v1/venture/metrics")).json()

            assert (await c.post("/api/v1/venture/interviews", json={**_BASE, "date": "March 1"})).status_code == 422
            assert (await c.post("/api/v1/venture/interviews", json={**_BASE, "kind": "other"})).status_code == 422

            r = await c.post("/api/v1/venture/interviews", json=_BASE)
            assert r.status_code == 200, r.text
            iv = r.json()
            assert iv["id"] and iv["created_at"] and iv["name"] == "Priya"
            r = await c.post("/api/v1/venture/interviews", json={**_BASE, "kind": "exemplar", "name": "Zerodha PM"})
            ex = r.json()

            r = await c.get("/api/v1/venture/interviews", params={"kind": "exemplar"})
            assert all(i["kind"] == "exemplar" for i in r.json()["interviews"])
            assert any(i["id"] == ex["id"] for i in r.json()["interviews"])

            r = await c.put(f"/api/v1/venture/interviews/{iv['id']}", json={**_BASE, "notes": "follow up"})
            assert r.status_code == 200 and r.json()["notes"] == "follow up" and r.json()["id"] == iv["id"]
            assert (await c.put("/api/v1/venture/interviews/999999", json=_BASE)).status_code == 404

            m1 = (await c.get("/api/v1/venture/metrics")).json()
            assert m1["interviews_customer"] == m0["interviews_customer"] + 1
            assert m1["interviews_exemplar"] == m0["interviews_exemplar"] + 1
            assert m1["personas"] >= 1 and m1["agents"] == 6 + m1["personas"]
            for key in ("runs", "orders", "nav", "nav_return_pct", "waitlist_total", "universe_size"):
                assert key in m1

            assert (await c.delete(f"/api/v1/venture/interviews/{ex['id']}")).json() == {"deleted": True}
            assert (await c.delete(f"/api/v1/venture/interviews/{ex['id']}")).json() == {"deleted": False}
            await c.delete(f"/api/v1/venture/interviews/{iv['id']}")

    asyncio.run(go())
