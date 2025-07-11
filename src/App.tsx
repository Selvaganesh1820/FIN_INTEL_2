import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchStockData, searchStocks } from './services/stockApi';
import symbolToSector from './utils/symbolToSector';
import PortfolioTable from './segments/PortfolioTable';
import AddStockModal from './segments/AddStockModal';
import NewsSlideshowModal from './segments/NewsSlideshowModal';
import SummaryCards from './segments/SummaryCards';
import Header from './components/Header';
import { getLogoUrl } from './utils/symbolToSector';
import MarketNewsCard from './segments/MarketNewsCard';
import axios from 'axios';

interface Holding {
  symbol: string;
  shares: number;
}

interface Stock {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  weightPercent?: number;
  weekRange52?: { low: number; high: number };
}

interface NewsItemType {
  title: string;
  description: string;
  symbol: string;
  timeAgo: string;
  imageUrl: string;
  source: string;
  url: string;
  sentiment?: any;
  isCompetitor: boolean;
}

interface SearchResult {
  symbol: string;
  name: string;
  price?: number;
  sector?: string;
}

const competitors: Record<string, string[]> = {
  AAPL: ['MSFT', 'GOOGL', 'AMZN', 'META'],
  MSFT: ['AAPL', 'GOOGL', 'AMZN', 'META'],
  GOOGL: ['AAPL', 'MSFT', 'AMZN', 'META'],
  TSLA: ['F', 'GM', 'NIO', 'RIVN'],
  AMZN: ['WMT', 'TGT', 'COST', 'HD'],
  NVDA: ['AMD', 'INTC', 'TSM', 'AVGO'],
  META: ['GOOGL', 'AAPL', 'AMZN', 'NFLX'],
  JPM: ['BAC', 'WFC', 'GS', 'MS'],
  JNJ: ['PFE', 'ABBV', 'MRK', 'UNH'],
  V: ['MA', 'AXP', 'DFS', 'COF']
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<Holding[]>([
    { symbol: 'AAPL', shares: 10 },
    { symbol: 'MSFT', shares: 8 },
    { symbol: 'GOOGL', shares: 5 },
    { symbol: 'TSLA', shares: 15 },
    { symbol: 'AMZN', shares: 12 },
    { symbol: 'NVDA', shares: 6 },
    { symbol: 'META', shares: 8 },
    { symbol: 'JPM', shares: 20 },
    { symbol: 'JNJ', shares: 15 },
    { symbol: 'V', shares: 12 }
  ]);
  const [news, setNews] = useState<Record<string, NewsItemType[]>>({});
  const [newsLoading, setNewsLoading] = useState<Record<string, boolean>>({});
  const [overallNewsLoading, setOverallNewsLoading] = useState(false);
  const [newsCache, setNewsCache] = useState<Record<string, { news: any[], timestamp: number }>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [filterText, setFilterText] = useState('');
  const [alerts, setAlerts] = useState<{ id: number; message: string; read: boolean; time: string; green?: boolean }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const alertIdRef = useRef(1);
  const [notifiedStocks, setNotifiedStocks] = useState<Set<string>>(new Set());
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [removedStockSymbol, setRemovedStockSymbol] = useState('');

  // Effects
  useEffect(() => {
    loadStocks(portfolioHoldings);
  }, []); // Only run on initial load, not when portfolioHoldings changes

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Simulate real-time alerts (replace with real backend/websocket in production)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Example: random alert for demo
  //     const stock = portfolioHoldings[Math.floor(Math.random() * portfolioHoldings.length)];
  //     if (!stock) return;
  //     const type = Math.random() > 0.5 ? 'Price Alert' : 'Sentiment Alert';
  //     const msg = type === 'Price Alert'
  //       ? `${stock.symbol} price moved significantly!`
  //       : `${stock.symbol} news sentiment changed!`;
  //     setAlerts(prev => [
  //       { id: alertIdRef.current++, message: msg, read: false, time: new Date().toLocaleTimeString() },
  //       ...prev.slice(0, 9)
  //     ]);
  //     setUnreadCount(c => c + 1);
  //   }, 15000); // every 15s
  //   return () => clearInterval(interval);
  // }, [portfolioHoldings]);

  // Show green alert and send email on stock decrease
  useEffect(() => {
    if (!stocks || stocks.length === 0) return;
    
    const now = Date.now();
    const cooldownPeriod = 30000; // 30 seconds cooldown between notifications
    
    // Only check for notifications if enough time has passed
    if (now - lastNotificationTime < cooldownPeriod) return;
    
    stocks.forEach(stock => {
      // Only notify for significant drops (more than 2% or $1.00)
      const isSignificantDrop = stock.change && 
                               stock.change < 0 && 
                               (Math.abs(stock.changePercent || 0) > 2 || Math.abs(stock.change || 0) > 1);
      
      if (isSignificantDrop && !notifiedStocks.has(stock.symbol)) {
        // Show green alert
        setAlerts(prev => [
          {
            id: alertIdRef.current++,
            message: `${stock.symbol} price decreased by $${Math.abs(stock.change || 0).toFixed(2)} (${Math.abs(stock.changePercent || 0).toFixed(2)}%)`,
            read: false,
            time: new Date().toLocaleTimeString(),
            green: true
          },
          ...prev.slice(0, 9)
        ]);
        setUnreadCount(c => c + 1);
        
        // Track this stock as notified
        setNotifiedStocks(prev => new Set([...prev, stock.symbol]));
        setLastNotificationTime(now);
        
        // Send email (placeholder API call)
        axios.post('/api/send-alert-email', {
          symbol: stock.symbol,
          change: stock.change,
          changePercent: stock.changePercent
        }).catch(() => {});
      }
    });
    
    // Clear old notifications after 5 minutes
    setTimeout(() => {
      setNotifiedStocks(new Set());
    }, 300000); // 5 minutes
    
    // eslint-disable-next-line
  }, [stocks, lastNotificationTime, notifiedStocks]);

  // Core functions
  async function loadStocks(holdings: Holding[]) {
    setLoading(true);
    try {
      const stockData: Stock[] = await Promise.all(
        holdings.map((h: Holding) => fetchStockData(h.symbol))
      );
      setStocks(stockData);
    } catch (error) {
      console.error('Error loading stocks:', error);
    }
    setLoading(false);
  }

  const uniqueSectors = Array.from(new Set(portfolioHoldings.map(h => symbolToSector[h.symbol] || 'Other')));

  const filteredAndSortedStocks = stocks
    .filter(stock => {
      if (sectorFilter !== 'all' && symbolToSector[stock.symbol] !== sectorFilter) return false;
      if (filterText.trim()) {
        const searchText = filterText.toLowerCase();
        return stock.symbol.toLowerCase().includes(searchText) || 
               stock.name?.toLowerCase().includes(searchText);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'change':
          return (b.changePercent || 0) - (a.changePercent || 0);
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

  // News fetching with caching (6-hour cache)
  const fetchNewsForStock = async (symbol: string) => {
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    const cached = newsCache[symbol];
    
    if (cached && (now - cached.timestamp) < sixHours && cached.news.length > 1) {
      console.log(`Using cached news for ${symbol}:`, cached.news.length, 'items');
      setNews(prev => ({ ...prev, [symbol]: cached.news }));
      return;
    }

    setNewsLoading(prev => ({ ...prev, [symbol]: true }));
    console.log(`Fetching news for ${symbol}...`);
    
    try {
      // Fetch more competitor symbols to get 3 direct and 3 competitor news
      const symbols = [symbol, ...(competitors[symbol] || []).slice(0, 3)]; // Fetch 3 competitors
      console.log(`Fetching news for symbols:`, symbols);
      
      // Add delay between requests to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Fetch news from multiple sources with proper rate limiting
      const allNews = [];
      
      for (let i = 0; i < symbols.length; i++) {
        const sym = symbols[i];
        
        // Add delay between requests to avoid rate limiting
        if (i > 0) await delay(800); // 800ms delay between requests
        
        try {
          // Try Finnhub first
          const finnhubRes = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}&token=d1eeu2hr01qjssrjma80d1eeu2hr01qjssrjma8g`);
          
          if (finnhubRes.ok) {
            const data = await finnhubRes.json();
            console.log(`API response for ${sym}:`, data?.length || 0, 'items');
            if (data && data.length > 0) {
              // Get more news items to have enough for 3 direct and 3 competitor
              const recentNews = data.slice(0, 3); // Increased to 3
              
              if (recentNews.length > 0) {
                // Store raw news data for batch sentiment analysis
                allNews.push(...recentNews.map((n: any) => ({
                  ...n,
                  symbol: sym,
                  isCompetitor: sym !== symbol
                })));
              }
            }
          } else {
            console.log(`API failed for ${sym}:`, finnhubRes.status);
          }
        } catch (error) {
          console.log(`Error fetching news for ${sym}:`, error);
        }
      }
      
      // Process all news items with sentiment analysis at once (no delays)
      const processedNews = allNews.map((n: any) => {
        // Analyze sentiment for this specific news item
        const title = n.headline.toLowerCase();
        const description = n.summary.toLowerCase();
          const text = title + ' ' + description;
          
          let sentimentScore = 0;
          let sentimentLabel = 'Neutral';
          
        // More comprehensive keyword analysis
        const positiveKeywords = [
          'up', 'rise', 'gain', 'positive', 'beat', 'strong', 'growth', 'surge', 'rally', 'jump',
          'higher', 'increase', 'profit', 'earnings', 'revenue', 'success', 'win', 'bullish',
          'outperform', 'upgrade', 'buy', 'recommend', 'favorable', 'optimistic', 'recovery'
        ];
        
        const negativeKeywords = [
          'down', 'fall', 'drop', 'negative', 'miss', 'weak', 'loss', 'decline', 'crash', 'plunge',
          'lower', 'decrease', 'deficit', 'failure', 'bearish', 'underperform', 'downgrade',
          'sell', 'avoid', 'unfavorable', 'pessimistic', 'recession', 'bankruptcy', 'layoff'
        ];
        
        // Count keyword matches
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveKeywords.forEach(keyword => {
          if (text.includes(keyword)) positiveCount++;
        });
        
        negativeKeywords.forEach(keyword => {
          if (text.includes(keyword)) negativeCount++;
        });
        
        // Calculate sentiment based on keyword balance
        if (positiveCount > negativeCount) {
          sentimentScore = Math.min(0.8, (positiveCount - negativeCount) * 0.2);
            sentimentLabel = 'Positive';
        } else if (negativeCount > positiveCount) {
          sentimentScore = Math.max(-0.8, (negativeCount - positiveCount) * -0.2);
            sentimentLabel = 'Negative';
        } else {
          sentimentScore = 0;
          sentimentLabel = 'Neutral';
        }
        
        // Calculate dynamic impact score based on multiple factors
        let impactScore = 0.2; // Lower base impact
        
        // Source credibility with varied weights
        const sourceWeights = {
          'Reuters': 0.4,
          'Bloomberg': 0.4,
          'CNBC': 0.35,
          'MarketWatch': 0.3,
          'Yahoo Finance': 0.25,
          'Financial Times': 0.45,
          'Wall Street Journal': 0.45,
          'Associated Press': 0.3,
          'Business Insider': 0.25,
          'Forbes': 0.3,
          'Fortune': 0.3
        };
        
        if (n.source && sourceWeights[n.source as keyof typeof sourceWeights]) {
          impactScore += sourceWeights[n.source as keyof typeof sourceWeights];
        } else {
          impactScore += 0.15; // Default for unknown sources
        }
        
        // Content type impact with more granular scoring
        let contentMultiplier = 1.0;
        
        if (text.includes('earnings') || text.includes('quarterly') || text.includes('financial results') || text.includes('revenue')) {
          contentMultiplier += 0.6; // High impact for earnings news
        }
        if (text.includes('ceo') || text.includes('executive') || text.includes('leadership') || text.includes('management') || text.includes('chief')) {
          contentMultiplier += 0.3; // Medium impact for leadership news
        }
        if (text.includes('merger') || text.includes('acquisition') || text.includes('deal') || text.includes('buyout')) {
          contentMultiplier += 0.5; // High impact for M&A news
        }
        if (text.includes('product') || text.includes('launch') || text.includes('innovation') || text.includes('new feature')) {
          contentMultiplier += 0.25; // Medium impact for product news
        }
        if (text.includes('regulation') || text.includes('legal') || text.includes('lawsuit') || text.includes('investigation')) {
          contentMultiplier += 0.4; // High impact for regulatory news
        }
        if (text.includes('layoff') || text.includes('job cut') || text.includes('restructuring')) {
          contentMultiplier += 0.35; // High impact for negative news
        }
        if (text.includes('upgrade') || text.includes('downgrade') || text.includes('rating')) {
          contentMultiplier += 0.3; // Medium impact for analyst actions
        }
        if (text.includes('stock split') || text.includes('dividend')) {
          contentMultiplier += 0.2; // Lower impact for corporate actions
        }
        
        // Apply content multiplier
        impactScore *= contentMultiplier;
        
        // Time sensitivity with more varied scoring
        const newsAge = Date.now() - (n.datetime * 1000);
        const hoursOld = newsAge / (1000 * 60 * 60);
        if (hoursOld < 6) impactScore += 0.3; // Very recent news
        else if (hoursOld < 24) impactScore += 0.2; // Recent news
        else if (hoursOld < 72) impactScore += 0.1; // Recent-ish news
        else impactScore += 0.05; // Older news
        
        // Add some randomness to make it more realistic
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        impactScore *= randomFactor;
        
        // Cap impact score between 0.1 and 1.0
        impactScore = Math.max(0.1, Math.min(1.0, impactScore));
          
          return {
          title: n.headline,
          description: n.summary,
          symbol: n.symbol,
          timeAgo: new Date(n.datetime * 1000).toLocaleString(),
          imageUrl: n.image || '',
          source: n.source,
          url: n.url,
          isCompetitor: n.isCompetitor,
          timestamp: n.datetime * 1000, // Store timestamp for caching
            sentiment: {
              score: sentimentScore,
              label: sentimentLabel,
              impact_score: impactScore.toFixed(1),
            news_type: n.isCompetitor ? 'competitor' : 'direct'
            }
          };
        });
        
      const newNews = processedNews.filter(result => result !== null);
      console.log(`Total new news items for ${symbol}:`, newNews.length);
      
      if (newNews.length > 0) {
        // Separate direct and competitor news with original limits (3 direct, 3 competitor)
        const directNews = newNews.filter(item => !item.isCompetitor).slice(0, 3); // Back to 3 direct
        const competitorNews = newNews.filter(item => item.isCompetitor).slice(0, 3); // Back to 3 competitor
        
        // Combine direct news with competitor news
        const limitedNews = [...directNews, ...competitorNews];
        
        setNews(prev => ({ ...prev, [symbol]: limitedNews }));
        setNewsCache(prev => ({ 
          ...prev, 
          [symbol]: { news: limitedNews, timestamp: now } 
        }));
      } else {
        console.log(`No news found for ${symbol}, generating fallback news`);
        // Generate fallback news with varied sentiment (2 positive, 2 neutral, 2 negative)
        const fallbackNews = [
          {
            title: `${symbol} Earnings Beat Expectations: Strong Q4 Results`,
            description: `${symbol} reported better-than-expected quarterly earnings with revenue growth of 15% year-over-year. The company's strong performance in key markets has analysts upgrading their price targets.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Financial Times',
            url: '#',
            isCompetitor: false,
            sentiment: {
              score: 0.6,
              label: 'Positive',
              impact_score: '0.9',
              news_type: 'direct'
            }
          },
          {
            title: `${symbol} Product Launch: New Innovation Drives Growth`,
            description: `${symbol} announced the launch of its latest product line, receiving positive feedback from early adopters. The innovation is expected to drive significant revenue growth in the coming quarters.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'MarketWatch',
            url: '#',
            isCompetitor: false,
            sentiment: {
              score: 0.4,
              label: 'Positive',
              impact_score: '0.7',
              news_type: 'direct'
            }
          },
          {
            title: `${symbol} Market Analysis: Technical Indicators Show Stability`,
            description: `Technical analysis for ${symbol} indicates stable trading patterns with support levels holding firm. The stock is trading within expected ranges with moderate volatility.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Technical Analysis',
            url: '#',
            isCompetitor: false,
            sentiment: {
              score: 0.0,
              label: 'Neutral',
              impact_score: '0.5',
              news_type: 'direct'
            }
          },
          {
            title: `${competitors[symbol]?.[0] || 'COMP'} Competitive Pressure: Market Share Dynamics`,
            description: `Competitor ${competitors[symbol]?.[0] || 'COMP'} is maintaining its market position with steady performance. The competitive landscape remains balanced with no significant shifts in market dynamics.`,
            symbol: competitors[symbol]?.[0] || 'COMP',
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Industry Report',
            url: '#',
            isCompetitor: true,
            sentiment: {
              score: 0.0,
              label: 'Neutral',
              impact_score: '0.4',
              news_type: 'competitor'
            }
          },
          {
            title: `${competitors[symbol]?.[1] || 'COMP2'} Regulatory Concerns: Compliance Issues Arise`,
            description: `Industry peer ${competitors[symbol]?.[1] || 'COMP2'} faces regulatory scrutiny over compliance matters. The investigation could impact sector-wide sentiment and investor confidence.`,
            symbol: competitors[symbol]?.[1] || 'COMP2',
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Reuters',
            url: '#',
            isCompetitor: true,
            sentiment: {
              score: -0.5,
              label: 'Negative',
              impact_score: '0.8',
              news_type: 'competitor'
            }
          },
          {
            title: `${competitors[symbol]?.[2] || 'COMP3'} Market Downturn: Sector Weakness Observed`,
            description: `Market dynamics show weakness in the sector with ${competitors[symbol]?.[2] || 'COMP3'} experiencing declining performance. Sector-wide concerns are affecting investor sentiment.`,
            symbol: competitors[symbol]?.[2] || 'COMP3',
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Bloomberg',
            url: '#',
            isCompetitor: true,
            sentiment: {
              score: -0.3,
              label: 'Negative',
              impact_score: '0.6',
              news_type: 'competitor'
            }
          }
        ];
        
        setNews(prev => ({ ...prev, [symbol]: fallbackNews }));
        setNewsCache(prev => ({ 
          ...prev, 
          [symbol]: { news: fallbackNews, timestamp: now } 
        }));
      }
    } catch (error) {
      console.log(`Error in fetchNewsForStock for ${symbol}:`, error);
    } finally {
      setNewsLoading(prev => ({ ...prev, [symbol]: false }));
    }
  };

  // Fetch news for portfolio stocks with better optimization
  useEffect(() => {
    const fetchNewsForPortfolio = async () => {
      const symbols = portfolioHoldings.map(h => h.symbol);
      
      // Only fetch news for stocks that don't have cached data
      const symbolsToFetch = symbols.filter(symbol => {
        const cached = newsCache[symbol];
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;
        return !cached || (now - cached.timestamp) >= sixHours || cached.news.length <= 1;
      });
      
      if (symbolsToFetch.length > 0) {
        setOverallNewsLoading(true);
        console.log(`Fetching news for ${symbolsToFetch.length} out of ${symbols.length} stocks`);
        
              // Fetch news with proper rate limiting to avoid 429 errors
      for (let i = 0; i < symbolsToFetch.length; i++) {
        const symbol = symbolsToFetch[i];
        try {
        await fetchNewsForStock(symbol);
          // Add longer delay between requests to respect rate limits
          if (i < symbolsToFetch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay between requests
          }
        } catch (error) {
          console.log(`Error fetching news for ${symbol}:`, error);
          // Continue with next symbol even if one fails
        }
      }
        setOverallNewsLoading(false);
      }
    };
    
    if (portfolioHoldings.length > 0) {
      fetchNewsForPortfolio();
    }
  }, [portfolioHoldings]); // Only run when portfolioHoldings changes, not on every render

  // Refresh function to reload all stock data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Clear cache to force fresh data
      setNewsCache({});
      setNews({});
      setNewsLoading({});
      
      // Reload all stock data
      await loadStocks(portfolioHoldings);
      
      // Fetch fresh news for all stocks in parallel
      const symbols = portfolioHoldings.map(h => h.symbol);
      const fetchPromises = symbols.map(async (symbol, index) => {
        // Add staggered delays to avoid overwhelming the API
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, index * 150)); // 150ms staggered delay
        }
        return fetchNewsForStock(symbol);
      });
      
      // Wait for all news to be fetched
      await Promise.all(fetchPromises);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setLoading(false);
  };

  // Portfolio summary calculations
  const totalValue = stocks.reduce((sum, stock) => {
    const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
    return sum + (stock.price || 0) * (holding?.shares || 0);
  }, 0);
  const totalDayChange = stocks.reduce((sum, stock) => {
    const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
    return sum + (stock.change || 0) * (holding?.shares || 0);
  }, 0);
  const totalGainLoss = stocks.reduce((sum, stock) => {
    const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
    const mockPurchasePrice = (stock.price || 0) - (stock.change || 0) * 10;
    return sum + ((stock.price || 0) - mockPurchasePrice) * (holding?.shares || 0);
  }, 0);
  const activePositions = portfolioHoldings.length;

  // Utility functions
  const calculateSentiment = (newsItems: any[]) => {
    if (!newsItems || newsItems.length === 0) return { sentiment: 'Neutral', score: 0, impact: 0 };
    
    let totalScore = 0;
    let totalImpact = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    newsItems.forEach(item => {
      if (item.sentiment) {
        totalScore += item.sentiment.score;
        totalImpact += parseFloat(item.sentiment.impact_score || '0');
        
        if (item.sentiment.score > 0) positiveCount++;
        else if (item.sentiment.score < 0) negativeCount++;
        else neutralCount++;
      }
    });
    
    const avgScore = totalScore / newsItems.length;
    const avgImpact = totalImpact / newsItems.length;
    
    let overallSentiment = 'Neutral';
    if (positiveCount > negativeCount && positiveCount > neutralCount) overallSentiment = 'Positive';
    else if (negativeCount > positiveCount && negativeCount > neutralCount) overallSentiment = 'Negative';
    
    return {
      sentiment: overallSentiment,
      score: avgScore,
      impact: avgImpact
    };
  };

  // --- NEW: Portfolio-level impact and sentiment ---
  // Helper to get stock size (large, medium, small) by market value
  const getStockSize = (positionValue: number) => {
    if (positionValue > 50000) return 'large';
    if (positionValue > 10000) return 'medium';
    return 'small';
  };

  // Calculate per-news impact weighted by stock size
  const calculateNewsImpact = (symbol: string) => {
    const holding = portfolioHoldings.find(h => h.symbol === symbol);
    const stock = stocks.find(s => s.symbol === symbol);
    if (!holding || !stock) return 0;
    const positionValue = (stock.price || 0) * (holding.shares || 0);
    const size = getStockSize(positionValue);
    const newsItems = news[symbol] || [];
    
    // If no news is available yet, provide instant mock impact score
    if (newsItems.length === 0) {
      const mockImpact = Math.random() * 0.6 + 0.3; // Random impact between 0.3 and 0.9
      // Weight by size
      if (size === 'large') return mockImpact * 1.5;
      else if (size === 'medium') return mockImpact * 1.1;
      else return mockImpact * 0.8;
    }
    
    let totalImpact = 0;
    let count = 0;
    newsItems.forEach(item => {
      let impact = parseFloat(item?.sentiment?.impact_score || '0');
      // Weight by size
      if (size === 'large') impact *= 1.5;
      else if (size === 'medium') impact *= 1.1;
      else impact *= 0.8;
      totalImpact += impact;
      count++;
    });
    return count > 0 ? totalImpact / count : 0;
  };

  // Calculate overall portfolio impact (average weighted by position value)
  const calculatePortfolioImpact = () => {
    let totalWeightedImpact = 0;
    let totalValue = 0;
    portfolioHoldings.forEach(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      if (!stock) return;
      const positionValue = (stock.price || 0) * (holding.shares || 0);
      const newsItems = news[holding.symbol] || [];
      
      let stockImpact = 0;
      if (newsItems.length === 0) {
        // Provide instant mock impact when no news is available
        stockImpact = Math.random() * 0.6 + 0.3; // Random impact between 0.3 and 0.9
      } else {
      let count = 0;
      newsItems.forEach(item => {
        let impact = parseFloat(item?.sentiment?.impact_score || '0');
        stockImpact += impact;
        count++;
      });
      if (count > 0) stockImpact = stockImpact / count;
      }
      
      totalWeightedImpact += stockImpact * positionValue;
      totalValue += positionValue;
    });
    return totalValue > 0 ? totalWeightedImpact / totalValue : 0;
  };

  // Calculate overall portfolio sentiment (average of all news, weighted by position value)
  const calculatePortfolioSentiment = () => {
    let totalWeightedScore = 0;
    let totalValue = 0;
    portfolioHoldings.forEach(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      if (!stock) return;
      const positionValue = (stock.price || 0) * (holding.shares || 0);
      const newsItems = news[holding.symbol] || [];
      
      let stockScore = 0;
      if (newsItems.length === 0) {
        // Provide instant mock sentiment when no news is available
        stockScore = (Math.random() - 0.5) * 0.8; // Random sentiment between -0.4 and 0.4
      } else {
      let count = 0;
      newsItems.forEach(item => {
        let score = item?.sentiment?.score || 0;
        stockScore += score;
        count++;
      });
      if (count > 0) stockScore = stockScore / count;
      }
      
      totalWeightedScore += stockScore * positionValue;
      totalValue += positionValue;
    });
    return totalValue > 0 ? totalWeightedScore / totalValue : 0;
  };

  const calculateVolatility = (stock: any) => {
    const changePercent = Math.abs(stock.changePercent || 0);
    if (changePercent > 5) return 'High';
    if (changePercent > 2) return 'Medium';
    return 'Low';
  };

  const getSentimentBgColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Negative': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate gain/loss for a stock position
  const calculateGainLoss = (stock: Stock, shares: number) => {
    const currentPrice = stock.price || 0;
    const mockPurchasePrice = currentPrice - (stock.change || 0) * 10; // Simulate purchase price
    const totalGainLoss = (currentPrice - mockPurchasePrice) * shares;
    const gainLossPercent = mockPurchasePrice > 0 ? ((currentPrice - mockPurchasePrice) / mockPurchasePrice) * 100 : 0;
    
    return {
      gainLoss: totalGainLoss,
      gainLossPercent: gainLossPercent
    };
  };

  // Calculate weight percentage of position in portfolio
  const calculateWeightPercent = (stock: Stock, shares: number, totalPortfolioValue: number) => {
    const positionValue = (stock.price || 0) * shares;
    return totalPortfolioValue > 0 ? (positionValue / totalPortfolioValue) * 100 : 0;
  };

  // Generate 52-week range based on current price
  const generate52WeekRange = (stock: Stock) => {
    const currentPrice = stock.price || 0;
    const volatility = Math.abs(stock.changePercent || 0) / 100;
    const range = currentPrice * volatility * 2; // Simulate 52-week range
    
    return {
      low: Math.max(currentPrice - range, currentPrice * 0.7), // Don't go below 70% of current price
      high: currentPrice + range
    };
  };

  // Load stocks for new additions without triggering full reload
  const loadNewStock = async (symbol: string) => {
    try {
      const stockData = await fetchStockData(symbol);
      setStocks(prev => {
        const existing = prev.find(s => s.symbol === symbol);
        if (existing) {
          return prev.map(s => s.symbol === symbol ? stockData : s);
        } else {
          return [...prev, stockData];
        }
      });
    } catch (error) {
      console.error(`Error loading stock ${symbol}:`, error);
    }
  };

  // Handlers
  const handleAddStock = () => {
    setIsAddModalOpen(true);
  };

  const handleAddStockSubmit = async (symbol: string, shares: number) => {
    const existingHolding = portfolioHoldings.find(h => h.symbol === symbol);
    
    if (existingHolding) {
      // Update existing holding
      setPortfolioHoldings(prev => prev.map(h => 
        h.symbol === symbol 
          ? { ...h, shares: h.shares + shares }
          : h
      ));
    } else {
      // Add new holding
      setPortfolioHoldings(prev => [...prev, { symbol, shares }]);
      
      // Immediately add a placeholder stock to make it visible in the table
      const placeholderStock: Stock = {
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        changePercent: 0
      };
      
      setStocks(prev => {
        const existing = prev.find(s => s.symbol === symbol);
        if (existing) {
          return prev;
        } else {
          return [...prev, placeholderStock];
        }
      });
      
      // Load real stock data in the background
      loadNewStock(symbol);
      
      // Fetch news for new stock
      fetchNewsForStock(symbol);
    }
    
    setIsAddModalOpen(false);
  };

  const handleDeleteStock = (symbol: string) => {
    // Remove from portfolio holdings
    setPortfolioHoldings(prev => prev.filter(h => h.symbol !== symbol));
    
    // Remove from stocks array
    setStocks(prev => prev.filter(s => s.symbol !== symbol));
    
    // Clean up news data
    setNews(prev => {
      const newNews = { ...prev };
      delete newNews[symbol];
      return newNews;
    });
    
    // Clean up news loading state
    setNewsLoading(prev => {
      const newLoading = { ...prev };
      delete newLoading[symbol];
      return newLoading;
    });
    
    // Clean up news cache
    setNewsCache(prev => {
      const newCache = { ...prev };
      delete newCache[symbol];
      return newCache;
    });
    
    // Show popup notification that stock has been removed
    setRemovedStockSymbol(symbol);
    setShowRemovePopup(true);
    
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      setShowRemovePopup(false);
      setRemovedStockSymbol('');
    }, 3000);
  };

  const handleViewNews = (symbol: string) => {
    // Fetch news if not already loaded
    if (!news[symbol]) {
      fetchNewsForStock(symbol);
    }
  };

  // Mark all as read when dropdown is opened
  const handleBellClick = () => {
    setShowDropdown(v => !v);
    if (!showDropdown) {
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    }
  };
  const handleDropdownClose = () => setShowDropdown(false);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
        <Header
          alerts={alerts}
          unreadCount={unreadCount}
          onBellClick={handleBellClick}
          showDropdown={showDropdown}
          onDropdownClose={handleDropdownClose}
          onRefresh={handleRefresh}
          isRefreshing={loading}
          lastUpdated={new Date()}
        />
        
        <div className="container mx-auto px-4 py-6">
          <SummaryCards 
            totalValue={totalValue}
            totalDayChange={totalDayChange}
            totalGainLoss={totalGainLoss}
            activePositions={activePositions}
            darkMode={darkMode}
            portfolioImpactLabel={(() => {
              const netImpact = filteredAndSortedStocks.reduce((sum, stock) => sum + (typeof calculateNewsImpact === 'function' ? calculateNewsImpact(stock.symbol) : 0), 0);
              if (netImpact > 20) return 'Large';
              else if (netImpact > 8) return 'Medium';
              return 'Small';
            })()}
            overallSentiment={calculateSentiment(
              filteredAndSortedStocks.flatMap(stock => news[stock.symbol] || [])
            )}
          />
          
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* Portfolio Table - Left Side */}
            <div className="col-span-9">
            <PortfolioTable
              filteredAndSortedStocks={filteredAndSortedStocks}
              portfolioHoldings={portfolioHoldings}
              news={news}
              newsLoading={newsLoading}
              handleAddStock={handleAddStock}
              handleDeleteStock={handleDeleteStock}
              handleViewNews={handleViewNews}
              calculateVolatility={calculateVolatility}
              calculateSentiment={calculateSentiment}
              getSentimentBgColor={getSentimentBgColor}
              getLogoUrl={getLogoUrl}
              sectorFilter={sectorFilter}
              setSectorFilter={setSectorFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filterText={filterText}
              setFilterText={setFilterText}
              uniqueSectors={uniqueSectors}
              darkMode={darkMode}
              calculateGainLoss={calculateGainLoss}
              calculateWeightPercent={calculateWeightPercent}
              generate52WeekRange={generate52WeekRange}
              totalPortfolioValue={totalValue}
                calculateNewsImpact={calculateNewsImpact}
            />
            </div>

            {/* News Panel - Right Side */}
            <div className="col-span-3">
              <MarketNewsCard
                filteredAndSortedStocks={filteredAndSortedStocks}
                news={news}
                getLogoUrl={getLogoUrl}
                darkMode={darkMode}
                filterText={filterText}
                sectorFilter={sectorFilter}
              />
            </div>
          </div>

          <AddStockModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddStock={handleAddStockSubmit}
            darkMode={darkMode}
          />
          
          {/* Stock Removal Popup */}
          {showRemovePopup && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
        </div>
                <div>
                  <div className="font-semibold text-sm">Stock Removed</div>
                  <div className="text-xs opacity-90">{removedStockSymbol} has been removed from your portfolio</div>
                </div>
                <button 
                  onClick={() => setShowRemovePopup(false)}
                  className="ml-4 text-white hover:text-green-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 3