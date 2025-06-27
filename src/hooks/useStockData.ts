import { useState, useEffect, useCallback } from 'react';
import { fetchMultipleStocks, fetchMarketNews, searchStocks, StockData, NewsItem } from '../services/stockApi';

// Default list of popular stock symbols (demo-safe, reliable)
const DEFAULT_POPULAR_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'AMD'
];

export const useStockData = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStockData = useCallback(async (symbols?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Limit to first 25 symbols to avoid API rate limits
      const stockSymbols = (symbols || DEFAULT_POPULAR_SYMBOLS).slice(0, 25);
      const [stockData, newsData] = await Promise.all([
        fetchMultipleStocks(stockSymbols),
        fetchMarketNews()
      ]);
      
      setStocks(stockData);
      setNews(newsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load market data. Please try again.');
      console.error('Error loading stock data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    loadStockData();
  }, [loadStockData]);

  const searchForStocks = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      return await searchStocks(query);
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    loadStockData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadStockData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadStockData]);

  return {
    stocks,
    news,
    loading,
    error,
    lastUpdated,
    refreshData,
    searchForStocks,
    loadStockData
  };
};