from app.engine.models import SignalType
from app.engine.score import net_to_score, score_label, score_ticker


def _sig(t, d, c, r="x"):
    return {"ticker": t, "signal": d, "confidence": c, "reasoning": r}


def test_bounds_and_labels():
    assert net_to_score(1.0) == 10.0
    assert net_to_score(-1.0) == 1.0
    assert net_to_score(0.0) == 5.5
    assert score_label(8.2) == "Strong Buy"
    assert score_label(6.5) == "Buy"
    assert score_label(5.5) == "Hold"
    assert score_label(3.0) == "Sell"
    assert score_label(1.5) == "Strong Sell"


def test_score_ticker_mix():
    signals = {
        "buffett_analyst": [_sig("A", "bullish", 80, "moat"), _sig("B", "bearish", 70)],
        "burry_analyst": [_sig("A", "bearish", 40, "pricey")],
        "technical_analyst": [_sig("A", "bullish", 60, "uptrend")],
        "sentiment_analyst": [_sig("A", "neutral", 50)],
    }
    s = score_ticker("A", signals, price=10.0)
    # net = (0.8 - 0.4 + 0.6 + 0) / 4 = 0.25 -> 1 + 1.25 * 4.5 = 6.6
    assert s["score"] == 6.6 and s["label"] == "Buy"
    assert (s["bull_count"], s["bear_count"], s["neutral_count"], s["agent_count"]) == (2, 1, 1, 4)
    assert s["top_bullish"][0]["agent_name"] == "Warren Buffett"
    assert s["top_bearish"][0]["reasoning"] == "pricey"
    assert s["persona_score"] is not None and s["analyst_score"] is not None


def test_score_ticker_no_signals_is_neutral():
    s = score_ticker("Z", {})
    assert s["score"] == 5.5 and s["agent_count"] == 0


def test_enum_signals_count_as_directional():
    signals = {
        "buffett_analyst": [{"ticker": "A", "signal": SignalType.BULLISH, "confidence": 90, "reasoning": "moat"}],
        "burry_analyst": [{"ticker": "A", "signal": SignalType.BEARISH, "confidence": 30, "reasoning": "x"}],
    }
    s = score_ticker("A", signals)
    assert (s["bull_count"], s["bear_count"]) == (1, 1)
    assert s["top_bullish"][0]["direction"] == "bullish"
    # net = (0.9 - 0.3) / 2 = 0.3 -> 1 + 1.3 * 4.5 = 6.85
    assert 6.8 <= s["score"] <= 6.9 and s["label"] == "Buy"
