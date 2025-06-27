import requests
import os
import json
from datetime import datetime
from config import FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY
from sentiment import analyze_news_sentiment, get_sentiment_summary
from email_utils import send_email

# Example portfolio
PORTFOLIO = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'
]

PRICE_DROP_THRESHOLD = 0.02  # 2%

# Track last prices and processed news for each stock individually
last_prices = {}
processed_news = {}  # {stock_symbol: set of news_ids}

def fetch_price(symbol):
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == 'demo':
        # Return mock data if no API key
        return 150.0 + hash(symbol) % 100
    
    try:
        url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}'
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            return data.get('c')  # current price
        else:
            print(f"Error fetching price for {symbol}: {r.status_code}")
            return None
    except Exception as e:
        print(f"Exception fetching price for {symbol}: {e}")
        return None

def fetch_news(symbol):
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == 'demo':
        # Return mock news if no API key - different for each stock
        mock_news = [
            {
                'id': f'mock_{symbol}_1_{datetime.now().timestamp()}',
                'headline': f'{symbol} reports strong quarterly earnings',
                'summary': f'{symbol} has exceeded analyst expectations with impressive quarterly results.',
                'datetime': datetime.now().timestamp(),
                'source': 'Mock News',
                'url': f'https://mock-news.com/{symbol.lower()}'
            },
            {
                'id': f'mock_{symbol}_2_{datetime.now().timestamp()}',
                'headline': f'{symbol} faces regulatory challenges',
                'summary': f'Regulatory authorities are investigating {symbol} business practices.',
                'datetime': datetime.now().timestamp(),
                'source': 'Mock News',
                'url': f'https://mock-news.com/{symbol.lower()}'
            },
            {
                'id': f'mock_{symbol}_3_{datetime.now().timestamp()}',
                'headline': f'{symbol} announces new product innovation',
                'summary': f'{symbol} has unveiled groundbreaking new technology that will revolutionize the industry.',
                'datetime': datetime.now().timestamp(),
                'source': 'Mock News',
                'url': f'https://mock-news.com/{symbol.lower()}'
            }
        ]
        return mock_news
    
    try:
        url = f'https://finnhub.io/api/v1/company-news?symbol={symbol}&from=2023-01-01&to=2025-12-31&token={FINNHUB_API_KEY}'
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return r.json()
        else:
            print(f"Error fetching news for {symbol}: {r.status_code}")
            return []
    except Exception as e:
        print(f"Exception fetching news for {symbol}: {e}")
        return []

def monitor_stocks(portfolio=PORTFOLIO):
    alerts = []
    stock_results = {}
    
    # Check if we have proper API keys
    if not FINNHUB_API_KEY or FINNHUB_API_KEY == 'demo':
        alerts.append("Warning: Using demo API key. Get real API keys for live data.")
    
    for symbol in portfolio:
        try:
            print(f"\n📊 Monitoring {symbol}...")
            
            # Initialize tracking for this stock if not exists
            if symbol not in processed_news:
                processed_news[symbol] = set()
            
            # Price check
            price = fetch_price(symbol)
            if price is not None:
                last = last_prices.get(symbol)
                if last:
                    change = (price - last) / last
                    if change <= -PRICE_DROP_THRESHOLD:
                        msg = f'{symbol} dropped by {change*100:.2f}% (from ${last:.2f} to ${price:.2f})'
                        try:
                            send_email(f'Price Alert: {symbol}', msg)
                        except Exception as e:
                            print(f"Failed to send email alert: {e}")
                        alerts.append(msg)
                last_prices[symbol] = price
                print(f"  💰 {symbol} price: ${price:.2f}")
            
            # News check - analyze each news item individually
            news = fetch_news(symbol)
            stock_articles = []
            
            print(f"  📰 Found {len(news)} news articles for {symbol}")
            
            for item in news[:10]:  # Check more news items
                news_id = item.get('id')
                
                # Skip if we've already processed this news
                if news_id in processed_news[symbol]:
                    continue
                
                # Mark as processed
                processed_news[symbol].add(news_id)
                
                # Analyze sentiment for this specific news item
                sentiment = analyze_news_sentiment(item, symbol)
                
                # Create individual article object
                article = {
                    'id': item.get('id'),
                    'headline': item.get('headline'),
                    'summary': item.get('summary'),
                    'source': item.get('source'),
                    'url': item.get('url'),
                    'datetime': item.get('datetime'),
                    'sentiment_analysis': {
                        'label': sentiment['label'],
                        'score': sentiment['score'],
                        'confidence': sentiment['confidence'],
                        'positive': sentiment['positive'],
                        'negative': sentiment['negative'],
                        'neutral': sentiment['neutral']
                    }
                }
                
                stock_articles.append(article)
                
                print(f"    📄 News: {item.get('headline', 'No headline')[:50]}...")
                print(f"       Sentiment: {sentiment['label']} (score: {sentiment['score']:.3f})")
                
                # Alert for negative sentiment
                if sentiment['label'] == 'negative' and sentiment['confidence'] > 0.1:
                    msg = f"""🚨 Negative News Alert for {symbol}:
📰 Headline: {item.get('headline', 'No headline')}
📝 Summary: {item.get('summary', 'No summary')}
😞 Sentiment: {sentiment['label']} (confidence: {sentiment['confidence']:.3f})
📊 Score: {sentiment['score']:.3f}
🔗 Source: {item.get('source', 'Unknown')}
⏰ Time: {datetime.fromtimestamp(item.get('datetime', 0)).strftime('%Y-%m-%d %H:%M:%S') if item.get('datetime') else 'Unknown'}"""
                    
                    try:
                        send_email(f'Negative News Alert: {symbol}', msg)
                    except Exception as e:
                        print(f"Failed to send email alert: {e}")
                    alerts.append(f"Negative news for {symbol}: {item.get('headline', 'No headline')}")
            
            # Store results for this stock
            stock_results[symbol] = {
                'price': price,
                'articles': stock_articles,
                'total_articles': len(news),
                'analyzed_articles': len(stock_articles)
            }
            
            if stock_articles:
                print(f"  📊 {symbol}: Analyzed {len(stock_articles)} new articles")
            
        except Exception as e:
            print(f"Error monitoring {symbol}: {e}")
            alerts.append(f"Error monitoring {symbol}: {str(e)}")
    
    # Add detailed results to alerts
    if stock_results:
        results_msg = "\n📊 Detailed Monitoring Results:\n"
        for symbol, data in stock_results.items():
            results_msg += f"\n  {symbol}:\n"
            results_msg += f"    Price: ${data['price']:.2f}\n"
            results_msg += f"    Articles: {data['analyzed_articles']}/{data['total_articles']}\n"
            
            # Show individual article sentiments
            for article in data['articles']:
                sentiment = article['sentiment_analysis']
                results_msg += f"    📄 {article['headline'][:40]}... - {sentiment['label'].upper()} ({sentiment['score']:.3f})\n"
        
        alerts.append(results_msg)
    
    return alerts 