"""Ask the Fund — grounded Q&A over the fund's own state and decisions.

``build_context`` gathers fund state, positions, recent orders and the latest
run's per-ticker consensus. With an LLM key, one call answers from that context
only; otherwise (or if the call fails) a small rules engine answers common
intents directly from the same context.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.models import NavSnapshot, OrderRow, Run, SignalRow
from app.data.symbols import resolve_symbol
from app.engine import synthesis
from app.engine.score import agent_name, score_ticker
from app.fund import ledger

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are the Stratton Fund's investor-relations analyst. Answer ONLY from the "
    "context below. Cite tickers and run dates when you use them. If the context "
    "does not contain the answer, say so plainly. Explain trades with the order "
    "reasoning and agent votes given; never invent thresholds, limits, rules or "
    "numbers that are not in the context. Never give personalised financial "
    "advice; this is a paper fund run by AI agents. Plain text only, short "
    "paragraphs or '- ' bullets, under 180 words."
)

_EMPTY = ("The fund has not completed a run yet, so there are no decisions to explain. "
          "Hit Run now on the Fund Console to run the committee, then ask me again.")


# ── Context ──────────────────────────────────────────────────────────


def _fmt_date(iso: Optional[str]) -> str:
    return iso[:10] if iso else "unknown date"


def _inr(v: Optional[float]) -> str:
    return "n/a" if v is None else f"₹{v:,.2f}"


def _px(ticker: str, v: float) -> str:
    sym = "₹" if ticker.endswith((".NS", ".BO")) else "$"
    return f"{sym}{v:,.2f}"


async def build_context(session: AsyncSession, fund_id: str) -> dict:
    fund = await ledger.get_or_create_fund(session, fund_id)
    await session.commit()

    snaps = (await session.execute(
        select(NavSnapshot).where(NavSnapshot.fund_id == fund_id).order_by(desc(NavSnapshot.ts)).limit(2)
    )).scalars().all()
    latest_nav = snaps[0].nav if snaps else round(fund.cash, 2)
    start = fund.starting_cash or 0.0

    positions = [
        {"ticker": p.ticker, "shares": p.shares, "avg_cost": round(p.avg_cost, 2), "currency": p.currency}
        for p in await ledger.get_positions(session, fund_id) if p.shares > 0
    ]

    orders = [
        {"id": o.id, "run_id": o.run_id, "ticker": o.ticker, "action": o.action,
         "quantity": o.quantity, "price": o.price, "reasoning": o.reasoning, "ts": o.ts.isoformat()}
        for o in (await session.execute(
            select(OrderRow).where(OrderRow.fund_id == fund_id).order_by(desc(OrderRow.ts), desc(OrderRow.id)).limit(20)
        )).scalars().all()
    ]

    run = (await session.execute(
        select(Run).where(Run.fund_id == fund_id).order_by(desc(Run.ts)).limit(1)
    )).scalar_one_or_none()
    run_d: Optional[dict] = None
    signals: dict[str, list[dict]] = {}
    consensus: dict[str, dict] = {}
    if run is not None:
        run_d = {"id": run.id, "ts": run.ts.isoformat(), "memo": run.memo, "universe": list(run.universe or [])}
        for s in (await session.execute(select(SignalRow).where(SignalRow.run_id == run.id))).scalars().all():
            signals.setdefault(s.agent, []).append(
                {"ticker": s.ticker, "signal": s.direction, "confidence": s.confidence, "reasoning": s.factors}
            )
        tickers = sorted({s["ticker"] for sigs in signals.values() for s in sigs})
        consensus = {t: score_ticker(t, signals, as_of=run_d["ts"]) for t in tickers}

    return {
        "fund": {
            "id": fund_id, "cash": round(fund.cash, 2), "latest_nav": latest_nav,
            "prev_nav": snaps[1].nav if len(snaps) > 1 else None,
            "starting_cash": start, "universe": list(fund.universe or []),
            "is_paused": bool(fund.is_paused),
            "positions_value": snaps[0].positions_value if snaps else 0.0,
            "return_pct": round((latest_nav / start - 1) * 100, 2) if start else None,
        },
        "positions": positions,
        "orders": orders,
        "run": run_d,
        "signals": signals,
        "consensus": consensus,
    }


def context_text(ctx: dict) -> str:
    f = ctx["fund"]
    lines = [
        f"FUND: cash {_inr(f['cash'])}, NAV {_inr(f['latest_nav'])}, starting cash {_inr(f['starting_cash'])}, "
        f"return {f['return_pct']}%, paused={f['is_paused']}, universe={', '.join(f['universe'])}",
        "POSITIONS: " + ("; ".join(f"{p['ticker']} {p['shares']:g} sh @ {p['avg_cost']}" for p in ctx["positions"]) or "none"),
    ]
    run = ctx["run"]
    if run:
        lines.append(f"LATEST RUN: {run['id']} on {_fmt_date(run['ts'])}")
        lines.append(f"MEMO: {run['memo'] or '(no memo written)'}")
        lines.append("CONSENSUS (latest run):")
        for t, s in sorted(ctx["consensus"].items(), key=lambda kv: -kv[1]["score"]):
            bull = "; ".join(f"{r['agent_name']} {r['confidence']:.0f}%: {r['reasoning'][:90]}" for r in s["top_bullish"][:2])
            bear = "; ".join(f"{r['agent_name']} {r['confidence']:.0f}%: {r['reasoning'][:90]}" for r in s["top_bearish"][:2])
            lines.append(f"- {t}: {s['label']} {s['score']}/10 (bull {s['bull_count']}, bear {s['bear_count']}, "
                         f"neutral {s['neutral_count']}) | bulls: {bull or 'none'} | bears: {bear or 'none'}")
    else:
        lines.append("LATEST RUN: none yet (the user must press Run now on the Fund Console)")
    if ctx["orders"]:
        lines.append("RECENT ORDERS:")
        for o in ctx["orders"]:
            lines.append(f"- {_fmt_date(o['ts'])} {o['ticker']} {o['action']} {o['quantity']} @ {o['price']:.2f}: "
                         f"{(o['reasoning'] or '')[:160]}")
    return "\n".join(lines)


# ── Helpers ──────────────────────────────────────────────────────────


def known_tickers(ctx: dict) -> list[str]:
    seen: list[str] = []
    for t in (ctx["fund"]["universe"] + [p["ticker"] for p in ctx["positions"]]
              + list(ctx["consensus"]) + [o["ticker"] for o in ctx["orders"]]):
        if t not in seen:
            seen.append(t)
    return seen


def find_ticker(message: str, ctx: dict) -> Optional[str]:
    tokens = set(re.findall(r"[A-Z0-9&\-^=.]+", message.upper()))
    tokens |= {t.rstrip(".?!,") for t in tokens}
    for t in known_tickers(ctx):
        base = t.split(".")[0].upper()
        if t.upper() in tokens or (len(base) >= 2 and base in tokens):
            return t
    return None


def _run_source(run: dict) -> dict:
    return {"kind": "run", "ref": run["id"], "label": f"Run on {_fmt_date(run['ts'])}",
            "href": f"/decisions/{run['id']}"}


def _research(t: str) -> str:
    return f"/research/{t}"


def suggestions_for(ctx: dict, intent: str = "", ticker: Optional[str] = None) -> list[str]:
    t = ticker
    if t is None and ctx["positions"]:
        t = ctx["positions"][0]["ticker"]
    if t is None and ctx["consensus"]:
        t = max(ctx["consensus"].values(), key=lambda s: s["score"])["ticker"]
    t = t or (ctx["fund"]["universe"][0] if ctx["fund"]["universe"] else "RELIANCE.NS")
    short = t.split(".")[0]
    if ctx["run"] is None:
        pool = [("about", "How does PortAI work?"), ("score", f"What is the score of {short}?"),
                ("performance", "How is the fund performing?"), ("holdings", "What do we hold?")]
    else:
        pool = [
            ("why", f"Why did we trade {short}?"),
            ("bull", f"Who is bullish on {short}?"),
            ("score", f"What is the score of {short}?"),
            ("holdings", "What do we hold right now?"),
            ("performance", "How is the fund performing?"),
            ("memo", "What did the latest memo say?"),
            ("bear", f"Who is bearish on {short}?"),
            ("about", "How does PortAI work?"),
        ]
    return [q for k, q in pool if k != intent][:3]


# ── Rules engine ─────────────────────────────────────────────────────


def _why(ctx: dict, ticker: Optional[str], msg: str) -> tuple[str, list[dict]]:
    action = next((a for a in ("buy", "sell", "hold") if re.search(rf"\b{a}", msg)), None)
    if action is None and re.search(r"\bbought\b", msg):
        action = "buy"
    if action is None and re.search(r"\bsold\b", msg):
        action = "sell"
    orders = ctx["orders"]
    order = None
    for o in orders:
        if ticker and o["ticker"] != ticker:
            continue
        if not ticker and action and o["action"] != action:
            continue
        order = o
        break
    sources: list[dict] = []
    if order is None:
        if ticker is None:
            return ("I could not find a matching recent order. Name a ticker, for example "
                    "\"Why did we buy RELIANCE?\"", sources)
        text = f"There is no recent order for {ticker} in the last {len(orders)} orders."
    else:
        t = order["ticker"]
        ticker = t
        verb = {"buy": "bought", "sell": "sold", "hold": "held"}.get(order["action"], order["action"])
        if order["action"] in ("buy", "sell") and not order["quantity"]:
            head = (f"On {_fmt_date(order['ts'])} the committee wanted to {order['action']} {t}, "
                    f"but no shares filled (cash or holdings limit).")
        elif order["action"] == "hold":
            head = f"On {_fmt_date(order['ts'])} we held {t} (no trade)."
        else:
            head = f"On {_fmt_date(order['ts'])} we {verb} {order['quantity']} {t} at {_px(t, order['price'])}."
        text = f"{head}\nReasoning: {order['reasoning'] or 'none recorded'}"
        sources.append({"kind": "order", "ref": str(order["id"]),
                        "label": f"{order['action'].upper()} {order['quantity']} {t}",
                        "href": f"/decisions/{order['run_id']}" if order["run_id"] else None})
    s = ctx["consensus"].get(ticker) if ticker else None
    if s:
        text += (f"\nCommittee consensus: {s['label']} ({s['score']}/10), {s['bull_count']} bullish, "
                 f"{s['bear_count']} bearish, {s['neutral_count']} neutral.")
        if s["top_bullish"]:
            r = s["top_bullish"][0]
            text += f"\n- Most bullish: {r['agent_name']} ({r['confidence']:.0f}%): {r['reasoning'][:160]}"
        if s["top_bearish"]:
            r = s["top_bearish"][0]
            text += f"\n- Most bearish: {r['agent_name']} ({r['confidence']:.0f}%): {r['reasoning'][:160]}"
        sources.append({"kind": "signal", "ref": f"{ctx['run']['id']}:{ticker}",
                        "label": f"{ticker} committee signals", "href": f"/decisions/{ctx['run']['id']}"})
    return text, sources


def _sentiment(ctx: dict, ticker: Optional[str], msg: str) -> tuple[str, list[dict]]:
    want_bull = "bull" in msg
    want_bear = "bear" in msg
    run = ctx["run"]
    if ticker is None:
        ranked = sorted(ctx["consensus"].values(), key=lambda s: -s["score"])
        if want_bear and not want_bull:
            ranked = ranked[::-1]
        word = "bearish" if want_bear and not want_bull else "bullish"
        lines = [f"Where the committee is most {word} (run on {_fmt_date(run['ts'])}):"]
        lines += [f"- {s['ticker']}: {s['label']} {s['score']}/10 ({s['bull_count']} bull / {s['bear_count']} bear)"
                  for s in ranked[:5]]
        return "\n".join(lines), [_run_source(run)]
    directions = [d for d, w in (("bullish", want_bull), ("bearish", want_bear)) if w] or ["bullish", "bearish"]
    lines: list[str] = []
    for d in directions:
        rows = sorted(
            ((a, s) for a, sigs in ctx["signals"].items() for s in sigs
             if s["ticker"] == ticker and str(s["signal"]).lower() == d),
            key=lambda r: -float(r[1]["confidence"] or 0),
        )
        if not rows:
            lines.append(f"No agent was {d} on {ticker} in the latest run.")
            continue
        lines.append(f"{len(rows)} agent(s) {d} on {ticker} (run on {_fmt_date(run['ts'])}):")
        lines += [f"- {agent_name(a)} ({float(s['confidence']):.0f}%): {(s['reasoning'] or '')[:140]}" for a, s in rows[:5]]
    s = ctx["consensus"].get(ticker)
    if s:
        lines.append(f"Overall: {s['label']} ({s['score']}/10).")
    return "\n".join(lines), [
        {"kind": "signal", "ref": f"{run['id']}:{ticker}", "label": f"{ticker} committee signals",
         "href": f"/decisions/{run['id']}"},
        {"kind": "score", "ref": ticker, "label": f"Research {ticker}", "href": _research(ticker)},
    ]


async def _score(ctx: dict, ticker: str, cache: Any) -> tuple[str, list[dict]]:
    from app.engine.score import compute_scores

    s: Optional[dict] = None
    try:
        scores = await compute_scores([ticker], cache=cache)
        s = scores[0] if scores else None
    except Exception as e:  # noqa: BLE001 — fall back to the stored run
        logger.warning("Chat score computation failed for %s: %s", ticker, e)
        s = ctx["consensus"].get(ticker)
    if s is None:
        return f"I could not compute a Stratton Score for {ticker} right now.", []
    t = s["ticker"]
    lines = [f"{t} Stratton Score: {s['score']}/10 ({s['label']}), from {s['agent_count']} agents: "
             f"{s['bull_count']} bullish, {s['bear_count']} bearish, {s['neutral_count']} neutral."]
    if s["top_bullish"]:
        r = s["top_bullish"][0]
        lines.append(f"- Top bull: {r['agent_name']} ({r['confidence']:.0f}%): {r['reasoning'][:140]}")
    if s["top_bearish"]:
        r = s["top_bearish"][0]
        lines.append(f"- Top bear: {r['agent_name']} ({r['confidence']:.0f}%): {r['reasoning'][:140]}")
    return "\n".join(lines), [{"kind": "score", "ref": t, "label": f"Stratton Score {t}", "href": _research(t)}]


def _holdings(ctx: dict) -> tuple[str, list[dict]]:
    f = ctx["fund"]
    if not ctx["positions"]:
        tail = "" if ctx["run"] else " Hit Run now on the Fund Console to start trading."
        return f"The fund holds no positions right now; it is all cash ({_inr(f['cash'])}).{tail}", [
            {"kind": "fund", "ref": f["id"], "label": "Fund state", "href": "/console"}]
    lines = [f"The fund holds {len(ctx['positions'])} position(s) plus {_inr(f['cash'])} cash:"]
    sources = []
    for p in ctx["positions"]:
        s = ctx["consensus"].get(p["ticker"])
        view = f", committee {s['label']} {s['score']}/10" if s else ""
        lines.append(f"- {p['ticker']}: {p['shares']:g} shares at avg {_px(p['ticker'], p['avg_cost'])}{view}")
        sources.append({"kind": "position", "ref": p["ticker"], "label": f"{p['ticker']} position",
                        "href": _research(p["ticker"])})
    return "\n".join(lines), sources


def _performance(ctx: dict) -> tuple[str, list[dict]]:
    f = ctx["fund"]
    ret = f["return_pct"]
    lines = [f"NAV is {_inr(f['latest_nav'])} against {_inr(f['starting_cash'])} starting cash"
             + (f" ({ret:+.2f}% since inception)." if ret is not None else ".")]
    if f["prev_nav"]:
        chg = (f["latest_nav"] / f["prev_nav"] - 1) * 100
        lines.append(f"Since the previous snapshot NAV moved {chg:+.2f}%.")
    lines.append(f"Cash: {_inr(f['cash'])}; invested: {_inr(f['positions_value'])} across {len(ctx['positions'])} position(s).")
    if ctx["run"] is None:
        lines.append("No runs yet. Hit Run now on the Fund Console to put the cash to work.")
    if f["is_paused"]:
        lines.append("The fund is currently paused (kill-switch on).")
    return "\n".join(lines), [{"kind": "fund", "ref": f["id"], "label": "Fund NAV", "href": "/console"}]


def _memo(ctx: dict) -> tuple[str, list[dict]]:
    run = ctx["run"]
    trades = [o for o in ctx["orders"] if o["run_id"] == run["id"] and o["action"] in ("buy", "sell") and o["quantity"]]
    head = f"Latest run on {_fmt_date(run['ts'])}"
    if run["memo"]:
        text = f"{head}. The memo:\n{run['memo']}"
    else:
        text = f"{head} has no written memo (no LLM key was configured for that run)."
    if trades:
        text += "\nTrades: " + ", ".join(f"{o['action']} {o['quantity']} {o['ticker']}" for o in trades) + "."
    return text, [_run_source(run)]


def _about(ctx: dict) -> tuple[str, list[dict]]:
    from app.engine.personas import get_persona_engine

    n = len(get_persona_engine().configs)
    text = (
        "PortAI runs the Stratton Fund, an AI-native paper hedge fund.\n"
        f"- On every run, 6 analyst agents (fundamentals, technical, sentiment, valuation, growth, macro regime) "
        f"and up to {n} investor personas (Buffett, Munger, Jhunjhunwala and others) vote on each ticker in the universe.\n"
        "- The votes become a Stratton Score (1-10); a risk manager sizes positions and a portfolio manager places paper orders.\n"
        "- Every signal and order is saved, so you can audit each decision in the Decision Room.\n"
        "It trades paper money only, and nothing here is personalised financial advice."
    )
    return text, [{"kind": "fund", "ref": ctx["fund"]["id"], "label": "Fund Console", "href": "/console"}]


def _summary(ctx: dict) -> tuple[str, list[dict]]:
    f = ctx["fund"]
    run = ctx["run"]
    ret = f"{f['return_pct']:+.2f}%" if f["return_pct"] is not None else "n/a"
    lines = [f"The Stratton Fund has NAV {_inr(f['latest_nav'])} ({ret} since inception), "
             f"{len(ctx['positions'])} position(s) and {_inr(f['cash'])} cash."]
    if ctx["consensus"]:
        ranked = sorted(ctx["consensus"].values(), key=lambda s: -s["score"])
        top, low = ranked[0], ranked[-1]
        line = (f"In the run on {_fmt_date(run['ts'])} the committee rated {top['ticker']} highest "
                f"({top['score']}/10, {top['label']})")
        if low["score"] < top["score"]:
            line += f" and {low['ticker']} lowest ({low['score']}/10, {low['label']})"
        lines.append(line + ".")
    lines.append("I can explain trades, holdings, performance, agent views, scores and the latest memo.")
    return "\n".join(lines), [_run_source(run)]


_INTENTS: list[tuple[str, str]] = [
    ("about", r"what is portai|what's portai|how does (it|this|portai|the fund) work|what is (the|this) fund|"
              r"who are you|how do you (decide|work)|what are you"),
    ("why", r"\bwhy\b"),
    ("score", r"\bscore\b|\brating\b|\brate\b"),
    ("sentiment", r"bullish|bearish|\bbulls?\b|\bbears?\b"),
    ("memo", r"\bmemo\b|latest run|last run|\btoday\b"),
    ("holdings", r"holdings|positions?|portfolio|what do (we|you) (hold|own)|\bown\b"),
    ("performance", r"perform|\bnav\b|return|p&l|pnl|profit|\bloss|how (are|is) (we|the fund) doing|\bvalue\b"),
]


def detect_intent(msg: str) -> str:
    for name, pat in _INTENTS:
        if re.search(pat, msg):
            return name
    return "summary"


def _score_target(message: str, ctx: dict) -> Optional[str]:
    t = find_ticker(message, ctx)
    if t:
        return t
    m = re.search(r"(?:score|rating|rate)\s+(?:of|for|on)?\s*([A-Za-z0-9&\-.]{2,20})", message, re.I)
    if m and m.group(1).lower() not in {"of", "for", "on", "the", "it", "this"}:
        try:
            return resolve_symbol(m.group(1))
        except ValueError:
            return None
    return None


async def rules_answer(message: str, ctx: dict, cache: Any) -> dict:
    msg = message.lower()
    intent = detect_intent(msg)
    ticker = find_ticker(message, ctx)
    needs_run = intent in ("why", "sentiment", "memo", "summary")

    if intent == "about":
        answer, sources = _about(ctx)
    elif intent == "score":
        ticker = _score_target(message, ctx)
        if ticker is None:
            answer, sources = "Which ticker? For example: \"What is the score of RELIANCE?\"", []
        else:
            answer, sources = await _score(ctx, ticker, cache)
    elif needs_run and ctx["run"] is None:
        answer, sources = _EMPTY, [{"kind": "fund", "ref": ctx["fund"]["id"], "label": "Fund Console", "href": "/console"}]
    elif intent == "why":
        answer, sources = _why(ctx, ticker, msg)
    elif intent == "sentiment":
        answer, sources = _sentiment(ctx, ticker, msg)
    elif intent == "memo":
        answer, sources = _memo(ctx)
    elif intent == "holdings":
        answer, sources = _holdings(ctx)
    elif intent == "performance":
        answer, sources = _performance(ctx)
    else:
        answer, sources = _summary(ctx)

    return {"answer": answer, "mode": "rules", "sources": sources,
            "suggestions": suggestions_for(ctx, "bull" if intent == "sentiment" else intent, ticker)}


# ── LLM path ─────────────────────────────────────────────────────────


def _llm_sources(ctx: dict, ticker: Optional[str]) -> list[dict]:
    sources: list[dict] = []
    if ctx["run"]:
        sources.append(_run_source(ctx["run"]))
    if ticker:
        sources.append({"kind": "score", "ref": ticker, "label": f"Research {ticker}", "href": _research(ticker)})
    else:
        sources.append({"kind": "fund", "ref": ctx["fund"]["id"], "label": "Fund state", "href": "/console"})
    return sources


async def answer(message: str, history: list[dict], ctx: dict, cache: Any) -> dict:
    """Answer ``message``: one grounded LLM call when available, else the rules engine."""
    turns = "\n".join(f"{h['role'].upper()}: {h['content'][:600]}" for h in history[-6:])
    prompt = (f"{_SYSTEM}\n\nCONTEXT\n{context_text(ctx)}\n\n"
              + (f"CONVERSATION SO FAR\n{turns}\n\n" if turns else "")
              + f"QUESTION: {message}\nANSWER:")
    reply = await synthesis.complete(prompt, max_tokens=450, temperature=0.2)
    if reply:
        ticker = find_ticker(message, ctx)
        return {"answer": reply, "mode": "llm", "sources": _llm_sources(ctx, ticker),
                "suggestions": suggestions_for(ctx, "", ticker)}
    return await rules_answer(message, ctx, cache)
