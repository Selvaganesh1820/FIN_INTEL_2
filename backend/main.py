from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Stock Portfolio Tracker API", 
    version="1.0.0",
    description="A FastAPI backend for stock monitoring with sentiment analysis"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Stock Portfolio Tracker API", 
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "status": "/status",
            "monitor": "/monitor",
            "monitor_stock": "/monitor/{symbol}",
            "sentiment": "/sentiment/{symbol}",
            "news": "/news/{symbol}",
            "docs": "/docs"
        }
    }

@app.get('/status')
def status():
    # Check if API keys are configured
    finnhub_key = os.getenv('FINNHUB_API_KEY')
    alpha_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    
    return {
        'status': 'ok',
        'api_keys_configured': {
            'finnhub': finnhub_key is not None and finnhub_key != 'demo',
            'alpha_vantage': alpha_key is not None and alpha_key != 'demo'
        },
        'email_configured': os.getenv('EMAIL_HOST') is not None
    }

@app.post('/monitor')
def run_monitor():
    try:
        # Import here to avoid startup errors if API keys are missing
        from stock_monitor import monitor_stocks
        alerts = monitor_stocks()
        return {'alerts': alerts, 'status': 'success'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring failed: {str(e)}")

@app.post('/monitor/{symbol}')
def monitor_specific_stock(symbol: str):
    """Monitor a specific stock with sentiment analysis"""
    try:
        from stock_monitor import monitor_stocks
        # Monitor just this one stock
        alerts = monitor_stocks([symbol.upper()])
        return {
            'symbol': symbol.upper(),
            'alerts': alerts, 
            'status': 'success'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring {symbol} failed: {str(e)}")

@app.get('/sentiment/{symbol}')
def get_stock_sentiment(symbol: str):
    """Get sentiment analysis for a specific stock"""
    try:
        from stock_monitor import fetch_news
        from sentiment import analyze_news_sentiment, get_sentiment_summary
        from impact_calculator import impact_calculator
        
        # Fetch news for this stock
        news = fetch_news(symbol.upper())
        
        if not news:
            return {
                'symbol': symbol.upper(),
                'message': 'No news found for this stock',
                'news_articles': [],
                'summary': None
            }
        
        # Analyze sentiment for each news item individually
        news_articles = []
        for item in news[:10]:  # Analyze up to 10 news items
            sentiment = analyze_news_sentiment(item, symbol.upper())
            impact = impact_calculator.calculate_impact_score(symbol.upper(), item, sentiment)
            news_articles.append({
                'news_id': item.get('id'),
                'headline': item.get('headline'),
                'summary': item.get('summary'),
                'source': item.get('source'),
                'url': item.get('url'),
                'timestamp': item.get('datetime'),
                'sentiment': sentiment,
                'impact': impact
            })
        
        # Get summary
        sentiments = [article['sentiment'] for article in news_articles]
        summary = get_sentiment_summary(sentiments)
        
        return {
            'symbol': symbol.upper(),
            'news_count': len(news),
            'analyzed_count': len(news_articles),
            'news_articles': news_articles,  # Individual news with sentiment
            'summary': summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis for {symbol} failed: {str(e)}")

@app.get('/news/{symbol}')
def get_stock_news(symbol: str):
    """Get news articles for a specific stock with individual sentiment analysis"""
    try:
        from stock_monitor import fetch_news
        from sentiment import analyze_news_sentiment
        from impact_calculator import impact_calculator
        
        # Fetch news for this stock
        news = fetch_news(symbol.upper())
        
        if not news:
            return {
                'symbol': symbol.upper(),
                'message': 'No news found for this stock',
                'articles': []
            }
        
        # Process each news article individually
        articles = []
        for item in news[:15]:  # Get up to 15 news items
            # Analyze sentiment for this specific news article
            sentiment = analyze_news_sentiment(item, symbol.upper())
            impact = impact_calculator.calculate_impact_score(symbol.upper(), item, sentiment)
            
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
                },
                'impact': impact
            }
            articles.append(article)
        
        return {
            'symbol': symbol.upper(),
            'total_articles': len(news),
            'analyzed_articles': len(articles),
            'articles': articles  # Each article has its own sentiment analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News analysis for {symbol} failed: {str(e)}")

@app.get('/health')
def health_check():
    return {'status': 'healthy', 'service': 'stock-tracker-api'}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 