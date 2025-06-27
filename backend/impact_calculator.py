import requests
import math
from datetime import datetime, timedelta
from config import FINNHUB_API_KEY, ALPHA_VANTAGE_API_KEY

class ImpactCalculator:
    """Calculate the potential impact of news on stock price"""
    
    def __init__(self):
        self.impact_factors = {
            'earnings': 0.8,      # High impact
            'regulatory': 0.7,    # High impact
            'product': 0.6,       # Medium-high impact
            'partnership': 0.5,   # Medium impact
            'market': 0.4,        # Medium impact
            'general': 0.3        # Low impact
        }
        
        # Keywords that indicate different types of news
        self.news_keywords = {
            'earnings': ['earnings', 'quarterly', 'revenue', 'profit', 'financial', 'results', 'beat', 'miss'],
            'regulatory': ['regulatory', 'investigation', 'lawsuit', 'legal', 'compliance', 'violation', 'fine'],
            'product': ['product', 'launch', 'innovation', 'technology', 'new', 'announcement', 'release'],
            'partnership': ['partnership', 'acquisition', 'merger', 'deal', 'collaboration', 'alliance'],
            'market': ['market', 'competition', 'industry', 'sector', 'trend', 'demand', 'supply'],
            'general': ['company', 'business', 'corporate', 'management', 'strategy']
        }
    
    def get_stock_metadata(self, symbol):
        """Get stock metadata for impact calculation"""
        if not FINNHUB_API_KEY or FINNHUB_API_KEY == 'demo':
            # Return mock metadata for demo
            return {
                'market_cap': 2000000000000,  # 2 trillion
                'volume': 50000000,
                'beta': 1.2,
                'pe_ratio': 25.5,
                'sector': 'Technology',
                'industry': 'Consumer Electronics'
            }
        
        try:
            # Get company profile
            profile_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={FINNHUB_API_KEY}'
            profile_response = requests.get(profile_url, timeout=10)
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                
                # Get additional metrics
                metrics_url = f'https://finnhub.io/api/v1/stock/metric?symbol={symbol}&metric=all&token={FINNHUB_API_KEY}'
                metrics_response = requests.get(metrics_url, timeout=10)
                
                metadata = {
                    'market_cap': profile.get('marketCapitalization', 0),
                    'volume': profile.get('shareOutstanding', 0),
                    'sector': profile.get('finnhubIndustry', 'Unknown'),
                    'industry': profile.get('industry', 'Unknown'),
                    'country': profile.get('country', 'Unknown'),
                    'exchange': profile.get('exchange', 'Unknown')
                }
                
                if metrics_response.status_code == 200:
                    metrics = metrics_response.json()
                    if 'metric' in metrics:
                        metric_data = metrics['metric']
                        metadata.update({
                            'beta': metric_data.get('beta', 1.0),
                            'pe_ratio': metric_data.get('peRatioTTM', 0),
                            'dividend_yield': metric_data.get('dividendYieldIndicatedAnnual', 0),
                            'debt_to_equity': metric_data.get('totalDebtToEquity', 0)
                        })
                
                return metadata
            else:
                return self._get_default_metadata(symbol)
                
        except Exception as e:
            print(f"Error fetching metadata for {symbol}: {e}")
            return self._get_default_metadata(symbol)
    
    def _get_default_metadata(self, symbol):
        """Get default metadata when API fails"""
        return {
            'market_cap': 1000000000000,  # 1 trillion default
            'volume': 10000000,
            'beta': 1.0,
            'pe_ratio': 20.0,
            'sector': 'Technology',
            'industry': 'General'
        }
    
    def classify_news_type(self, headline, summary):
        """Classify the type of news based on keywords"""
        text = f"{headline} {summary}".lower()
        
        for news_type, keywords in self.news_keywords.items():
            if any(keyword in text for keyword in keywords):
                return news_type
        
        return 'general'
    
    def calculate_volatility_factor(self, beta, market_cap):
        """Calculate volatility factor based on beta and market cap"""
        # Higher beta = more volatile = higher impact
        # Smaller market cap = more volatile = higher impact
        volatility = beta * (1 / math.log10(max(market_cap, 1000000) / 1000000))
        return min(volatility, 2.0)  # Cap at 2.0
    
    def calculate_volume_factor(self, volume):
        """Calculate volume factor - higher volume = more liquid = lower impact"""
        # Higher volume means more liquid, so news has less impact
        volume_factor = 1 / math.log10(max(volume, 1000000) / 1000000)
        return min(volume_factor, 1.5)
    
    def calculate_sentiment_amplifier(self, sentiment_score, confidence):
        """Calculate how much sentiment amplifies the impact"""
        # Stronger sentiment (positive or negative) = higher impact
        sentiment_strength = abs(sentiment_score) * confidence
        return 1 + sentiment_strength
    
    def calculate_time_factor(self, news_datetime):
        """Calculate time factor - newer news has more impact"""
        if not news_datetime:
            return 1.0
        
        try:
            news_time = datetime.fromtimestamp(news_datetime)
            time_diff = datetime.now() - news_time
            
            # News older than 7 days has reduced impact
            if time_diff.days > 7:
                return 0.5
            elif time_diff.days > 3:
                return 0.7
            elif time_diff.days > 1:
                return 0.9
            else:
                return 1.0
        except:
            return 1.0
    
    def calculate_impact_score(self, symbol, news_item, sentiment_analysis):
        """
        Calculate the potential impact score of news on stock price
        
        Returns:
            dict: Impact analysis with score and breakdown
        """
        # Get stock metadata
        metadata = self.get_stock_metadata(symbol)
        
        # Classify news type
        news_type = self.classify_news_type(
            news_item.get('headline', ''),
            news_item.get('summary', '')
        )
        
        # Get base impact factor for news type
        base_impact = self.impact_factors.get(news_type, 0.3)
        
        # Calculate various factors
        volatility_factor = self.calculate_volatility_factor(
            metadata.get('beta', 1.0),
            metadata.get('market_cap', 1000000000000)
        )
        
        volume_factor = self.calculate_volume_factor(
            metadata.get('volume', 10000000)
        )
        
        sentiment_amplifier = self.calculate_sentiment_amplifier(
            sentiment_analysis['score'],
            sentiment_analysis['confidence']
        )
        
        time_factor = self.calculate_time_factor(
            news_item.get('datetime')
        )
        
        # Calculate final impact score (0-100)
        impact_score = (
            base_impact * 
            volatility_factor * 
            volume_factor * 
            sentiment_amplifier * 
            time_factor * 
            100
        )
        
        # Cap the score at 100
        impact_score = min(impact_score, 100)
        
        # Determine impact level
        if impact_score >= 80:
            impact_level = "CRITICAL"
        elif impact_score >= 60:
            impact_level = "HIGH"
        elif impact_score >= 40:
            impact_level = "MEDIUM"
        elif impact_score >= 20:
            impact_level = "LOW"
        else:
            impact_level = "MINIMAL"
        
        # Calculate potential price movement
        sentiment_score = sentiment_analysis['score']
        if sentiment_score > 0:
            price_direction = "UP"
            price_change_pct = impact_score * 0.1  # 0.1% per impact point
        elif sentiment_score < 0:
            price_direction = "DOWN"
            price_change_pct = impact_score * 0.1
        else:
            price_direction = "NEUTRAL"
            price_change_pct = 0
        
        return {
            'impact_score': round(impact_score, 2),
            'impact_level': impact_level,
            'price_direction': price_direction,
            'potential_price_change_pct': round(price_change_pct, 2),
            'news_type': news_type.upper(),
            'factors': {
                'base_impact': round(base_impact, 3),
                'volatility_factor': round(volatility_factor, 3),
                'volume_factor': round(volume_factor, 3),
                'sentiment_amplifier': round(sentiment_amplifier, 3),
                'time_factor': round(time_factor, 3)
            },
            'metadata': {
                'market_cap': metadata.get('market_cap', 0),
                'beta': metadata.get('beta', 1.0),
                'sector': metadata.get('sector', 'Unknown'),
                'industry': metadata.get('industry', 'Unknown')
            }
        }

# Global instance
impact_calculator = ImpactCalculator() 