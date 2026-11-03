"""Pricing waitlist router — capture interest per plan."""
from __future__ import annotations

import re
from typing import Literal, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.data.models_engagement import WaitlistEntry

router = APIRouter(tags=["waitlist"])

_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


class WaitlistIn(BaseModel):
    email: str = Field(max_length=254)
    plan: Literal["free", "pro", "campus", "b2b"]
    name: Optional[str] = Field(default=None, max_length=128)
    college: Optional[str] = Field(default=None, max_length=128)

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL.match(v):
            raise ValueError("invalid email address")
        return v


@router.post("/waitlist")
async def join(body: WaitlistIn, session: AsyncSession = Depends(get_db)) -> dict:
    entry = (await session.execute(
        select(WaitlistEntry).where(WaitlistEntry.email == body.email)
    )).scalar_one_or_none()
    if entry is None:
        entry = WaitlistEntry(email=body.email, plan=body.plan, name=body.name, college=body.college)
        session.add(entry)
    else:
        entry.plan = body.plan
        if body.name is not None:
            entry.name = body.name
        if body.college is not None:
            entry.college = body.college
    await session.commit()
    position = (await session.execute(
        select(func.count()).select_from(WaitlistEntry).where(or_(
            WaitlistEntry.created_at < entry.created_at,
            and_(WaitlistEntry.created_at == entry.created_at, WaitlistEntry.id <= entry.id),
        ))
    )).scalar_one()
    return {"ok": True, "position": position}


@router.get("/waitlist/stats")
async def stats(session: AsyncSession = Depends(get_db)) -> dict:
    rows = (await session.execute(
        select(WaitlistEntry.plan, func.count()).group_by(WaitlistEntry.plan)
    )).all()
    by_plan = {plan: count for plan, count in rows}
    return {"total": sum(by_plan.values()), "by_plan": by_plan}
