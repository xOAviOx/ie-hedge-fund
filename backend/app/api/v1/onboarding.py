"""Onboarding router — risk-profile quiz and the mandate it maps to."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.data.models import InvestorProfileRow
from app.data.symbols import resolve_symbol
from app.fund import ledger
from app.product import onboarding

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class ProfileIn(BaseModel):
    answers: dict[str, int]
    apply: bool = False


def _profile_dict(row: InvestorProfileRow) -> dict:
    return {
        "risk_score": row.risk_score,
        "profile": row.profile,
        "summary": row.summary,
        "mandate": row.mandate,
        "answers": row.answers,
        "applied": row.applied,
        "created_at": row.created_at.isoformat(),
    }


@router.get("/questions")
async def questions() -> dict:
    return {"questions": onboarding.QUESTIONS}


@router.post("/profile")
async def submit_profile(
    body: ProfileIn,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    try:
        p = onboarding.build_profile(body.answers)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    if body.apply:
        fund = await ledger.get_or_create_fund(session, user)
        m = p["mandate"]
        fund.active_personas = list(m["active_personas"])
        fund.position_cap_pct = float(m["position_cap_pct"])
        fund.universe = [resolve_symbol(s) for s in m["universe"]]

    row = await session.get(InvestorProfileRow, user)
    if row is None:
        row = InvestorProfileRow(fund_id=user)
        session.add(row)
    row.risk_score = p["risk_score"]
    row.profile = p["profile"]
    row.summary = p["summary"]
    row.mandate = p["mandate"]
    row.answers = p["answers"]
    row.applied = body.apply
    row.created_at = datetime.now(timezone.utc)
    await session.commit()
    return _profile_dict(row)


@router.get("/profile")
async def get_profile(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Optional[dict]:
    row = await session.get(InvestorProfileRow, user)
    return _profile_dict(row) if row else None
