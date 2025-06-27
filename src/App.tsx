import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import StockItem from './components/StockItem';
import LoadingSpinner from './components/LoadingSpinner';
import { useStockData } from './hooks/useStockData';
// import { Wallet, TrendingUp, TrendingDown, Layers, Filter, ArrowUpDown, AlertCircle, Newspaper, CircleDot, PieChart, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'lucide-react';
import StockDetail from './components/StockDetail';
import Sidebar from './components/Sidebar';
// For icons
import { Wallet, TrendingUp, TrendingDown, Layers, Filter, ArrowUpDown, AlertCircle, Newspaper, CircleDot, Target, Bell, Star, PlusCircle, Trash2 } from 'lucide-react';
// For charts
import { PieChart, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Pie, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

// Reduced portfolio for testing (to avoid API rate limits)
const portfolioHoldings = [
  { symbol: 'AAPL', shares: 25 },
  { symbol: 'MSFT', shares: 15 },
  { symbol: 'GOOGL', shares: 8 },
  { symbol: 'TSLA', shares: 12 },
  { symbol: 'JPM', shares: 8 }
];

// Add sector mapping for portfolio symbols
const symbolToSector: Record<string, string> = {
  // Tech Giants
  AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology', AMZN: 'Consumer', META: 'Technology', NFLX: 'Entertainment',
  // AI & Semiconductors
  NVDA: 'Semiconductors', AMD: 'Semiconductors', INTC: 'Semiconductors', TSM: 'Semiconductors', AVGO: 'Semiconductors',
  // Electric Vehicles & Energy
  TSLA: 'Automotive', NIO: 'Automotive', RIVN: 'Automotive', F: 'Automotive', GM: 'Automotive',
  // Finance & Banking
  JPM: 'Finance', BAC: 'Finance', WFC: 'Finance', GS: 'Finance', MS: 'Finance',
  // Healthcare & Biotech
  JNJ: 'Healthcare', PFE: 'Healthcare', UNH: 'Healthcare', ABBV: 'Healthcare', MRK: 'Healthcare',
  // Consumer & Retail
  WMT: 'Retail', HD: 'Retail', PG: 'Consumer', KO: 'Consumer', PEP: 'Consumer',
  // Communication & Media
  DIS: 'Entertainment', CMCSA: 'Media', VZ: 'Telecom', T: 'Telecom',
  // Industrial & Aerospace
  BA: 'Aerospace', CAT: 'Industrial', GE: 'Industrial', LMT: 'Aerospace',
  // Energy & Oil
  XOM: 'Energy', CVX: 'Energy', COP: 'Energy',
  // Real Estate & REITs
  AMT: 'REIT', PLD: 'REIT',
  // Crypto & Fintech
  COIN: 'Fintech', SQ: 'Fintech', PYPL: 'Fintech',
};

// Helper to fetch logo from Finnhub
const getLogoUrl = (symbol: string) => `https://finnhub.io/api/logo?symbol=${symbol}`;

// Helper to mock volatility
const getVolatility = (symbol: string) => {
  const hash = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
  if (hash % 3 === 0) return 'High';
  if (hash % 3 === 1) return 'Medium';
  return 'Low';
};

function AlertsPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-green-600 dark:text-green-300 animate-pulse" />
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300">Alerts</h1>
        </div>
        <div className="grid gap-6">
          {[{
            type: 'News',
            message: 'Apple just released a new product!',
            time: '2m ago',
            icon: <Newspaper className="w-6 h-6 text-blue-500" />
          }, {
            type: 'Price',
            message: 'TSLA dropped 5%',
            time: '10m ago',
            icon: <TrendingDown className="w-6 h-6 text-red-500" />
          }].map((alert, i) => (
            <div key={i} className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5">
              <div>{alert.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">{alert.message}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.type} • {alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WatchlistPage() {
  const [watchlist, setWatchlist] = React.useState([
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.92, change: 1.2 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 456.12, change: -2.5 }
  ]);

  const handleRemoveWatch = (symbol: string) => {
    setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
  };
  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-8 h-8 text-purple-600 dark:text-purple-300 animate-bounce" />
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Watchlist</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 sm:p-4 md:p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Symbol</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Change</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {watchlist.map((stock, i) => (
                <tr key={i} className="hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <td className="px-2 sm:px-4 py-3 font-bold">{stock.symbol}</td>
                  <td className="px-2 sm:px-4 py-3">{stock.name}</td>
                  <td className="px-2 sm:px-4 py-3 text-right">${stock.price.toFixed(2)}</td>
                  <td className={`px-2 sm:px-4 py-3 text-center font-semibold ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{stock.change >= 0 ? '+' : ''}{stock.change}%</td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <button className="border border-blue-500 text-blue-600 bg-white dark:bg-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-base shadow-sm transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="Remove from Watchlist" onClick={() => handleRemoveWatch(stock.symbol)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  // Example pie chart data
  const data = [
    { name: 'Tech', value: 40 },
    { name: 'Finance', value: 20 },
    { name: 'Healthcare', value: 15 },
    { name: 'Energy', value: 25 },
  ];
  const COLORS = ['#2563eb', '#16a34a', '#f59e42', '#e11d48'];
  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BarChart2 className="w-8 h-8 text-indigo-600 dark:text-indigo-300 animate-spin" />
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Analytics</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Allocation</h2>
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-3">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-gray-900 dark:text-white font-medium">{entry.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PortfolioHolding = { symbol: string; shares: number };

function PortfolioPage({ portfolioHoldings, setPortfolioHoldings }: {
  portfolioHoldings: PortfolioHolding[];
  setPortfolioHoldings: React.Dispatch<React.SetStateAction<PortfolioHolding[]>>;
}) {
  const portfolioSymbols = portfolioHoldings.map((h: PortfolioHolding) => h.symbol);
  const { stocks, news, loading, error, lastUpdated, refreshData, searchForStocks, loadStockData } = useStockData();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers'>('all');
  const navigate = useNavigate();

  // On mount and on portfolioSymbols change, fetch data for all portfolio symbols
  useEffect(() => {
    loadStockData(portfolioSymbols);
    // eslint-disable-next-line
  }, [JSON.stringify(portfolioSymbols)]);

  // Update refresh button to reload all portfolio symbols
  const handleRefresh = () => {
    loadStockData(portfolioSymbols);
  };

  // Create a map for fast lookup
  const stockMap = useMemo(() => {
    const map = new Map();
    stocks.forEach(stock => map.set(stock.symbol, stock));
    return map;
  }, [stocks]);

  // Only show holdings with valid stock data
  const validHoldings = portfolioHoldings.filter((holding: PortfolioHolding) => {
    const stock = stockMap.get(holding.symbol);
    return stock && !stock.metaError;
  });

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    if (!stocks.length) return null;

    const portfolioStocks = stocks.filter(stock => 
      portfolioHoldings.some(holding => holding.symbol === stock.symbol)
    );

    let totalValue = 0;
    let totalDayChange = 0;
    let totalGainLoss = 0;

    portfolioStocks.forEach(stock => {
      const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
      if (holding) {
        const currentValue = stock.price * holding.shares;
        const dayChange = stock.change * holding.shares;
        
        totalValue += currentValue;
        totalDayChange += dayChange;
        
        // Mock calculation for total gain/loss (would need purchase price in real app)
        const mockPurchasePrice = stock.price - (stock.change * 10); // Simplified
        const totalGain = (stock.price - mockPurchasePrice) * holding.shares;
        totalGainLoss += totalGain;
      }
    });

    return {
      totalValue,
      totalDayChange,
      totalGainLoss,
      activePositions: portfolioStocks.length
    };
  }, [stocks]);

  // Filter and sort controls
  const [filterText, setFilterText] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  // Get unique sectors for filter dropdown
  const uniqueSectors = Array.from(new Set(portfolioHoldings.map((h: PortfolioHolding) => symbolToSector[h.symbol] || 'Other')));

  // Filtered and sorted stocks with sector and text filter
  const filteredAndSortedStocks = useMemo(() => {
    let filtered = [...stocks];
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(stock => symbolToSector[stock.symbol] === sectorFilter);
    }
    if (filterText.trim()) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(filterText.toLowerCase()) ||
        stock.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    // ... existing filterBy and sortBy logic ...
    if (filterBy === 'gainers') {
      filtered = filtered.filter(stock => stock.change > 0);
    } else if (filterBy === 'losers') {
      filtered = filtered.filter(stock => stock.change < 0);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });
    return filtered;
  }, [stocks, sortBy, filterBy, filterText, sectorFilter]);

  const handleSearch = async (query: string) => {
    if (query.length > 1) {
      const results = await searchForStocks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const statsData = portfolioStats ? [
    {
      title: 'Total Value',
      value: `$${portfolioStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      iconColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: "Day's Gain/Loss",
      value: `${portfolioStats.totalDayChange >= 0 ? '+' : ''}$${Math.abs(portfolioStats.totalDayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      changeType: portfolioStats.totalDayChange >= 0 ? 'positive' as const : 'negative' as const,
      icon: portfolioStats.totalDayChange >= 0 ? TrendingUp : TrendingDown,
      iconColor: portfolioStats.totalDayChange >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Total Gain/Loss',
      value: `${portfolioStats.totalGainLoss >= 0 ? '+' : ''}$${Math.abs(portfolioStats.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      changeType: portfolioStats.totalGainLoss >= 0 ? 'positive' as const : 'negative' as const,
      icon: portfolioStats.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      iconColor: portfolioStats.totalGainLoss >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Active Positions',
      value: portfolioStats.activePositions.toString(),
      icon: Layers,
      iconColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ] : [];

  // News relevant to portfolio stocks
  const relevantNews = news.filter(n => portfolioHoldings.some(h => h.symbol === n.symbol));
  const newsToShow = relevantNews.length > 0 ? relevantNews : news;

  // Simulate polling for notifications (for header/alerts page)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate notification fetch (replace with real API if available)
      // setNotifications(...)
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Analytics cards data (mocked for now)
  const analyticsCards = [
    { title: 'Portfolio Value', value: '$17.8K', sub: '$17,762.94', icon: Wallet, color: 'from-blue-500 to-blue-600', label: 'AUM' },
    { title: 'Daily P&L', value: '+1.69%', sub: '+$295.16', icon: TrendingUp, color: 'from-green-500 to-green-600', label: '' },
    { title: 'Total Return', value: '+1.7%', sub: '+$295.16', icon: Target, color: 'from-green-500 to-green-600', label: '' },
    { title: 'Positions', value: '5', sub: 'Active', icon: Layers, color: 'from-purple-500 to-purple-600', label: '' },
  ];

  const handleRemoveStock = (symbol: string) => {
    setPortfolioHoldings((prev: PortfolioHolding[]) => prev.filter(h => h.symbol !== symbol));
  };

  if (loading && !stocks.length) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
        <Sidebar />
        <div className="flex-1 pl-16">
          <Header />
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 pl-16">
        <Header 
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          searchResults={searchResults}
          isRefreshing={loading}
          lastUpdated={lastUpdated}
        />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {analyticsCards.map((card, i) => (
              <div key={i} className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 flex flex-col gap-2 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${card.color} shadow-md mb-2`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase flex items-center gap-2">{card.title} {card.label && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded ml-2">{card.label}</span>}</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{card.value}</div>
                <div className="text-sm text-gray-400 dark:text-gray-500">{card.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Portfolio Table */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">Portfolio Holdings</h2>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-semibold">{filteredAndSortedStocks.length} positions</span>
                </div>
                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Sector:</label>
                  <select
                    className="px-2 py-1 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                    value={sectorFilter}
                    onChange={e => setSectorFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    {uniqueSectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold ml-2">Sort by:</label>
                  <select
                    className="px-2 py-1 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'symbol' | 'price' | 'change')}
                  >
                    <option value="symbol">Symbol</option>
                    <option value="price">Price</option>
                    <option value="change">Change %</option>
                  </select>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Security</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Change</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Position Value</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Volatility</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredAndSortedStocks.map((stock, index) => {
                        const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
                        if (!holding) return null;
                        const positionValue = stock.price * holding.shares;
                        const changePositive = stock.change >= 0;
                        return (
                          <tr key={stock.symbol} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <td className="px-4 py-3 flex items-center gap-4 min-w-[220px]">
                              <img
                                src={`https://finnhub.io/api/logo?symbol=${stock.symbol}`}
                                alt={stock.symbol}
                                className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-900 object-contain border border-gray-200 dark:border-gray-700 shadow"
                                onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white text-base">{stock.symbol}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${symbolToSector[stock.symbol] === 'Technology' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : symbolToSector[stock.symbol] === 'Entertainment' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : symbolToSector[stock.symbol] === 'Automotive' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>{symbolToSector[stock.symbol] || 'Other'}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">{stock.name}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 font-sans">{holding.shares} shares</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-mono text-gray-900 dark:text-white">${stock.price.toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-mono font-semibold flex items-center gap-1 justify-end ${changePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{changePositive ? <>&#8593;</> : <>&#8595;</>}{Math.abs(stock.changePercent).toFixed(2)}% <span className="text-xs">({changePositive ? '+' : '-'}${Math.abs(stock.change).toFixed(2)})</span></span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-mono text-gray-900 dark:text-white">${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getVolatility(stock.symbol) === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : getVolatility(stock.symbol) === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'}`}>{getVolatility(stock.symbol)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <button
                                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-xs font-semibold transition-colors text-[12px]"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleRemoveStock(stock.symbol)}
                                  className="border border-red-500 text-red-600 bg-white dark:bg-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-[15px] shadow-sm transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-800 hover:text-white hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                                  title="Remove from Portfolio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Right: News Section */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Market Intelligence</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded text-xs font-semibold">{newsToShow.length} articles</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {loading && newsToShow.length === 0 ? (
                    <LoadingSpinner />
                  ) : newsToShow.length === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center">No news found.</div>
                  ) : (
                    newsToShow.map((n, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow flex flex-col gap-2 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{n.symbol}</span>
                          <span className="text-xs text-gray-400">{n.timeAgo}</span>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-2 font-sans">{n.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-sans">{n.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded text-xs font-semibold">{n.source}</span>
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline">Read</a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StockDetailWrapper() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Sidebar />
      <div className="flex-1 pl-16">
        <Header />
        <StockDetail />
      </div>
    </div>
  );
}

function MarketStocksPage({ addToPortfolio, portfolioHoldings }: {
  addToPortfolio: (symbol: string) => void;
  portfolioHoldings: PortfolioHolding[];
}) {
  const { stocks, loading, error, refreshData } = useStockData();
  const navigate = useNavigate();

  const handleAddToPortfolio = (symbol: string) => {
    addToPortfolio(symbol);
    setTimeout(() => navigate('/'), 500); // Navigate to portfolio after short delay
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-3"><TrendingUp className="w-7 h-7 animate-bounce" /> Market Stocks</h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          title="Refresh Stocks"
        >
          <ArrowUpDown className="w-4 h-4" /> Refresh
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 p-4">
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 text-center p-8">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Change</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Sector</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {stocks.filter(stock => !stock.metaError).map((stock, index) => {
                  const changePositive = stock.change >= 0;
                  return (
                    <tr key={stock.symbol} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <td className="px-4 py-3 flex items-center gap-4 min-w-[220px]">
                        <img
                          src={`https://finnhub.io/api/logo?symbol=${stock.symbol}`}
                          alt={stock.symbol}
                          className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-900 object-contain border border-gray-200 dark:border-gray-700 shadow"
                          onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-base">{stock.symbol}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">{stock.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-gray-900 dark:text-white">${stock.price.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-semibold flex items-center gap-1 justify-end ${changePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{changePositive ? <>&#8593;</> : <>&#8595;</>}{Math.abs(stock.changePercent).toFixed(2)}% <span className="text-xs">({changePositive ? '+' : '-'}${Math.abs(stock.change).toFixed(2)})</span></span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200`}>{symbolToSector[stock.symbol] || 'Other'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAddToPortfolio(stock.symbol)}
                          className="border border-blue-500 text-blue-600 bg-white dark:bg-gray-900 rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold shadow-sm transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 group"
                          title="Add to Portfolio"
                        >
                          <PlusCircle className="w-6 h-6 group-hover:text-white group-hover:stroke-2 transition-all duration-150" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-bold text-blue-700 dark:text-blue-300 mb-4">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Page not found.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go to Home</a>
    </div>
  );
}

function App() {
  // Portfolio holdings state, persisted to localStorage
  const [portfolioHoldings, setPortfolioHoldings] = React.useState(() => {
    const saved = localStorage.getItem('portfolioHoldings');
    return saved ? JSON.parse(saved) : [
      { symbol: 'AAPL', shares: 25 },
      { symbol: 'MSFT', shares: 15 },
      { symbol: 'GOOGL', shares: 8 },
      { symbol: 'TSLA', shares: 12 },
      { symbol: 'JPM', shares: 8 }
    ];
  });

  const [alertMsg, setAlertMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem('portfolioHoldings', JSON.stringify(portfolioHoldings));
  }, [portfolioHoldings]);

  // Handler to add a stock to portfolio
  const addToPortfolio = (symbol: string) => {
    setPortfolioHoldings((prev: PortfolioHolding[]): PortfolioHolding[] => {
      if (prev.some((h: PortfolioHolding) => h.symbol === symbol)) return prev; // Prevent duplicates
      setAlertMsg(`${symbol} added to portfolio!`);
      return [...prev, { symbol, shares: 1 }];
    });
  };

  React.useEffect(() => {
    if (alertMsg) {
      const timeout = setTimeout(() => setAlertMsg(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [alertMsg]);

  return (
    <>
      {alertMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-bounce">
          {alertMsg}
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortfolioPage portfolioHoldings={portfolioHoldings} setPortfolioHoldings={setPortfolioHoldings} />} />
          <Route path="/stock/:symbol" element={<StockDetailWrapper />} />
          <Route path="/stocks" element={<MarketStocksPage addToPortfolio={addToPortfolio} portfolioHoldings={portfolioHoldings} />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;