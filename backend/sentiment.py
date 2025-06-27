from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re

# Initialize analyzer once for better performance
analyzer = SentimentIntensityAnalyzer()

def clean_text(text):
    """Clean and preprocess text for better sentiment analysis"""
    if not text:
        return ""
    
    # Remove special characters and normalize
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def analyze_sentiment(text, stock_symbol=None):
    """
    Analyze sentiment of text with enhanced features
    
    Args:
        text (str): Text to analyze
        stock_symbol (str): Stock symbol for context (optional)
    
    Returns:
        dict: Sentiment analysis results
    """
    if not text:
        return {
            'score': 0.0,
            'label': 'neutral',
            'confidence': 0.0,
            'stock_symbol': stock_symbol
        }
    
    # Clean the text
    cleaned_text = clean_text(text)
    
    if not cleaned_text:
        return {
            'score': 0.0,
            'label': 'neutral',
            'confidence': 0.0,
            'stock_symbol': stock_symbol
        }
    
    # Get sentiment scores
    scores = analyzer.polarity_scores(cleaned_text)
    
    # Determine label based on compound score
    compound = scores['compound']
    if compound >= 0.05:
        label = 'positive'
    elif compound <= -0.05:
        label = 'negative'
    else:
        label = 'neutral'
    
    # Calculate confidence based on how far from neutral
    confidence = abs(compound)
    
    return {
        'score': compound,
        'label': label,
        'confidence': confidence,
        'stock_symbol': stock_symbol,
        'positive': scores['pos'],
        'negative': scores['neg'],
        'neutral': scores['neu']
    }

def analyze_news_sentiment(news_item, stock_symbol):
    """
    Analyze sentiment for a specific news item for a specific stock
    
    Args:
        news_item (dict): News item with headline and summary
        stock_symbol (str): Stock symbol
    
    Returns:
        dict: Enhanced sentiment analysis with news context
    """
    headline = news_item.get('headline', '')
    summary = news_item.get('summary', '')
    
    # Combine headline and summary for analysis
    full_text = f"{headline} {summary}".strip()
    
    # Analyze sentiment
    sentiment = analyze_sentiment(full_text, stock_symbol)
    
    # Add news-specific information
    sentiment.update({
        'news_id': news_item.get('id'),
        'headline': headline,
        'summary': summary,
        'timestamp': news_item.get('datetime'),
        'source': news_item.get('source'),
        'url': news_item.get('url')
    })
    
    return sentiment

def get_sentiment_summary(sentiments):
    """
    Get a summary of sentiments for multiple news items
    
    Args:
        sentiments (list): List of sentiment analysis results
    
    Returns:
        dict: Summary statistics
    """
    if not sentiments:
        return {
            'total_news': 0,
            'positive_count': 0,
            'negative_count': 0,
            'neutral_count': 0,
            'average_score': 0.0,
            'overall_sentiment': 'neutral'
        }
    
    positive_count = sum(1 for s in sentiments if s['label'] == 'positive')
    negative_count = sum(1 for s in sentiments if s['label'] == 'negative')
    neutral_count = sum(1 for s in sentiments if s['label'] == 'neutral')
    
    average_score = sum(s['score'] for s in sentiments) / len(sentiments)
    
    # Determine overall sentiment
    if positive_count > negative_count:
        overall_sentiment = 'positive'
    elif negative_count > positive_count:
        overall_sentiment = 'negative'
    else:
        overall_sentiment = 'neutral'
    
    return {
        'total_news': len(sentiments),
        'positive_count': positive_count,
        'negative_count': negative_count,
        'neutral_count': neutral_count,
        'average_score': average_score,
        'overall_sentiment': overall_sentiment
    } 