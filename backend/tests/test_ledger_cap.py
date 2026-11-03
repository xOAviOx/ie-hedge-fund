"""Position cap: a buy may not take a position above position_cap_pct of NAV."""
from __future__ import annotations

import asyncio

from app.fund import ledger
from tests._fakes import FakeCache, make_memory_db


def test_cap_limits_new_position():
    async def go():
        engine, sm = await make_memory_db()
        async with sm() as s:
            fund = await ledger.get_or_create_fund(s, "t", defaults={"starting_cash": 100_000})
            ex = await ledger.apply_orders(
                s, fund, [{"ticker": "TCS.NS", "action": "buy", "quantity": 20}], {"TCS.NS": 2000.0},
                position_cap_pct=10, nav_base=100_000,
            )
            assert ex[0]["executed_qty"] == 5  # 10% of 100k = 10k -> 5 @ 2000
            # Existing holding counts toward the cap: already at 10k, no room left.
            ex = await ledger.apply_orders(
                s, fund, [{"ticker": "TCS.NS", "action": "buy", "quantity": 20}], {"TCS.NS": 2000.0},
                position_cap_pct=10, nav_base=100_000,
            )
            assert ex[0]["executed_qty"] == 0
            assert abs(fund.cash - 90_000) < 1e-6
        await engine.dispose()

    asyncio.run(go())


def test_cap_converts_usd_to_base():
    async def go():
        engine, sm = await make_memory_db()
        async with sm() as s:
            fund = await ledger.get_or_create_fund(s, "t", defaults={"starting_cash": 1_000_000})
            ex = await ledger.apply_orders(
                s, fund, [{"ticker": "AAPL", "action": "buy", "quantity": 100}], {"AAPL": 200.0},
                fx_usdinr=83.0, position_cap_pct=5, nav_base=1_000_000,
            )
            assert ex[0]["executed_qty"] == 3  # 50k INR / (200 * 83) = 3.01
        await engine.dispose()

    asyncio.run(go())


def test_no_cap_by_default():
    async def go():
        engine, sm = await make_memory_db()
        async with sm() as s:
            fund = await ledger.get_or_create_fund(s, "t", defaults={"starting_cash": 100_000})
            ex = await ledger.apply_orders(
                s, fund, [{"ticker": "TCS.NS", "action": "buy", "quantity": 20}], {"TCS.NS": 2000.0},
            )
            assert ex[0]["executed_qty"] == 20
        await engine.dispose()

    asyncio.run(go())


def test_fund_run_respects_cap():
    async def go():
        from app.fund.service import run_fund

        engine, sm = await make_memory_db()
        async with sm() as s:
            await ledger.get_or_create_fund(s, "local", defaults={
                "universe": ["MOAT", "VALUE"], "starting_cash": 1_000_000, "position_cap_pct": 2,
            })
            await s.commit()
        summary = await run_fund("local", cache=FakeCache(), session_maker=sm, notify=False, write_memo=False)
        assert summary["status"] == "ok"
        price = 159.0  # FakeCache last close
        for o in summary["orders"]:
            assert o["executed_qty"] * price <= 0.02 * 1_000_000 + 1e-6
        async with sm() as s:
            for p in await ledger.get_positions(s, "local"):
                assert p.shares * price <= 20_000 + 1e-6
        await engine.dispose()

    asyncio.run(go())
