import axios from 'axios';

// Using Alpha Vantage API (free tier: 25 requests per day)
export const API_KEY = 'XE820FF3LWH9QI4E'; // Using demo key for development
const BASE_URL = 'https://www.alphavantage.co/query';

// Fallback to Finnhub API if Alpha Vantage fails
// const FINNHUB_API_KEY = 'd1e3ff9r01qlt46scf40d1e3ff9r01qlt46scf4g'; // Selva demo key
const FINNHUB_API_KEY = 'd1eeu2hr01qjssrjma80d1eeu2hr01qjssrjma8g'; // Tausi demo key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: string;
  metaError?: boolean;
}

export interface NewsItem {
  title: string;
  description: string;
  symbol: string;
  timeAgo: string;
  imageUrl: string;
  source: string;
  url?: string;
}

// Fetch real-time stock data
export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Try Alpha Vantage first
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: API_KEY
      },
      timeout: 5000
    });

    const quote = response.data['Global Quote'];
    if (quote && quote['01. symbol']) {
      return {
        symbol: quote['01. symbol'],
        name: quote['01. symbol'], // No company name in this endpoint, fallback to symbol
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume'])
      };
    }
    throw new Error('Invalid API response');
  } catch (error) {
    // Try Finnhub as secondary fallback
    try {
      const finnhubResponse = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: symbol,
          token: FINNHUB_API_KEY
        },
        timeout: 5000
      });
      const profileResponse = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: {
          symbol: symbol,
          token: FINNHUB_API_KEY
        },
        timeout: 5000
      });
      const data = finnhubResponse.data;
      const profile = profileResponse.data;
      if (data && typeof data.c === 'number') {
        return {
          symbol: symbol,
          name: profile.name || symbol,
          price: data.c,
          change: data.d ?? (data.c - (data.pc || 0)),
          changePercent: data.dp ?? (((data.c - (data.pc || 0)) / (data.pc || 1)) * 100),
          volume: data.v,
          marketCap: profile.marketCapitalization ? profile.marketCapitalization.toString() : undefined
        };
      }
      throw new Error('Invalid Finnhub response');
    } catch (finnhubError) {
      console.error(`Failed to fetch data for symbol: ${symbol}`, finnhubError);
      // Return a placeholder with meta error
      return {
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: undefined,
        metaError: true
      } as any;
    }
  }
};

// Fetch multiple stocks
export const fetchMultipleStocks = async (symbols: string[]): Promise<StockData[]> => {
  const promises = symbols.map(symbol => fetchStockData(symbol));
  return Promise.all(promises);
};

// Search for stocks
export const searchStocks = async (query: string): Promise<StockData[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: API_KEY
      },
      timeout: 5000
    });

    const matches = response.data.bestMatches || [];
    if (matches.length > 0) {
      return matches.slice(0, 10).map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        price: 0,
        change: 0,
        changePercent: 0
      }));
    }
    throw new Error('No matches from Alpha Vantage');
  } catch (error) {
    // Try Finnhub as fallback
    try {
      const finnhubResponse = await axios.get(`${FINNHUB_BASE_URL}/search`, {
        params: {
          q: query,
          token: FINNHUB_API_KEY
        },
        timeout: 5000
      });
      const result = finnhubResponse.data.result || [];
      if (result.length > 0) {
        return result.slice(0, 10).map((item: any) => ({
          symbol: item.symbol,
          name: item.description,
          price: 0,
          change: 0,
          changePercent: 0
        }));
      }
      throw new Error('No matches from Finnhub');
    } catch (finnhubError) {
      throw new Error('Both APIs failed for search');
    }
  }
};

// Fetch market news
export const fetchMarketNews = async (): Promise<NewsItem[]> => {
  try {
    // Try to fetch real news from Alpha Vantage
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: 'AAPL,MSFT,GOOGL,TSLA,NVDA,JPM,AMD',
        apikey: API_KEY,
        limit: 10
      },
      timeout: 5000
    });

    const newsData = response.data.feed || [];
    if (newsData.length > 0) {
      return newsData.slice(0, 6).map((item: any) => ({
        title: item.title,
        description: item.summary.substring(0, 150) + '...',
        symbol: item.ticker_sentiment?.[0]?.ticker || 'MARKET',
        timeAgo: formatTimeAgo(item.time_published),
        imageUrl: item.banner_image || 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600',
        source: item.source,
        url: item.url
      }));
    }
    throw new Error('Invalid Alpha Vantage news response');
  } catch (error) {
    // Try Finnhub as secondary fallback
    try {
      const finnhubResponse = await axios.get(`${FINNHUB_BASE_URL}/news`, {
        params: {
          category: 'general',
          token: FINNHUB_API_KEY
        },
        timeout: 5000
      });
      const newsData = finnhubResponse.data || [];
      if (Array.isArray(newsData) && newsData.length > 0) {
        return newsData.slice(0, 6).map((item: any) => ({
          title: item.headline,
          description: (item.summary || '').substring(0, 150) + '...',
          symbol: item.related?.split(',')[0] || 'MARKET',
          timeAgo: formatTimeAgo(item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString()),
          imageUrl: item.image || 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600',
          source: item.source,
          url: item.url
        }));
      }
      throw new Error('Invalid Finnhub news response');
    } catch (finnhubError) {
      throw new Error('Both APIs failed for news');
    }
  }
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const publishTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - publishTime.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};