from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import List
import random

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SentimentIntensityAnalyzer()

# Simulated news/tweets for demo
SIMULATED_NEWS = {
    "AAPL": [
        "Apple stock surges after strong earnings.",
        "Analysts are bullish on AAPL for Q2.",
        "Some concerns about supply chain, but outlook remains positive."
    ],
    "TSLA": [
        "Tesla faces regulatory scrutiny in Europe.",
        "TSLA shares drop after recall news.",
        "Elon Musk tweets about new product launch."
    ],
    "GOOGL": [
        "Google announces new AI features.",
        "GOOGL stock stable despite market volatility.",
        "Mixed reviews for latest Pixel phone."
    ]
}

SENTIMENT_MAP = {
    "positive": {"label": "Positive", "icon": "🔼", "color": "green"},
    "negative": {"label": "Negative", "icon": "🔽", "color": "red"},
    "neutral":  {"label": "Neutral",  "icon": "⚪", "color": "grey"}
}

@app.get("/api/sentiment/{symbol}")
def get_sentiment(symbol: str):
    # Simulate fetching news/tweets
    texts: List[str] = SIMULATED_NEWS.get(symbol.upper(), [
        f"No recent news found for {symbol.upper()}."
    ])
    # Sentiment analysis
    scores = [analyzer.polarity_scores(text)["compound"] for text in texts]
    avg_score = sum(scores) / len(scores)
    # Determine sentiment
    if avg_score > 0.15:
        sentiment = "positive"
    elif avg_score < -0.15:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    # Simulate impact score
    impactScore = round(abs(avg_score) * random.uniform(0.7, 1.2), 2)
    result = {
        "symbol": symbol.upper(),
        "sentiment": SENTIMENT_MAP[sentiment]["label"],
        "icon": SENTIMENT_MAP[sentiment]["icon"],
        "color": SENTIMENT_MAP[sentiment]["color"],
        "impactScore": impactScore,
        "sampleTexts": texts
    }
    return result 