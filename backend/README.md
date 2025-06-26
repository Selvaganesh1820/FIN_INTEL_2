# Stock Alert Backend

This backend monitors stock prices and news, performs sentiment analysis, and sends real email alerts when a stock drops or negative sentiment is detected.

## Features
- Monitors stock prices and news for your portfolio
- Performs sentiment analysis on news headlines/descriptions
- Sends real email alerts when:
  - A stock price drops by a threshold
  - Negative sentiment is detected in news
- REST API endpoints for triggering checks and getting status

## Folder Structure
```
backend/
  ├── app.py                # Main FastAPI app
  ├── requirements.txt      # Python dependencies
  ├── sentiment.py          # Sentiment analysis logic
  ├── stock_monitor.py      # Stock/news polling and alert logic
  ├── email_utils.py        # Email sending logic
  ├── config.py             # Config (API keys, email, etc.)
  └── README.md             # This file
```

## Requirements
- Python 3.8+
- API keys for stock/news (e.g., Finnhub, Alpha Vantage)
- Email credentials (SMTP, SendGrid, or Mailgun)

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy `config.example.py` to `config.py` and fill in your API keys and email credentials.
3. Run the backend:
   ```bash
   uvicorn app:app --reload
   ```

## Endpoints
- `POST /monitor` — Trigger a stock/news check
- `GET /status` — Get current monitoring status

## How it works
- The backend polls stock prices and news.
- It analyzes news sentiment using VADER.
- If a stock drops or negative news is detected, it sends an email alert.

---
**You must provide your own API keys and email credentials for full functionality.** 