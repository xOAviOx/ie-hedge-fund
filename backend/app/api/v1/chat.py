"""Ask the Fund chat router — grounded Q&A over the fund's decisions."""
from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_cache, get_current_user, get_db
from app.data.cache import MarketCache
from app.engagement import chat as engine

router = APIRouter(tags=["chat"])


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list)


@router.post("/chat")
async def chat(
    body: ChatIn,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    cache: MarketCache = Depends(get_cache),
) -> dict:
    ctx = await engine.build_context(session, user)
    return await engine.answer(body.message.strip(), [t.model_dump() for t in body.history], ctx, cache)


@router.get("/chat/suggestions")
async def suggestions(user: str = Depends(get_current_user), session: AsyncSession = Depends(get_db)) -> dict:
    ctx = await engine.build_context(session, user)
    return {"suggestions": engine.suggestions_for(ctx)}
