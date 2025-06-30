import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Search, Bell, User, RefreshCw, Moon, Sun } from 'lucide-react';
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
  green?: boolean;
}

interface HeaderProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  searchResults?: SearchResult[];
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
  alerts: { id: number; message: string; read: boolean; time: string; green?: boolean }[];
  unreadCount: number;
  onBellClick: () => void;
  showDropdown: boolean;
  onDropdownClose: () => void;
}

export default function Header({ 
  onSearch, 
  onRefresh, 
  searchResults = [], 
  isRefreshing = false,
  lastUpdated,
  alerts,
  unreadCount,
  onBellClick,
  showDropdown,
  onDropdownClose
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
    // For now, just log the selection - could be used to add stock to portfolio
    console.log(`Selected stock: ${symbol}`);
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
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-purple-100 dark:hover:bg-gray-800 transition-colors"
              onClick={onBellClick}
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6 text-indigo-900 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-indigo-900 dark:text-white">Notifications</span>
                  <button className="text-xs text-gray-500 hover:text-indigo-700 dark:hover:text-indigo-300" onClick={onDropdownClose}>Close</button>
                </div>
                <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {alerts.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-400">No alerts</li>
                  ) : (
                    alerts.map(alert => (
                      <li key={alert.id} className={`px-4 py-3 text-sm ${alert.green ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200 font-bold border border-green-300 dark:border-green-700' : alert.read ? 'text-gray-400' : 'text-indigo-900 dark:text-white font-semibold'}`}>
                        <div className="flex justify-between items-center">
                          <span>{alert.message}</span>
                          <span className="text-xs text-gray-400 ml-2">{alert.time}</span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}