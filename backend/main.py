from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Stock Portfolio Tracker API", 
    version="2.0.0",
    description="A FastAPI backend for stock monitoring with sentiment analysis and impact scoring"
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
        "version": "2.0.0",
        "features": [
            "Sentiment Analysis (VADER + TextBlob)",
            "Impact Score Calculation",
            "Entity Detection",
            "Stock Metadata Integration",
            "Price Movement Prediction"
        ],
        "endpoints": {
            "status": "/status",
            "monitor": "/monitor",
            "monitor_stock": "/monitor/{symbol}",
            "sentiment": "/sentiment/{symbol}",
            "news": "/news/{symbol}",
            "advanced_analysis": "/advanced/{symbol}",
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
        'version': '2.0.0',
        'models_loaded': {
            'vader': True,
            'textblob': True
        },
        'api_keys_configured': {
            'finnhub': finnhub_key is not None and finnhub_key != 'demo',
            'alpha_vantage': alpha_key is not None and alpha_key != 'demo'
        },
        'email_configured': os.getenv('EMAIL_HOST') is not None
    }

@app.post('/monitor')
def run_monitor():
    try:
        from stock_monitor import monitor_stocks
        alerts = monitor_stocks()
        return {'alerts': alerts, 'status': 'success'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring failed: {str(e)}")

@app.post('/monitor/{symbol}')
def monitor_specific_stock(symbol: str):
    try:
        from stock_monitor import monitor_stocks
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
    try:
        from stock_monitor import fetch_news
        from simple_sentiment import simple_analyzer
        from simple_impact_calculator import simple_impact_calculator
        
        news = fetch_news(symbol.upper())
        
        if not news:
            return {
                'symbol': symbol.upper(),
                'message': 'No news found for this stock',
                'news_articles': [],
                'summary': None
            }
        
        news_articles = []
        for item in news[:10]:
            # Simple sentiment analysis
            sentiment = simple_analyzer.analyze_sentiment_simple(item, symbol.upper())
            
            # Simple impact calculation
            impact = simple_impact_calculator.calculate_simple_impact(symbol.upper(), item, sentiment)
            
            news_articles.append({
                'news_id': item.get('id'),
                'headline': item.get('headline'),
                'summary': item.get('summary'),
                'source': item.get('source'),
                'url': item.get('url'),
                'timestamp': item.get('datetime'),
                'sentiment_analysis': sentiment,
                'impact_analysis': impact
            })
        
        return {
            'symbol': symbol.upper(),
            'news_count': len(news),
            'analyzed_count': len(news_articles),
            'news_articles': news_articles,
            'analysis_method': 'Simple (VADER + TextBlob)'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis for {symbol} failed: {str(e)}")

@app.get('/news/{symbol}')
def get_stock_news(symbol: str):
    try:
        from stock_monitor import fetch_news
        from simple_sentiment import simple_analyzer
        from simple_impact_calculator import simple_impact_calculator
        
        news = fetch_news(symbol.upper())
        
        if not news:
            return {
                'symbol': symbol.upper(),
                'message': 'No news found for this stock',
                'articles': []
            }
        
        articles = []
        for item in news[:15]:
            # Simple sentiment analysis
            sentiment = simple_analyzer.analyze_sentiment_simple(item, symbol.upper())
            
            # Simple impact calculation
            impact = simple_impact_calculator.calculate_simple_impact(symbol.upper(), item, sentiment)
            
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
                    'impact_multiplier': sentiment['impact_multiplier'],
                    'entities_found': sentiment['entities_found'],
                    'news_type': sentiment['news_type'],
                    'vader_scores': sentiment['vader_scores'],
                    'textblob_scores': sentiment['textblob_scores']
                },
                'impact_analysis': impact
            }
            articles.append(article)
        
        return {
            'symbol': symbol.upper(),
            'total_articles': len(news),
            'analyzed_articles': len(articles),
            'articles': articles,
            'analysis_method': 'Simple (VADER + TextBlob)'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News analysis for {symbol} failed: {str(e)}")

@app.get('/advanced/{symbol}')
def get_advanced_analysis(symbol: str):
    """Get comprehensive analysis for a stock"""
    try:
        from stock_monitor import fetch_news
        from simple_sentiment import simple_analyzer
        from simple_impact_calculator import simple_impact_calculator
        
        news = fetch_news(symbol.upper())
        
        if not news:
            return {
                'symbol': symbol.upper(),
                'message': 'No news found for this stock',
                'analysis': None
            }
        
        # Get stock metadata
        metadata = simple_analyzer.get_stock_metadata(symbol.upper())
        
        # Analyze all news
        analyses = []
        total_impact = 0
        sentiment_scores = []
        
        for item in news[:20]:
            sentiment = simple_analyzer.analyze_sentiment_simple(item, symbol.upper())
            impact = simple_impact_calculator.calculate_simple_impact(symbol.upper(), item, sentiment)
            
            analyses.append({
                'news': {
                    'headline': item.get('headline'),
                    'summary': item.get('summary'),
                    'source': item.get('source'),
                    'timestamp': item.get('datetime')
                },
                'sentiment': sentiment,
                'impact': impact
            })
            
            total_impact += impact['impact_score']
            sentiment_scores.append(sentiment['score'])
        
        # Calculate overall metrics
        avg_impact = total_impact / len(analyses) if analyses else 0
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        # Determine overall sentiment
        if avg_sentiment > 0.1:
            overall_sentiment = 'POSITIVE'
        elif avg_sentiment < -0.1:
            overall_sentiment = 'NEGATIVE'
        else:
            overall_sentiment = 'NEUTRAL'
        
        return {
            'symbol': symbol.upper(),
            'metadata': metadata,
            'overall_analysis': {
                'sentiment': overall_sentiment,
                'average_sentiment_score': round(avg_sentiment, 3),
                'average_impact_score': round(avg_impact, 2),
                'total_articles_analyzed': len(analyses),
                'high_impact_articles': len([a for a in analyses if a['impact']['impact_level'] in ['HIGH', 'CRITICAL']])
            },
            'detailed_analyses': analyses,
            'analysis_method': 'Simple (VADER + TextBlob)'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced analysis for {symbol} failed: {str(e)}")

@app.get('/health')
def health_check():
    return {'status': 'healthy', 'service': 'stock-tracker-api', 'version': '2.0.0'}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 