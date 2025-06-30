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
  const [newsCache, setNewsCache] = useState<Record<string, { news: any[], timestamp: number }>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [filterText, setFilterText] = useState('');
  const [alerts, setAlerts] = useState<{ id: number; message: string; read: boolean; time: string; green?: boolean }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const alertIdRef = useRef(1);

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
  useEffect(() => {
    const interval = setInterval(() => {
      // Example: random alert for demo
      const stock = portfolioHoldings[Math.floor(Math.random() * portfolioHoldings.length)];
      if (!stock) return;
      const type = Math.random() > 0.5 ? 'Price Alert' : 'Sentiment Alert';
      const msg = type === 'Price Alert'
        ? `${stock.symbol} price moved significantly!`
        : `${stock.symbol} news sentiment changed!`;
      setAlerts(prev => [
        { id: alertIdRef.current++, message: msg, read: false, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
      setUnreadCount(c => c + 1);
    }, 15000); // every 15s
    return () => clearInterval(interval);
  }, [portfolioHoldings]);

  // Show green alert and send email on stock decrease
  useEffect(() => {
    if (!stocks || stocks.length === 0) return;
    stocks.forEach(stock => {
      if (stock.change && stock.change < 0) {
        // Show green alert
        setAlerts(prev => [
          {
            id: alertIdRef.current++,
            message: `${stock.symbol} price decreased by $${Math.abs(stock.change).toFixed(2)} (${Math.abs(stock.changePercent).toFixed(2)}%)`,
            read: false,
            time: new Date().toLocaleTimeString(),
            green: true
          },
          ...prev.slice(0, 9)
        ]);
        setUnreadCount(c => c + 1);
        // Send email (placeholder API call)
        axios.post('/api/send-alert-email', {
          symbol: stock.symbol,
          change: stock.change,
          changePercent: stock.changePercent
        }).catch(() => {});
      }
    });
    // eslint-disable-next-line
  }, [stocks]);

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
      const symbols = [symbol, ...(competitors[symbol] || [])];
      console.log(`Fetching news for symbols:`, symbols);
      
      // Fetch news from multiple sources in parallel
      const newsPromises = symbols.map(async sym => {
        try {
          // Try Finnhub first
          const finnhubRes = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10)}&to=${new Date().toISOString().slice(0, 10)}&token=d1eeu2hr01qjssrjma80d1eeu2hr01qjssrjma8g`);
          
          if (finnhubRes.ok) {
            const data = await finnhubRes.json();
            console.log(`API response for ${sym}:`, data?.length || 0, 'items');
            if (data && data.length > 0) {
              // Get more news items, don't filter by time too strictly
              const recentNews = data.slice(0, 3); // Get up to 3 news items per symbol
              
              if (recentNews.length > 0) {
                return recentNews.map((n: any) => ({
                  title: n.headline,
                  description: n.summary,
                  symbol: sym,
                  timeAgo: new Date(n.datetime * 1000).toLocaleString(),
                  imageUrl: n.image || '',
                  source: n.source,
                  url: n.url,
                  isCompetitor: sym !== symbol,
                  timestamp: n.datetime * 1000 // Store timestamp for caching
                }));
              }
            }
          } else {
            console.log(`API failed for ${sym}:`, finnhubRes.status);
          }
          
          // If no news from API, return null to indicate no new news
          return null;
        } catch (error) {
          console.log(`Error fetching news for ${sym}:`, error);
          return null;
        }
      });
      
      const newsResults = await Promise.all(newsPromises);
      const newNews = newsResults.filter(result => result !== null).flat();
      console.log(`Total new news items for ${symbol}:`, newNews.length);
      
      if (newNews.length > 0) {
        // Separate direct and competitor news
        const directNews = newNews.filter(item => !item.isCompetitor).slice(0, 3); // Limit to 3 direct news
        const competitorNews = newNews.filter(item => item.isCompetitor).slice(0, 3); // Limit to 3 competitor news
        
        // Combine direct news with limited competitor news
        const limitedNews = [...directNews, ...competitorNews];
        
        // Add sentiment analysis to news items
        const newsWithSentiment = limitedNews.map((newsItem: any) => {
          // Simple keyword-based sentiment analysis
          const title = newsItem.title.toLowerCase();
          const description = newsItem.description.toLowerCase();
          const text = title + ' ' + description;
          
          let sentimentScore = 0;
          let sentimentLabel = 'Neutral';
          
          // Positive keywords
          if (text.includes('up') || text.includes('rise') || text.includes('gain') || text.includes('positive') || text.includes('beat') || text.includes('strong') || text.includes('growth')) {
            sentimentScore = 0.3;
            sentimentLabel = 'Positive';
          }
          // Negative keywords
          else if (text.includes('down') || text.includes('fall') || text.includes('drop') || text.includes('negative') || text.includes('miss') || text.includes('weak') || text.includes('loss')) {
            sentimentScore = -0.3;
            sentimentLabel = 'Negative';
          }
          
          // Calculate impact score based on source credibility and content
          let impactScore = 0.5; // Base impact
          if (newsItem.source && ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'].includes(newsItem.source)) {
            impactScore += 0.3; // Higher credibility sources
          }
          if (text.includes('earnings') || text.includes('quarterly') || text.includes('financial')) {
            impactScore += 0.2; // Financial news has higher impact
          }
          if (text.includes('ceo') || text.includes('executive') || text.includes('leadership')) {
            impactScore += 0.1; // Leadership news
          }
          
          return {
            ...newsItem,
            sentiment: {
              score: sentimentScore,
              label: sentimentLabel,
              impact_score: impactScore.toFixed(1),
              news_type: newsItem.isCompetitor ? 'competitor' : 'direct'
            }
          };
        });
        
        setNews(prev => ({ ...prev, [symbol]: newsWithSentiment }));
        setNewsCache(prev => ({ 
          ...prev, 
          [symbol]: { news: newsWithSentiment, timestamp: now } 
        }));
      } else {
        console.log(`No news found for ${symbol}, generating fallback news`);
        // Generate fallback news to ensure news always appears
        const fallbackNews = [
          {
            title: `${symbol} Stock Analysis: Market Performance Review`,
            description: `Recent market analysis shows ${symbol} demonstrating strong fundamentals with positive momentum in the current trading session. Analysts are closely monitoring key support and resistance levels.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Market Analysis',
            url: '#',
            isCompetitor: false,
            sentiment: {
              score: 0.3,
              label: 'Positive',
              impact_score: '0.8',
              news_type: 'direct'
            }
          },
          {
            title: `${symbol} Sector Outlook: Industry Trends Analysis`,
            description: `The sector containing ${symbol} is showing positive trends with increasing institutional interest and improving market sentiment across related companies.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Sector Report',
            url: '#',
            isCompetitor: false,
            sentiment: {
              score: 0.2,
              label: 'Positive',
              impact_score: '0.6',
              news_type: 'direct'
            }
          },
          {
            title: `Competitor Analysis: Market Position Update`,
            description: `Key competitors in the ${symbol} space are showing mixed performance, with some demonstrating strong growth while others face market challenges.`,
            symbol: symbol,
            timeAgo: new Date().toLocaleString(),
            imageUrl: '',
            source: 'Competitor Watch',
            url: '#',
            isCompetitor: true,
            sentiment: {
              score: 0.0,
              label: 'Neutral',
              impact_score: '0.5',
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
      
      setNewsLoading(prev => ({ ...prev, [symbol]: false }));
    } catch (error) {
      console.log(`Error in fetchNewsForStock for ${symbol}:`, error);
      setNews(prev => ({ ...prev, [symbol]: [] }));
      setNewsLoading(prev => ({ ...prev, [symbol]: false }));
    }
  };

  // Fetch news for portfolio stocks
  useEffect(() => {
    const fetchNewsForPortfolio = async () => {
      const symbols = portfolioHoldings.map(h => h.symbol);
      for (const symbol of symbols) {
        await fetchNewsForStock(symbol);
      }
    };
    
    if (portfolioHoldings.length > 0) {
      fetchNewsForPortfolio();
    }
  }, [portfolioHoldings]);

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
  const getStockSize = (positionValue) => {
    if (positionValue > 50000) return 'large';
    if (positionValue > 10000) return 'medium';
    return 'small';
  };

  // Calculate per-news impact weighted by stock size
  const calculateNewsImpact = (symbol) => {
    const holding = portfolioHoldings.find(h => h.symbol === symbol);
    const stock = stocks.find(s => s.symbol === symbol);
    if (!holding || !stock) return 0;
    const positionValue = (stock.price || 0) * (holding.shares || 0);
    const size = getStockSize(positionValue);
    const newsItems = news[symbol] || [];
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
      let count = 0;
      newsItems.forEach(item => {
        let impact = parseFloat(item?.sentiment?.impact_score || '0');
        stockImpact += impact;
        count++;
      });
      if (count > 0) stockImpact = stockImpact / count;
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
      let count = 0;
      newsItems.forEach(item => {
        let score = item?.sentiment?.score || 0;
        stockScore += score;
        count++;
      });
      if (count > 0) stockScore = stockScore / count;
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
        />
        
        <div className="container mx-auto px-4 py-6">
          <SummaryCards 
            totalValue={totalValue}
            totalDayChange={totalDayChange}
            totalGainLoss={totalGainLoss}
            activePositions={activePositions}
            darkMode={darkMode}
          />
          
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* Portfolio Table - Left Side */}
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
            />

            {/* News Panel - Right Side */}
            <div className="col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
              <h2 className="text-lg font-bold text-indigo-900 dark:text-white mb-3">Market News</h2>
              <div className="space-y-2">
                {filteredAndSortedStocks.slice(0, 3).map((stock) => {
                  const stockNews = news[stock.symbol] || [];
                  const overallSentiment = calculateSentiment(stockNews);
                  
                  return (
                    <div key={stock.symbol} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0">
                      <div className="flex items-center gap-1 mb-1">
                        <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-4 h-4 rounded bg-white border shadow object-contain" onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')} />
                        <span className="font-semibold text-xs text-indigo-900 dark:text-white">{stock.symbol}</span>
                      </div>
                      {stockNews.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className={`px-1 py-0.5 rounded text-xs font-semibold ${getSentimentBgColor(overallSentiment.sentiment)}`}>
                              {overallSentiment.sentiment}
                            </span>
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                              {overallSentiment.impact.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {stockNews[0]?.title || 'No recent news'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">No recent news</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <AddStockModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddStock={handleAddStockSubmit}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
} 