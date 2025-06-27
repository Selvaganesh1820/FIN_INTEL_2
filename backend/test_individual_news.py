#!/usr/bin/env python3
"""
Test script for individual news sentiment analysis
Shows each news article with its own sentiment analysis
"""

from sentiment import analyze_news_sentiment
from stock_monitor import fetch_news
import json
from datetime import datetime

def test_individual_news_analysis():
    """Test individual news analysis for each stock"""
    
    test_stocks = ['AAPL', 'MSFT', 'TSLA']
    
    print("🧪 Testing Individual News Sentiment Analysis")
    print("=" * 80)
    
    for symbol in test_stocks:
        print(f"\n📊 {symbol} - Individual News Analysis:")
        print("=" * 60)
        
        # Fetch news for this stock
        news = fetch_news(symbol)
        
        if not news:
            print(f"  ❌ No news found for {symbol}")
            continue
        
        print(f"  📰 Found {len(news)} news articles")
        print(f"  🔍 Analyzing each article individually...\n")
        
        # Analyze each news article individually
        for i, item in enumerate(news, 1):
            print(f"  📄 Article {i}:")
            print(f"     Headline: {item.get('headline', 'No headline')}")
            print(f"     Summary: {item.get('summary', 'No summary')[:100]}...")
            print(f"     Source: {item.get('source', 'Unknown')}")
            
            # Analyze sentiment for this specific article
            sentiment = analyze_news_sentiment(item, symbol)
            
            print(f"     Sentiment Analysis:")
            print(f"       🏷️  Label: {sentiment['label'].upper()}")
            print(f"       📊 Score: {sentiment['score']:.3f}")
            print(f"       🎯 Confidence: {sentiment['confidence']:.3f}")
            print(f"       ✅ Positive: {sentiment['positive']:.3f}")
            print(f"       ❌ Negative: {sentiment['negative']:.3f}")
            print(f"       ⚖️  Neutral: {sentiment['neutral']:.3f}")
            print(f"       🏢 Stock: {sentiment['stock_symbol']}")
            print(f"       🆔 News ID: {sentiment['news_id']}")
            
            # Add visual indicators
            if sentiment['label'] == 'positive':
                print(f"       🌟 POSITIVE SENTIMENT")
            elif sentiment['label'] == 'negative':
                print(f"       ⚠️  NEGATIVE SENTIMENT")
            else:
                print(f"       ➖ NEUTRAL SENTIMENT")
            
            print()  # Empty line between articles
        
        print(f"  ✅ Completed analysis for {symbol}")
        print("-" * 60)

if __name__ == "__main__":
    print("🚀 Starting Individual News Sentiment Analysis Tests")
    print("=" * 80)
    
    # Test individual news analysis
    test_individual_news_analysis()
    
    print("\n✅ All tests completed!")
    print("\n📋 Key Features Demonstrated:")
    print("  ✅ Each news article analyzed individually")
    print("  ✅ Individual sentiment scores per article")
    print("  ✅ Article-specific metadata preserved")
    print("  ✅ Stock-specific analysis")
    print("  ✅ No common headings - each article stands alone") 