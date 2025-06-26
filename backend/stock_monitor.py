import requests
from config import FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY
from sentiment import analyze_sentiment
from email_utils import send_email

# Example portfolio
PORTFOLIO = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'
]

PRICE_DROP_THRESHOLD = 0.02  # 2%

last_prices = {}
last_news_ids = set()

def fetch_price(symbol):
    url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}'
    r = requests.get(url)
    data = r.json()
    return data.get('c')  # current price

def fetch_news(symbol):
    url = f'https://finnhub.io/api/v1/company-news?symbol={symbol}&from=2023-01-01&to=2025-12-31&token={FINNHUB_API_KEY}'
    r = requests.get(url)
    return r.json()

def monitor_stocks(portfolio=PORTFOLIO):
    alerts = []
    for symbol in portfolio:
        # Price check
        price = fetch_price(symbol)
        if price is not None:
            last = last_prices.get(symbol)
            if last:
                change = (price - last) / last
                if change <= -PRICE_DROP_THRESHOLD:
                    msg = f'{symbol} dropped by {change*100:.2f}% (from ${last:.2f} to ${price:.2f})'
                    send_email(f'Price Alert: {symbol}', msg)
                    alerts.append(msg)
            last_prices[symbol] = price
        # News check
        news = fetch_news(symbol)
        for item in news[:5]:
            if item['id'] in last_news_ids:
                continue
            last_news_ids.add(item['id'])
            sentiment = analyze_sentiment(item.get('headline', '') + ' ' + item.get('summary', ''))
            if sentiment['label'] == 'negative':
                msg = f'Negative news for {symbol}: {item["headline"]}\n{item.get("summary", "")}\nSentiment: {sentiment["score"]}'
                send_email(f'Negative News Alert: {symbol}', msg)
                alerts.append(msg)
    return alerts 