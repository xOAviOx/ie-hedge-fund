"""ORM tables for engagement features: watchlist, alerts, waitlist, venture log.

Kept separate from ``models.py`` so these tables can evolve independently of the
fund ledger and decision store. Imported at the bottom of ``models.py`` so every
table registers on ``Base.metadata`` wherever models are loaded.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.data.db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    __table_args__ = (UniqueConstraint("fund_id", "ticker", name="uq_watchlist_fund_ticker"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fund_id: Mapped[str] = mapped_column(String(64), index=True)
    ticker: Mapped[str] = mapped_column(String(32))
    added_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class AlertRule(Base):
    """A user alert. ``last_value`` holds the last observed value (edge-trigger state)."""

    __tablename__ = "alert_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fund_id: Mapped[str] = mapped_column(String(64), index=True)
    ticker: Mapped[str] = mapped_column(String(32), index=True)
    kind: Mapped[str] = mapped_column(String(24))
    threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    last_triggered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_value: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class AlertEvent(Base):
    """A fired alert. ``rule_id`` is not a foreign key so events outlive deleted rules."""

    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fund_id: Mapped[str] = mapped_column(String(64), index=True)
    rule_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    ticker: Mapped[str] = mapped_column(String(32))
    kind: Mapped[str] = mapped_column(String(24))
    message: Mapped[str] = mapped_column(Text)
    ts: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False)


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(16))
    name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    college: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Interview(Base):
    """One customer-discovery or exemplar interview (venture log)."""

    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fund_id: Mapped[str] = mapped_column(String(64), index=True)
    kind: Mapped[str] = mapped_column(String(16), index=True)
    name: Mapped[str] = mapped_column(String(128))
    segment: Mapped[str] = mapped_column(String(128), default="")
    date: Mapped[str] = mapped_column(String(10))
    channel: Mapped[str] = mapped_column(String(64), default="")
    pains: Mapped[str] = mapped_column(Text, default="")
    gains: Mapped[str] = mapped_column(Text, default="")
    quotes: Mapped[str] = mapped_column(Text, default="")
    willingness_to_pay: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
