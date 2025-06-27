#!/usr/bin/env python3
"""
Test script for enhanced sentiment analysis
Demonstrates individual news analysis for each stock
"""

from sentiment import analyze_news_sentiment, get_sentiment_summary
from stock_monitor import fetch_news
import json

def test_sentiment_analysis():
    """Test sentiment analysis for individual stocks"""
    
    # Test stocks
    test_stocks = ['AAPL', 'MSFT', 'TSLA']
    
    print("🧪 Testing Enhanced Sentiment Analysis")
    print("=" * 60)
    
    for symbol in test_stocks:
        print(f"\n📊 Testing {symbol} sentiment analysis:")
        print("-" * 40)
        
        # Fetch news for this stock
        news = fetch_news(symbol)
        
        if not news:
            print(f"  ❌ No news found for {symbol}")
            continue
        
        print(f"  📰 Found {len(news)} news articles")
        
        # Analyze each news item individually
        sentiments = []
        for i, item in enumerate(news[:5], 1):  # Test first 5 news items
            print(f"\n  📄 News {i}:")
            print(f"     Headline: {item.get('headline', 'No headline')[:60]}...")
            
            # Analyze sentiment for this specific news item
            sentiment = analyze_news_sentiment(item, symbol)
            sentiments.append(sentiment)
            
            print(f"     Sentiment: {sentiment['label'].upper()} (score: {sentiment['score']:.3f})")
            print(f"     Confidence: {sentiment['confidence']:.3f}")
            print(f"     Positive: {sentiment['positive']:.3f}, Negative: {sentiment['negative']:.3f}, Neutral: {sentiment['neutral']:.3f}")
        
        # Get summary for this stock
        if sentiments:
            summary = get_sentiment_summary(sentiments)
            print(f"\n  📊 {symbol} Sentiment Summary:")
            print(f"     Overall: {summary['overall_sentiment'].upper()}")
            print(f"     Positive: {summary['positive_count']}, Negative: {summary['negative_count']}, Neutral: {summary['neutral_count']}")
            print(f"     Average Score: {summary['average_score']:.3f}")
        
        print("\n" + "=" * 60)

def test_individual_news_analysis():
    """Test individual news analysis with different content"""
    
    print("\n🔍 Testing Individual News Analysis")
    print("=" * 60)
    
    # Test different types of news for the same stock
    test_news = [
        {
            'id': 'test_1',
            'headline': 'AAPL reports record-breaking quarterly earnings',
            'summary': 'Apple Inc. has exceeded all analyst expectations with unprecedented quarterly results.',
            'datetime': 1640995200,
            'source': 'Test News',
            'url': 'https://test.com/1'
        },
        {
            'id': 'test_2',
            'headline': 'AAPL faces regulatory investigation over privacy concerns',
            'summary': 'Regulatory authorities are investigating Apple for potential privacy violations.',
            'datetime': 1640995200,
            'source': 'Test News',
            'url': 'https://test.com/2'
        },
        {
            'id': 'test_3',
            'headline': 'AAPL announces new product line',
            'summary': 'Apple has announced a new line of products that will be available next month.',
            'datetime': 1640995200,
            'source': 'Test News',
            'url': 'https://test.com/3'
        }
    ]
    
    for i, news_item in enumerate(test_news, 1):
        print(f"\n📄 Test News {i}:")
        print(f"   Headline: {news_item['headline']}")
        print(f"   Summary: {news_item['summary']}")
        
        # Analyze sentiment
        sentiment = analyze_news_sentiment(news_item, 'AAPL')
        
        print(f"   Sentiment: {sentiment['label'].upper()} (score: {sentiment['score']:.3f})")
        print(f"   Confidence: {sentiment['confidence']:.3f}")
        print(f"   Stock Symbol: {sentiment['stock_symbol']}")

if __name__ == "__main__":
    print("🚀 Starting Sentiment Analysis Tests")
    print("=" * 60)
    
    # Test sentiment analysis for different stocks
    test_sentiment_analysis()
    
    # Test individual news analysis
    test_individual_news_analysis()
    
    print("\n✅ All tests completed!")
    print("\n📋 Key Features Demonstrated:")
    print("  ✅ Individual news analysis for each stock")
    print("  ✅ Stock-specific sentiment tracking")
    print("  ✅ Enhanced sentiment scoring with confidence")
    print("  ✅ Detailed sentiment breakdown (positive/negative/neutral)")
    print("  ✅ News metadata preservation")
    print("  ✅ Summary statistics per stock") 