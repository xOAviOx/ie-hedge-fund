"""Risk-profile quiz: questions, scoring, and the mandate a profile maps to.

Five scored questions (0-20 points each) sum to a 0-100 risk score. ``markets``
and ``style`` carry no points; they pick the universe and bias the persona mix.
"""
from __future__ import annotations

from app.engine.personas import get_persona_engine
from app.fund.ledger import DEFAULT_UNIVERSE

ALL_PERSONAS = [
    "buffett", "munger", "graham", "pabrai", "lynch", "fisher",
    "wood", "damodaran", "druckenmiller", "burry", "jhunjhunwala", "ackman",
]

QUESTIONS: list[dict] = [
    {
        "id": "horizon",
        "text": "How long do you plan to stay invested?",
        "help": "Longer horizons give a portfolio time to recover from bad years.",
        "options": [
            {"label": "Less than 1 year", "points": 0},
            {"label": "1 to 3 years", "points": 7},
            {"label": "3 to 7 years", "points": 14},
            {"label": "More than 7 years", "points": 20},
        ],
    },
    {
        "id": "goal",
        "text": "What matters most to you?",
        "help": "Your main goal sets how much volatility is worth accepting.",
        "options": [
            {"label": "Protecting what I have", "points": 0},
            {"label": "Steady income with modest growth", "points": 6},
            {"label": "Balanced long-term growth", "points": 13},
            {"label": "Maximum growth, even with big swings", "points": 20},
        ],
    },
    {
        "id": "drawdown",
        "text": "Your portfolio falls 20% in a month. What do you do?",
        "help": "A 20% fall happens to most equity portfolios at some point.",
        "options": [
            {"label": "Sell everything to stop the loss", "points": 0},
            {"label": "Sell some to reduce risk", "points": 6},
            {"label": "Hold and wait", "points": 13},
            {"label": "Buy more at lower prices", "points": 20},
        ],
    },
    {
        "id": "experience",
        "text": "How much investing experience do you have?",
        "help": "Experience with market cycles makes volatility easier to sit through.",
        "options": [
            {"label": "None yet", "points": 0},
            {"label": "Fixed deposits and mutual funds", "points": 7},
            {"label": "I pick my own stocks", "points": 14},
            {"label": "Years of active investing, including bad markets", "points": 20},
        ],
    },
    {
        "id": "income",
        "text": "How stable is your income?",
        "help": "Stable income means you will not be forced to sell in a downturn.",
        "options": [
            {"label": "Irregular, and I may need this money", "points": 0},
            {"label": "Somewhat stable", "points": 7},
            {"label": "Stable salary", "points": 14},
            {"label": "Very stable, with a separate emergency fund", "points": 20},
        ],
    },
    {
        "id": "markets",
        "text": "Which markets do you want to invest in?",
        "help": "Sets the stock universe the fund analyses and trades.",
        "options": [
            {"label": "India (NSE)", "points": 0},
            {"label": "United States", "points": 0},
            {"label": "Both India and the US", "points": 0},
        ],
    },
    {
        "id": "style",
        "text": "Which investing style appeals to you?",
        "help": "Tilts which legendary investors sit on your committee.",
        "options": [
            {"label": "Value: buy good businesses cheaply", "points": 0},
            {"label": "Growth: back fast-growing companies", "points": 0},
            {"label": "Momentum: ride strong trends", "points": 0},
            {"label": "Let the full committee decide", "points": 0},
        ],
    },
]

SCORED = ["horizon", "goal", "drawdown", "experience", "income"]
MARKETS = ["india", "us", "both"]
STYLES = ["value", "growth", "momentum", "committee"]

PROFILE_MANDATES: dict[str, tuple[list[str], float]] = {
    "Conservative": (["graham", "buffett", "munger", "pabrai"], 10.0),
    "Balanced": (["buffett", "munger", "lynch", "fisher", "damodaran", "jhunjhunwala"], 15.0),
    "Growth": (["lynch", "fisher", "wood", "jhunjhunwala", "druckenmiller", "ackman"], 20.0),
    "Aggressive": (["wood", "druckenmiller", "ackman", "burry", "jhunjhunwala"], 30.0),
}
STYLE_TILT = {
    "value": ["graham", "buffett"],
    "growth": ["lynch", "fisher", "wood"],
    "momentum": ["druckenmiller"],
}
PROFILE_BLURB = {
    "Conservative": "You put capital preservation first, so the fund leans on margin-of-safety value investors and keeps positions small.",
    "Balanced": "You want long-term growth without wild swings, so the fund blends quality value with reasonably priced growth.",
    "Growth": "You can sit through sharp drawdowns for higher long-run returns, so the fund tilts toward growth and trend investors.",
    "Aggressive": "You accept large swings in pursuit of outsized returns, so the fund backs high-conviction growth, macro and contrarian bets.",
}


def profile_for(risk_score: float) -> str:
    if risk_score < 30:
        return "Conservative"
    if risk_score < 55:
        return "Balanced"
    if risk_score < 75:
        return "Growth"
    return "Aggressive"


def universe_for(markets: str) -> list[str]:
    if markets == "india":
        return [t for t in DEFAULT_UNIVERSE if t.endswith(".NS")]
    if markets == "us":
        return [t for t in DEFAULT_UNIVERSE if not t.endswith(".NS")]
    return list(DEFAULT_UNIVERSE)


def _option_index(answers: dict[str, int], qid: str, required: bool) -> int | None:
    q = next(q for q in QUESTIONS if q["id"] == qid)
    if qid not in answers:
        if required:
            raise ValueError(f"missing answer for '{qid}'")
        return None
    idx = answers[qid]
    if not isinstance(idx, int) or not 0 <= idx < len(q["options"]):
        raise ValueError(f"answer for '{qid}' must be an option index 0-{len(q['options']) - 1}")
    return idx


def build_profile(answers: dict[str, int]) -> dict:
    """Score ``answers`` (question id -> option index). Raises ``ValueError`` if invalid."""
    risk_score = 0
    for qid in SCORED:
        idx = _option_index(answers, qid, required=True)
        q = next(q for q in QUESTIONS if q["id"] == qid)
        risk_score += q["options"][idx]["points"]

    m_idx = _option_index(answers, "markets", required=False)
    s_idx = _option_index(answers, "style", required=False)
    markets = MARKETS[m_idx] if m_idx is not None else "both"
    style = STYLES[s_idx] if s_idx is not None else "committee"

    profile = profile_for(risk_score)
    base, cap = PROFILE_MANDATES[profile]
    if style == "committee":
        personas = list(ALL_PERSONAS)
    else:
        personas = list(dict.fromkeys(base + STYLE_TILT[style]))

    names = {k: c.display_name for k, c in get_persona_engine().configs.items()}
    lead = ", ".join(names.get(k, k) for k in personas[:3])
    market_label = {"india": "Indian", "us": "US", "both": "Indian and US"}[markets]
    summary = (
        f"{PROFILE_BLURB[profile]} Your committee of {len(personas)} investors, led by {lead}, "
        f"will trade {market_label} stocks with at most {cap:.0f}% in any one position."
    )
    return {
        "risk_score": float(risk_score),
        "profile": profile,
        "summary": summary,
        "mandate": {
            "active_personas": personas,
            "position_cap_pct": cap,
            "universe": universe_for(markets),
            "markets": markets,
            "style": style,
        },
        "answers": {k: v for k, v in answers.items() if any(q["id"] == k for q in QUESTIONS)},
    }
