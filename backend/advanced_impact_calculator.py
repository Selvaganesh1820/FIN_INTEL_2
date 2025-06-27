import math
import numpy as np
from datetime import datetime, timedelta
from advanced_sentiment import advanced_analyzer

class AdvancedImpactCalculator:
    """Advanced impact calculator using multiple factors and metadata"""
    
    def __init__(self):
        # Impact factors for different news types
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
        
        # Keywords for news classification
        self.news_keywords = {
            'earnings': ['earnings', 'quarterly', 'revenue', 'profit', 'financial', 'results', 'beat', 'miss', 'guidance'],
            'regulatory': ['regulatory', 'investigation', 'lawsuit', 'legal', 'compliance', 'violation', 'fine', 'fda', 'sec'],
            'product': ['product', 'launch', 'innovation', 'technology', 'new', 'announcement', 'release', 'update'],
            'partnership': ['partnership', 'acquisition', 'merger', 'deal', 'collaboration', 'alliance', 'joint venture'],
            'competition': ['competitor', 'competition', 'market share', 'rival', 'challenge', 'threat'],
            'supply_chain': ['supplier', 'supply chain', 'shortage', 'inventory', 'production', 'manufacturing'],
            'market': ['market', 'industry', 'sector', 'trend', 'demand', 'supply', 'growth', 'decline'],
            'general': ['company', 'business', 'corporate', 'management', 'strategy', 'plan']
        }
    
    def classify_news_type(self, headline, summary, entities):
        """Classify news type based on content and entities"""
        text = f"{headline} {summary}".lower()
        
        # Check for entity-based classification first
        if entities.get('competitors'):
            return 'competition'
        if entities.get('suppliers') or entities.get('raw_materials'):
            return 'supply_chain'
        
        # Check for keyword-based classification
        for news_type, keywords in self.news_keywords.items():
            if any(keyword in text for keyword in keywords):
                return news_type
        
        return 'general'
    
    def calculate_volatility_factor(self, metadata):
        """Calculate volatility factor based on stock characteristics"""
        beta = metadata.get('beta', 1.0)
        market_cap = metadata.get('market_cap', 1000000000000)
        pe_ratio = metadata.get('pe_ratio', 20.0)
        
        # Higher beta = more volatile
        beta_factor = min(beta * 1.5, 3.0)
        
        # Smaller market cap = more volatile
        market_cap_factor = 1 / math.log10(max(market_cap, 1000000) / 1000000)
        market_cap_factor = min(market_cap_factor, 2.0)
        
        # Higher P/E ratio = more volatile (growth stocks)
        pe_factor = min(pe_ratio / 20.0, 2.0)
        
        volatility = (beta_factor + market_cap_factor + pe_factor) / 3
        return min(volatility, 2.5)
    
    def calculate_liquidity_factor(self, metadata):
        """Calculate liquidity factor - more liquid stocks are less affected by news"""
        market_cap = metadata.get('market_cap', 1000000000000)
        revenue = metadata.get('revenue', 50000000000)
        
        # Larger companies are more liquid
        size_factor = math.log10(max(market_cap, 1000000) / 1000000)
        liquidity_factor = 1 / (1 + size_factor * 0.1)
        
        return min(liquidity_factor, 1.5)
    
    def calculate_sector_factor(self, metadata, entities):
        """Calculate sector-specific impact factor"""
        sector = metadata.get('sector', 'Technology').lower()
        industry_keywords = entities.get('industry_keywords', [])
        
        # Sector-specific multipliers
        sector_multipliers = {
            'technology': 1.2,      # Tech news moves markets more
            'healthcare': 1.3,      # Healthcare is highly regulated
            'finance': 1.1,         # Financial news is important
            'energy': 1.0,          # Standard impact
            'consumer discretionary': 0.9,  # Less volatile
            'utilities': 0.8        # Very stable
        }
        
        base_multiplier = sector_multipliers.get(sector, 1.0)
        
        # Industry keywords can amplify impact
        if industry_keywords:
            base_multiplier *= 1.1
        
        return base_multiplier
    
    def calculate_time_decay(self, news_datetime):
        """Calculate time decay factor - newer news has more impact"""
        if not news_datetime:
            return 1.0
        
        try:
            news_time = datetime.fromtimestamp(news_datetime)
            time_diff = datetime.now() - news_time
            
            # Exponential decay
            if time_diff.days > 7:
                return 0.3
            elif time_diff.days > 3:
                return 0.5
            elif time_diff.days > 1:
                return 0.7
            elif time_diff.hours > 6:
                return 0.9
            else:
                return 1.0
        except:
            return 1.0
    
    def calculate_sentiment_amplifier(self, sentiment_analysis):
        """Calculate how sentiment amplifies the impact"""
        score = sentiment_analysis.get('score', 0)
        confidence = sentiment_analysis.get('confidence', 0)
        impact_multiplier = sentiment_analysis.get('impact_multiplier', 1.0)
        
        # Stronger sentiment = higher impact
        sentiment_strength = abs(score) * confidence * impact_multiplier
        return 1 + sentiment_strength
    
    def calculate_entity_impact(self, entities, metadata):
        """Calculate impact based on entities mentioned"""
        entity_score = 0.0
        
        # Competitor mentions
        if entities.get('competitors'):
            entity_score += 0.3 * len(entities['competitors'])
        
        # Supplier issues
        if entities.get('suppliers'):
            entity_score += 0.4 * len(entities['suppliers'])
        
        # Raw material issues
        if entities.get('raw_materials'):
            entity_score += 0.5 * len(entities['raw_materials'])
        
        # Industry keywords
        if entities.get('industry_keywords'):
            entity_score += 0.1 * len(entities['industry_keywords'])
        
        return min(entity_score, 2.0)
    
    def predict_price_movement(self, sentiment_score, impact_score, metadata):
        """Predict potential price movement"""
        # Base movement calculation
        base_movement = impact_score * 0.15  # 0.15% per impact point
        
        # Adjust based on sentiment
        if sentiment_score > 0.3:
            direction = "STRONG_UP"
            movement = base_movement * 1.5
        elif sentiment_score > 0.1:
            direction = "UP"
            movement = base_movement
        elif sentiment_score < -0.3:
            direction = "STRONG_DOWN"
            movement = base_movement * 1.5
        elif sentiment_score < -0.1:
            direction = "DOWN"
            movement = base_movement
        else:
            direction = "NEUTRAL"
            movement = base_movement * 0.3
        
        # Adjust based on stock characteristics
        beta = metadata.get('beta', 1.0)
        movement *= beta
        
        return {
            'direction': direction,
            'percentage': min(movement, 15.0),  # Cap at 15%
            'confidence': min(impact_score / 100, 0.9)
        }
    
    def calculate_advanced_impact(self, stock_symbol, news_item, sentiment_analysis):
        """
        Calculate advanced impact score using comprehensive analysis
        """
        # Get stock metadata
        metadata = advanced_analyzer.get_stock_metadata(stock_symbol)
        
        # Extract entities from sentiment analysis
        entities = sentiment_analysis.get('entities', {})
        
        # Classify news type
        news_type = self.classify_news_type(
            news_item.get('headline', ''),
            news_item.get('summary', ''),
            entities
        )
        
        # Get base impact weight
        base_weight = self.news_type_weights.get(news_type, 0.3)
        
        # Calculate various factors
        volatility_factor = self.calculate_volatility_factor(metadata)
        liquidity_factor = self.calculate_liquidity_factor(metadata)
        sector_factor = self.calculate_sector_factor(metadata, entities)
        time_decay = self.calculate_time_decay(news_item.get('datetime'))
        sentiment_amplifier = self.calculate_sentiment_amplifier(sentiment_analysis)
        entity_impact = self.calculate_entity_impact(entities, metadata)
        
        # Calculate final impact score (0-100)
        impact_score = (
            base_weight * 
            volatility_factor * 
            liquidity_factor * 
            sector_factor * 
            time_decay * 
            sentiment_amplifier * 
            (1 + entity_impact) * 
            100
        )
        
        # Cap the score at 100
        impact_score = min(impact_score, 100)
        
        # Determine impact level
        if impact_score >= 85:
            impact_level = "CRITICAL"
        elif impact_score >= 70:
            impact_level = "HIGH"
        elif impact_score >= 50:
            impact_level = "MEDIUM"
        elif impact_score >= 30:
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
                'liquidity_factor': round(liquidity_factor, 3),
                'sector_factor': round(sector_factor, 3),
                'time_decay': round(time_decay, 3),
                'sentiment_amplifier': round(sentiment_amplifier, 3),
                'entity_impact': round(entity_impact, 3)
            },
            'entities_found': entities,
            'metadata': {
                'market_cap': metadata.get('market_cap', 0),
                'beta': metadata.get('beta', 1.0),
                'sector': metadata.get('sector', 'Unknown'),
                'industry': metadata.get('industry', 'Unknown'),
                'pe_ratio': metadata.get('pe_ratio', 0),
                'revenue': metadata.get('revenue', 0)
            },
            'analysis_models': sentiment_analysis.get('models_used', [])
        }

# Global instance
advanced_impact_calculator = AdvancedImpactCalculator() 