import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, TrendingUp, DollarSign, Users, Zap, Filter, Star, TrendingDown } from 'lucide-react';
import { searchStocks } from '../services/stockApi';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (symbol: string, shares: number) => void;
  darkMode: boolean;
}

// Predefined popular stocks with categories
const POPULAR_STOCKS = {
  'Tech Giants': [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: '2.8T' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: '2.9T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: '1.8T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', marketCap: '1.6T' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', marketCap: '1.1T' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors', marketCap: '1.2T' },
  ],
  'Finance & Banking': [
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', marketCap: '520B' },
    { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Finance', marketCap: '280B' },
    { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Finance', marketCap: '180B' },
    { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Finance', marketCap: '120B' },
  ],
  'Healthcare & Pharma': [
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: '380B' },
    { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', marketCap: '160B' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', marketCap: '480B' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', marketCap: '280B' },
  ],
  'Consumer & Retail': [
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail', marketCap: '420B' },
    { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Retail', marketCap: '320B' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer', marketCap: '340B' },
    { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer', marketCap: '240B' },
  ],
  'Automotive & Energy': [
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', marketCap: '800B' },
    { symbol: 'F', name: 'Ford Motor Company', sector: 'Automotive', marketCap: '50B' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', marketCap: '420B' },
    { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: '300B' },
  ]
};

const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, onAddStock, darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [shares, setShares] = useState<number>(1);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Tech Giants');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchStocks(query);
        setSearchResults(results.slice(0, 6)); // Limit to 6 results for compact view
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleStockSelect = (stock: any) => {
    setSelectedStock(stock);
    setSearchQuery(stock.symbol);
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStock && shares > 0) {
      onAddStock(selectedStock.symbol, shares);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStock(null);
    setShares(1);
    setActiveCategory('Tech Giants');
    setSectorFilter('all');
    setShowFavorites(false);
    onClose();
  };

  const quickAddShares = (amount: number) => {
    setShares(prev => Math.max(1, prev + amount));
  };

  const getFilteredStocks = () => {
    let stocks = POPULAR_STOCKS[activeCategory as keyof typeof POPULAR_STOCKS];
    if (sectorFilter !== 'all') {
      stocks = stocks.filter(stock => stock.sector === sectorFilter);
    }
    return stocks;
  };

  const allSectors = Array.from(new Set(
    Object.values(POPULAR_STOCKS).flat().map(stock => stock.sector)
  ));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg max-h-[85vh] overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Stock</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Search and add to portfolio</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Compact Search Section */}
          <div className="mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm ${
                  darkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Compact Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleStockSelect(result)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      {result.symbol.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{result.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.name}</div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {result.sector || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Popular Stocks Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Popular Stocks</h3>
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-gray-400" />
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className={`text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Sectors</option>
                  {allSectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Compact Category Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {Object.keys(POPULAR_STOCKS).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Compact Stock Grid */}
            <div className="grid grid-cols-3 gap-2">
              {getFilteredStocks().map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedStock?.symbol === stock.symbol
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      {stock.symbol.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-xs">{stock.symbol}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.name}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{stock.marketCap}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Selected Stock & Shares */}
          {selectedStock && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {selectedStock.symbol.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedStock.symbol}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedStock.name}</p>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {selectedStock.marketCap}
                </div>
              </div>

              {/* Compact Shares Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Number of Shares
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm ${
                      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => quickAddShares(5)}
                      className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAddShares(10)}
                      className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAddShares(50)}
                      className="px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      +50
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedStock || shares <= 0}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              Add Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default AddStockModal; 