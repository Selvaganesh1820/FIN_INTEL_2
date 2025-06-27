import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Search, Bell, User, RefreshCw, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchStockData } from '../services/stockApi';

interface SearchResult {
  symbol: string;
  name: string;
  price?: number;
  logo?: string;
}

interface NotificationItem {
  id: string;
  type: 'news' | 'price';
  symbol: string;
  title: string;
  message: string;
  url?: string;
  time: number;
}

interface HeaderProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  searchResults?: SearchResult[];
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

export default function Header({ 
  onSearch, 
  onRefresh, 
  searchResults = [], 
  isRefreshing = false,
  lastUpdated 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = React.useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [liveResults, setLiveResults] = useState<SearchResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (notifPermission === 'default') {
      Notification.requestPermission().then(setNotifPermission);
    }
  }, [notifPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate notification fetch (replace with real API if available)
      // setNotifications(...)
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length > 0);
    onSearch?.(query);
    if (query.length > 0) {
      setLoadingResults(true);
      try {
        const res = await import('../services/stockApi').then(m => m.searchStocks(query));
        // Optionally fetch price/logo for top 5 results
        const enriched = await Promise.all(res.slice(0, 5).map(async (item: SearchResult) => {
          try {
            const data = await fetchStockData(item.symbol);
            // Try to get logo from Finnhub profile
            const profile = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${item.symbol}&token=d1e3ff9r01qlt46scf40d1e3ff9r01qlt46scf4g`).then(r => r.json());
            return { ...item, price: data.price, logo: profile.logo };
          } catch {
            return item;
          }
        }));
        setLiveResults([...enriched, ...res.slice(5)]);
      } catch {
        setLiveResults([]);
      }
      setLoadingResults(false);
    } else {
      setLiveResults([]);
    }
  };

  const handleResultClick = (symbol: string) => {
    setSearchQuery(symbol);
    setShowResults(false);
    navigate(`/stock/${symbol}`);
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return `Last updated: ${date.toLocaleTimeString()}`;
  };

  const toggleDark = () => setIsDark(d => !d);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg shadow-sm">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">FIN-INTEL</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500">{formatLastUpdated(lastUpdated)}</p>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stocks (e.g., AAPL, Tesla)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto z-50">
                {loadingResults && (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">Searching...</div>
                )}
                {!loadingResults && liveResults.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">No results found</div>
                )}
                {liveResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleResultClick(result.symbol)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    {result.logo && (
                      <img src={result.logo} alt="logo" className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 object-contain" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{result.symbol}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{result.name}</div>
                    </div>
                    {result.price !== undefined && (
                      <div className="ml-auto font-semibold text-blue-600 dark:text-blue-400">${result.price.toFixed(2)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer shadow-sm">
            TS
          </div>
          
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}