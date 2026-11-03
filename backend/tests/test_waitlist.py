"""Pricing waitlist: validation, positions, idempotent re-submit, stats."""
from __future__ import annotations

import asyncio
import uuid

import httpx
from httpx import ASGITransport

from app.main import app


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def test_waitlist_flow():
    tag = uuid.uuid4().hex[:8]

    async def go():
        async with _client() as c:
            assert (await c.post("/api/v1/waitlist", json={"email": "not-an-email", "plan": "pro"})).status_code == 422
            assert (await c.post("/api/v1/waitlist", json={"email": f"a{tag}@x.io", "plan": "gold"})).status_code == 422

            before = (await c.get("/api/v1/waitlist/stats")).json()

            r = await c.post("/api/v1/waitlist", json={"email": f"A{tag}@Example.com ", "plan": "free", "name": "Ann"})
            assert r.status_code == 200, r.text
            first = r.json()
            assert first["ok"] is True and first["position"] == before["total"] + 1

            r = await c.post("/api/v1/waitlist", json={"email": f"b{tag}@example.com", "plan": "campus", "college": "IIT"})
            assert r.json()["position"] == first["position"] + 1

            r = await c.post("/api/v1/waitlist", json={"email": f"a{tag}@example.com", "plan": "pro"})
            assert r.json() == {"ok": True, "position": first["position"]}

            after = (await c.get("/api/v1/waitlist/stats")).json()
            assert after["total"] == before["total"] + 2
            assert after["by_plan"].get("pro", 0) == before["by_plan"].get("pro", 0) + 1
            assert after["by_plan"].get("free", 0) == before["by_plan"].get("free", 0)
            assert after["by_plan"].get("campus", 0) == before["by_plan"].get("campus", 0) + 1

    asyncio.run(go())
