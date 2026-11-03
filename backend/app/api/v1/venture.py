"""Venture router — customer-discovery interview log and traction metrics."""
from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.data.models import NavSnapshot, OrderRow, Run
from app.data.models_engagement import Interview, WaitlistEntry
from app.fund import ledger

router = APIRouter(tags=["venture"])

_ANALYSTS = 6


class InterviewIn(BaseModel):
    kind: Literal["customer", "exemplar"]
    name: str = Field(min_length=1, max_length=128)
    segment: str = ""
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    channel: str = ""
    pains: str = ""
    gains: str = ""
    quotes: str = ""
    willingness_to_pay: str = ""
    notes: str = ""


def _interview(i: Interview) -> dict:
    return {
        "id": i.id, "kind": i.kind, "name": i.name, "segment": i.segment, "date": i.date,
        "channel": i.channel, "pains": i.pains, "gains": i.gains, "quotes": i.quotes,
        "willingness_to_pay": i.willingness_to_pay, "notes": i.notes,
        "created_at": i.created_at.isoformat(),
    }


async def _owned(session: AsyncSession, interview_id: int, user: str) -> Optional[Interview]:
    row = await session.get(Interview, interview_id)
    return row if row is not None and row.fund_id == user else None


@router.get("/venture/interviews")
async def list_interviews(
    kind: Optional[Literal["customer", "exemplar"]] = Query(None),
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    q = select(Interview).where(Interview.fund_id == user)
    if kind:
        q = q.where(Interview.kind == kind)
    rows = (await session.execute(q.order_by(desc(Interview.date), desc(Interview.id)))).scalars().all()
    return {"interviews": [_interview(i) for i in rows]}


@router.post("/venture/interviews")
async def create_interview(
    body: InterviewIn, user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> dict:
    row = Interview(fund_id=user, **body.model_dump())
    session.add(row)
    await session.commit()
    return _interview(row)


@router.put("/venture/interviews/{interview_id}")
async def update_interview(
    interview_id: int, body: InterviewIn,
    user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db),
) -> dict:
    row = await _owned(session, interview_id, user)
    if row is None:
        raise HTTPException(status_code=404, detail="interview not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    await session.commit()
    return _interview(row)


@router.delete("/venture/interviews/{interview_id}")
async def delete_interview(
    interview_id: int, user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)
) -> dict:
    row = await _owned(session, interview_id, user)
    if row is None:
        return {"deleted": False}
    await session.delete(row)
    await session.commit()
    return {"deleted": True}


async def _count(session: AsyncSession, stmt) -> int:
    return int((await session.execute(stmt)).scalar_one() or 0)


@router.get("/venture/metrics")
async def metrics(user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)) -> dict:
    from app.engine.personas import get_persona_engine

    fund = await ledger.get_or_create_fund(session, user)
    await session.commit()
    latest = (await session.execute(
        select(NavSnapshot).where(NavSnapshot.fund_id == user).order_by(desc(NavSnapshot.ts)).limit(1)
    )).scalar_one_or_none()
    nav = round(latest.nav, 2) if latest else None
    ret = round((latest.nav / fund.starting_cash - 1) * 100, 2) if latest and fund.starting_cash else None
    personas = len(get_persona_engine().configs)

    def by_kind(kind: str):
        return select(func.count()).select_from(Interview).where(Interview.fund_id == user, Interview.kind == kind)

    return {
        "runs": await _count(session, select(func.count()).select_from(Run).where(Run.fund_id == user)),
        "orders": await _count(session, select(func.count()).select_from(OrderRow).where(OrderRow.fund_id == user)),
        "nav": nav,
        "nav_return_pct": ret,
        "waitlist_total": await _count(session, select(func.count()).select_from(WaitlistEntry)),
        "interviews_customer": await _count(session, by_kind("customer")),
        "interviews_exemplar": await _count(session, by_kind("exemplar")),
        "agents": _ANALYSTS + personas,
        "personas": personas,
        "universe_size": len(fund.universe or []),
    }
