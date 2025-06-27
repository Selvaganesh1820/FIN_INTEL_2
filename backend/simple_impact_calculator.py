import math
from datetime import datetime
from simple_sentiment import simple_analyzer

class SimpleImpactCalculator:
    """Simple but effective impact calculator for news articles"""
    
    def __init__(self):
        # Impact weights for different news types
        self.news_type_weights = {
            'earnings': 0.9,      # Highest impact
            'regulatory': 0.8,    # Very high impact
            'product': 0.7,       # High impact
            'partnership': 0.6,   # Medium-high impact
            'competition': 0.7,   # High impact
            'supply_chain': 0.6,  # Medium-high impact
            'market': 0.5,        # Medium impact
            'general': 0.3        # Low impact
        }
    
    def calculate_volatility_factor(self, metadata):
        """Calculate volatility factor based on stock characteristics"""
        beta = metadata.get('beta', 1.0)
        market_cap = metadata.get('market_cap', 1000000000000)
        pe_ratio = metadata.get('pe_ratio', 20.0)
        
        # Higher beta = more volatile
        beta_factor = min(beta * 1.2, 2.5)
        
        # Smaller market cap = more volatile
        market_cap_factor = 1 / math.log10(max(market_cap, 1000000) / 1000000)
        market_cap_factor = min(market_cap_factor, 1.8)
        
        # Higher P/E ratio = more volatile (growth stocks)
        pe_factor = min(pe_ratio / 20.0, 1.5)
        
        volatility = (beta_factor + market_cap_factor + pe_factor) / 3
        return min(volatility, 2.0)
    
    def calculate_sentiment_amplifier(self, sentiment_analysis):
        """Calculate how sentiment amplifies the impact"""
        score = sentiment_analysis.get('score', 0)
        confidence = sentiment_analysis.get('confidence', 0)
        impact_multiplier = sentiment_analysis.get('impact_multiplier', 1.0)
        
        # Stronger sentiment = higher impact
        sentiment_strength = abs(score) * confidence * impact_multiplier
        return 1 + sentiment_strength
    
    def calculate_time_factor(self, news_datetime):
        """Calculate time factor - newer news has more impact"""
        if not news_datetime:
            return 1.0
        
        try:
            news_time = datetime.fromtimestamp(news_datetime)
            time_diff = datetime.now() - news_time
            
            # Time decay
            if time_diff.days > 7:
                return 0.4
            elif time_diff.days > 3:
                return 0.6
            elif time_diff.days > 1:
                return 0.8
            elif time_diff.hours > 6:
                return 0.9
            else:
                return 1.0
        except:
            return 1.0
    
    def predict_price_movement(self, sentiment_score, impact_score, metadata):
        """Predict potential price movement"""
        # Base movement calculation
        base_movement = impact_score * 0.12  # 0.12% per impact point
        
        # Adjust based on sentiment
        if sentiment_score > 0.3:
            direction = "STRONG_UP"
            movement = base_movement * 1.4
        elif sentiment_score > 0.1:
            direction = "UP"
            movement = base_movement
        elif sentiment_score < -0.3:
            direction = "STRONG_DOWN"
            movement = base_movement * 1.4
        elif sentiment_score < -0.1:
            direction = "DOWN"
            movement = base_movement
        else:
            direction = "NEUTRAL"
            movement = base_movement * 0.4
        
        # Adjust based on stock characteristics
        beta = metadata.get('beta', 1.0)
        movement *= beta
        
        return {
            'direction': direction,
            'percentage': min(movement, 12.0),  # Cap at 12%
            'confidence': min(impact_score / 100, 0.85)
        }
    
    def calculate_simple_impact(self, stock_symbol, news_item, sentiment_analysis):
        """
        Calculate simple but effective impact score for news articles
        """
        # Get stock metadata
        metadata = simple_analyzer.get_stock_metadata(stock_symbol)
        
        # Get news type from sentiment analysis
        news_type = sentiment_analysis.get('news_type', 'GENERAL').lower()
        
        # Get base impact weight
        base_weight = self.news_type_weights.get(news_type, 0.3)
        
        # Calculate various factors
        volatility_factor = self.calculate_volatility_factor(metadata)
        sentiment_amplifier = self.calculate_sentiment_amplifier(sentiment_analysis)
        time_factor = self.calculate_time_factor(news_item.get('datetime'))
        
        # Calculate final impact score (0-100)
        impact_score = (
            base_weight * 
            volatility_factor * 
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
        
        # Predict price movement
        price_prediction = self.predict_price_movement(
            sentiment_analysis.get('score', 0),
            impact_score,
            metadata
        )
        
        return {
            'impact_score': round(impact_score, 2),
            'impact_level': impact_level,
            'price_prediction': price_prediction,
            'news_type': news_type.upper(),
            'factors': {
                'base_weight': round(base_weight, 3),
                'volatility_factor': round(volatility_factor, 3),
                'sentiment_amplifier': round(sentiment_amplifier, 3),
                'time_factor': round(time_factor, 3)
            },
            'entities_found': sentiment_analysis.get('entities_found', {}),
            'metadata': {
                'market_cap': metadata.get('market_cap', 0),
                'beta': metadata.get('beta', 1.0),
                'sector': metadata.get('sector', 'Unknown'),
                'industry': metadata.get('industry', 'Unknown'),
                'pe_ratio': metadata.get('pe_ratio', 0)
            }
        }

# Global instance
simple_impact_calculator = SimpleImpactCalculator() 