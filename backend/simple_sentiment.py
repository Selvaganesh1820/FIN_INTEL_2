import requests
import re
from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from config import FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY

class SimpleSentimentAnalyzer:
    """Simple but effective sentiment analysis for news articles"""
    
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        self.metadata_cache = {}
        
        # Keywords for impact analysis
        self.impact_keywords = {
            'earnings': ['earnings', 'quarterly', 'revenue', 'profit', 'financial', 'results', 'beat', 'miss'],
            'regulatory': ['regulatory', 'investigation', 'lawsuit', 'legal', 'compliance', 'violation', 'fine'],
            'product': ['product', 'launch', 'innovation', 'technology', 'new', 'announcement', 'release'],
            'partnership': ['partnership', 'acquisition', 'merger', 'deal', 'collaboration', 'alliance'],
            'competition': ['competitor', 'competition', 'market share', 'rival', 'challenge'],
            'supply_chain': ['supplier', 'supply chain', 'shortage', 'inventory', 'production'],
            'market': ['market', 'industry', 'sector', 'trend', 'demand', 'supply']
        }
    
    def get_stock_metadata(self, symbol):
        """Get stock metadata for impact calculation"""
        if symbol in self.metadata_cache:
            return self.metadata_cache[symbol]
        
        # Enhanced mock metadata for better impact calculation
        mock_metadata = {
            'AAPL': {
                'market_cap': 2500000000000,
                'sector': 'Technology',
                'industry': 'Consumer Electronics',
                'competitors': ['MSFT', 'GOOGL', 'AMZN', 'Samsung'],
                'suppliers': ['TSMC', 'Foxconn', 'Qualcomm'],
                'raw_materials': ['Silicon', 'Aluminum', 'Rare Earth Metals'],
                'beta': 1.2,
                'pe_ratio': 25.5,
                'revenue': 394328000000,
                'profit_margin': 0.25
            },
            'MSFT': {
                'market_cap': 2200000000000,
                'sector': 'Technology',
                'industry': 'Software',
                'competitors': ['GOOGL', 'AAPL', 'AMZN', 'Oracle'],
                'suppliers': ['Intel', 'AMD', 'NVIDIA'],
                'raw_materials': ['Software Licenses', 'Cloud Infrastructure'],
                'beta': 1.1,
                'pe_ratio': 30.2,
                'revenue': 198270000000,
                'profit_margin': 0.35
            },
            'TSLA': {
                'market_cap': 800000000000,
                'sector': 'Consumer Discretionary',
                'industry': 'Automotive',
                'competitors': ['Ford', 'GM', 'Toyota', 'BMW'],
                'suppliers': ['Panasonic', 'CATL', 'LG Chem'],
                'raw_materials': ['Lithium', 'Nickel', 'Cobalt', 'Steel'],
                'beta': 2.1,
                'pe_ratio': 45.8,
                'revenue': 81462000000,
                'profit_margin': 0.15
            },
            'GOOGL': {
                'market_cap': 1800000000000,
                'sector': 'Technology',
                'industry': 'Internet Services',
                'competitors': ['MSFT', 'AAPL', 'AMZN', 'Meta'],
                'suppliers': ['Cloud Providers', 'Data Centers'],
                'raw_materials': ['Data', 'Computing Resources'],
                'beta': 1.0,
                'pe_ratio': 28.5,
                'revenue': 307394000000,
                'profit_margin': 0.22
            },
            'AMZN': {
                'market_cap': 1600000000000,
                'sector': 'Consumer Discretionary',
                'industry': 'Internet Retail',
                'competitors': ['WMT', 'TGT', 'COST', 'BABA'],
                'suppliers': ['Various Retailers', 'Logistics Partners'],
                'raw_materials': ['Consumer Goods', 'Packaging'],
                'beta': 1.3,
                'pe_ratio': 35.2,
                'revenue': 514004000000,
                'profit_margin': 0.08
            },
            'NVDA': {
                'market_cap': 1200000000000,
                'sector': 'Technology',
                'industry': 'Semiconductors',
                'competitors': ['AMD', 'INTC', 'TSMC'],
                'suppliers': ['TSMC', 'Samsung', 'SK Hynix'],
                'raw_materials': ['Silicon', 'Rare Earth Metals'],
                'beta': 1.8,
                'pe_ratio': 50.5,
                'revenue': 26974000000,
                'profit_margin': 0.40
            }
        }
        
        metadata = mock_metadata.get(symbol, {
            'market_cap': 1000000000000,
            'sector': 'Technology',
            'industry': 'General',
            'competitors': [],
            'suppliers': [],
            'raw_materials': [],
            'beta': 1.0,
            'pe_ratio': 20.0,
            'revenue': 50000000000,
            'profit_margin': 0.10
        })
        
        self.metadata_cache[symbol] = metadata
        return metadata
    
    def classify_news_type(self, headline, summary):
        """Classify the type of news based on keywords"""
        text = f"{headline} {summary}".lower()
        
        for news_type, keywords in self.impact_keywords.items():
            if any(keyword in text for keyword in keywords):
                return news_type
        
        return 'general'
    
    def extract_entities(self, text, metadata):
        """Extract relevant entities from text"""
        text_lower = text.lower()
        entities = {
            'competitors': [],
            'suppliers': [],
            'raw_materials': [],
            'keywords': []
        }
        
        # Check for competitors
        for competitor in metadata.get('competitors', []):
            if competitor.lower() in text_lower:
                entities['competitors'].append(competitor)
        
        # Check for suppliers
        for supplier in metadata.get('suppliers', []):
            if supplier.lower() in text_lower:
                entities['suppliers'].append(supplier)
        
        # Check for raw materials
        for material in metadata.get('raw_materials', []):
            if material.lower() in text_lower:
                entities['raw_materials'].append(material)
        
        # Check for impact keywords
        for news_type, keywords in self.impact_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    entities['keywords'].append(keyword)
        
        return entities
    
    def analyze_sentiment_simple(self, news_item, stock_symbol):
        """
        Simple but effective sentiment analysis for news articles
        """
        headline = news_item.get('headline', '')
        summary = news_item.get('summary', '')
        full_text = f"{headline} {summary}".strip()
        
        # Get stock metadata
        metadata = self.get_stock_metadata(stock_symbol)
        
        # Extract entities
        entities = self.extract_entities(full_text, metadata)
        
        # Analyze with VADER
        vader_scores = self.vader.polarity_scores(full_text)
        vader_compound = vader_scores['compound']
        
        # Analyze with TextBlob
        blob = TextBlob(full_text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # Combine scores (weighted average)
        combined_score = (vader_compound * 0.7) + (textblob_polarity * 0.3)
        
        # Determine sentiment label
        if combined_score >= 0.05:
            sentiment_label = 'POSITIVE'
        elif combined_score <= -0.05:
            sentiment_label = 'NEGATIVE'
        else:
            sentiment_label = 'NEUTRAL'
        
        # Calculate confidence
        confidence = abs(combined_score) + (1 - textblob_subjectivity) * 0.3
        confidence = min(confidence, 1.0)
        
        # Calculate impact multiplier based on entities
        impact_multiplier = 1.0
        if entities['competitors']:
            impact_multiplier *= 1.3
        if entities['suppliers']:
            impact_multiplier *= 1.2
        if entities['raw_materials']:
            impact_multiplier *= 1.4
        if entities['keywords']:
            impact_multiplier *= 1.1
        
        # Classify news type
        news_type = self.classify_news_type(headline, summary)
        
        return {
            'label': sentiment_label,
            'score': round(combined_score, 3),
            'confidence': round(confidence, 3),
            'impact_multiplier': round(impact_multiplier, 2),
            'entities_found': entities,
            'news_type': news_type.upper(),
            'vader_scores': {
                'compound': round(vader_compound, 3),
                'positive': round(vader_scores['pos'], 3),
                'negative': round(vader_scores['neg'], 3),
                'neutral': round(vader_scores['neu'], 3)
            },
            'textblob_scores': {
                'polarity': round(textblob_polarity, 3),
                'subjectivity': round(textblob_subjectivity, 3)
            },
            'stock_symbol': stock_symbol,
            'news_id': news_item.get('id'),
            'headline': headline,
            'summary': summary,
            'timestamp': news_item.get('datetime'),
            'source': news_item.get('source'),
            'url': news_item.get('url')
        }

# Global instance
simple_analyzer = SimpleSentimentAnalyzer() 