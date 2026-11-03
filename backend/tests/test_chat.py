"""Ask the Fund: rules engine (no LLM key), empty state, and the LLM path (faked)."""
from __future__ import annotations

import asyncio

import httpx
import pytest
from httpx import ASGITransport

from app.api.deps import get_cache
from app.engagement import chat as chat_engine
from app.engine import synthesis
from app.main import app
from tests._fakes import FakeCache, make_memory_db

app.dependency_overrides[get_cache] = lambda: FakeCache()


async def _no_llm(*_a, **_k):
    return None


@pytest.fixture(autouse=True)
def _rules_mode(monkeypatch):
    monkeypatch.setattr(synthesis, "complete", _no_llm)
    monkeypatch.setattr(synthesis, "write_memo", _no_llm)


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def test_empty_state_and_about():
    async def go():
        engine, maker = await make_memory_db()
        async with maker() as session:
            ctx = await chat_engine.build_context(session, "empty")
        assert ctx["run"] is None
        out = await chat_engine.rules_answer("Why did we buy reliance?", ctx, FakeCache())
        assert out["mode"] == "rules" and "Run now" in out["answer"]
        assert len(out["suggestions"]) == 3
        out = await chat_engine.rules_answer("What is PortAI?", ctx, FakeCache())
        assert "paper" in out["answer"] and len(out["suggestions"]) == 3
        out = await chat_engine.rules_answer("what do we hold", ctx, FakeCache())
        assert "no positions" in out["answer"]
        await engine.dispose()

    asyncio.run(go())


def test_ticker_matching():
    ctx = {"fund": {"universe": ["RELIANCE.NS", "AAPL"]}, "positions": [], "consensus": {}, "orders": []}
    assert chat_engine.find_ticker("why did we buy reliance?", ctx) == "RELIANCE.NS"
    assert chat_engine.find_ticker("RELIANCE.NS outlook", ctx) == "RELIANCE.NS"
    assert chat_engine.find_ticker("Who likes aapl", ctx) == "AAPL"
    assert chat_engine.find_ticker("how are we doing", ctx) is None


def test_chat_rules_after_run():
    async def go():
        async with _client() as c:
            r = await c.put("/api/v1/fund/config", json={"universe": ["MOAT", "VALUE"], "active_personas": ["all"]})
            assert r.status_code == 200
            r = await c.post("/api/v1/fund/run")
            assert r.status_code == 200 and r.json()["status"] == "ok", r.text
            run_id = r.json()["run_id"]

            async def ask(q: str) -> dict:
                resp = await c.post("/api/v1/chat", json={"message": q, "history": []})
                assert resp.status_code == 200, resp.text
                body = resp.json()
                assert body["mode"] == "rules" and body["answer"]
                assert len(body["suggestions"]) == 3
                for s in body["sources"]:
                    assert set(s) == {"kind", "ref", "label", "href"}
                return body

            body = await ask("Why did we buy moat?")
            assert "MOAT.NS" in body["answer"]
            assert any(s["href"] == f"/decisions/{run_id}" for s in body["sources"])

            body = await ask("Who is bullish on MOAT?")
            assert any(s["href"] == "/research/MOAT.NS" for s in body["sources"])

            body = await ask("What is the score of value?")
            assert "Stratton Score" in body["answer"]
            assert any(s["kind"] == "score" for s in body["sources"])

            assert (await ask("What are our holdings?"))["answer"]
            assert "NAV" in (await ask("How is the fund performing?"))["answer"]
            assert "Latest run" in (await ask("Show me the latest memo"))["answer"]
            assert "Stratton Fund" in (await ask("hello there"))["answer"]

            r = await c.get("/api/v1/chat/suggestions")
            assert r.status_code == 200 and len(r.json()["suggestions"]) == 3

            r = await c.post("/api/v1/chat", json={"message": ""})
            assert r.status_code == 422

    asyncio.run(go())


def test_chat_llm_path(monkeypatch):
    seen: dict = {}

    async def fake_complete(prompt, **_k):
        seen["prompt"] = prompt
        return "Per the context, the fund holds cash."

    monkeypatch.setattr(synthesis, "complete", fake_complete)

    async def go():
        async with _client() as c:
            r = await c.post("/api/v1/chat", json={
                "message": "How are we doing?",
                "history": [{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hello"}],
            })
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["mode"] == "llm" and body["answer"].startswith("Per the context")
            assert len(body["suggestions"]) == 3 and body["sources"]

    asyncio.run(go())
    assert "investor-relations analyst" in seen["prompt"] and "QUESTION: How are we doing?" in seen["prompt"]
