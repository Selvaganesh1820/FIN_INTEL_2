import React, { useState } from 'react';
import { Trash2, PlusCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import symbolToSector from '../utils/symbolToSector';

interface PortfolioTableProps {
  filteredAndSortedStocks: any[];
  portfolioHoldings: any[];
  news: Record<string, any[]>;
  newsLoading: Record<string, boolean>;
  handleAddStock: () => void;
  handleDeleteStock: (symbol: string) => void;
  handleViewNews: (symbol: string) => void;
  calculateVolatility: (stock: any) => string;
  calculateSentiment: (newsItems: any[]) => any;
  getSentimentBgColor: (sentiment: string) => string;
  getLogoUrl: (symbol: string) => string;
  sectorFilter: string;
  setSectorFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: 'symbol' | 'price' | 'change') => void;
  filterText: string;
  setFilterText: (val: string) => void;
  uniqueSectors: string[];
  darkMode: boolean;
  calculateGainLoss: (stock: any, shares: number) => { gainLoss: number; gainLossPercent: number };
  calculateWeightPercent: (stock: any, shares: number, totalPortfolioValue: number) => number;
  generate52WeekRange: (stock: any) => { low: number; high: number };
  totalPortfolioValue: number;
  calculateNewsImpact: (symbol: string) => number;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({
  filteredAndSortedStocks,
  portfolioHoldings,
  news,
  newsLoading,
  handleAddStock,
  handleDeleteStock,
  handleViewNews,
  calculateVolatility,
  calculateSentiment,
  getSentimentBgColor,
  getLogoUrl,
  sectorFilter,
  setSectorFilter,
  sortBy,
  setSortBy,
  filterText,
  setFilterText,
  uniqueSectors,
  darkMode,
  calculateGainLoss,
  calculateWeightPercent,
  generate52WeekRange,
  totalPortfolioValue,
  calculateNewsImpact
}) => {
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const handleRowClick = (symbol: string) => {
    if (expandedStock === symbol) {
      setExpandedStock(null);
    } else {
      setExpandedStock(symbol);
      handleViewNews(symbol);
    }
  };

  return (
    <div className="col-span-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-indigo-900 dark:text-white">Your Portfolio</h2>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-100 text-purple-800 rounded-lg shadow text-sm font-semibold hover:bg-purple-200 transition-colors" onClick={handleAddStock}>
            <PlusCircle className="w-4 h-4" /> Add Stock
          </button>
          <select className="px-3 md:px-4 py-2 rounded-lg border text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
            <option value="all">All Sectors</option>
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <select className="px-3 md:px-4 py-2 rounded-lg border text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors" value={sortBy} onChange={e => setSortBy(e.target.value as 'symbol' | 'price' | 'change')}>
            <option value="symbol">Symbol</option>
            <option value="price">Price</option>
            <option value="change">Change %</option>
          </select>
          <input type="text" className="px-3 md:px-4 py-2 rounded-lg border text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200 font-semibold placeholder-purple-600 dark:placeholder-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors" placeholder="Filter stocks..." value={filterText} onChange={e => setFilterText(e.target.value)} />
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-b-2 border-indigo-200 dark:border-gray-600">
              <th className="w-1/5 px-2 py-2 text-left text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Stock</th>
              <th className="w-1/12 px-1 py-2 text-right text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Price</th>
              <th className="w-1/12 px-1 py-2 text-right text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Change</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Impact</th>
              <th className="w-1/12 px-1 py-2 text-right text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Today%</th>
              <th className="w-1/12 px-1 py-2 text-right text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Total%</th>
              <th className="w-1/15 px-1 py-2 text-right text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Value</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Weight%</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">52Week</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Volatility</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-indigo-200 dark:border-gray-600">Sentiment</th>
              <th className="w-1/12 px-1 py-2 text-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedStocks.map((stock, index) => {
              const holding = portfolioHoldings.find(h => h.symbol === stock.symbol);
              const positionValue = (stock.price || 0) * (holding?.shares || 0);
              const changePositive = (stock.change || 0) >= 0;
              const volatility = calculateVolatility(stock);
              const stockNews = news[stock.symbol] || [];
              const overallSentiment = calculateSentiment(stockNews);
              const isExpanded = expandedStock === stock.symbol;
              
              // Calculate new analyst fields
              const gainLossData = calculateGainLoss(stock, holding?.shares || 0);
              const weightPercent = calculateWeightPercent(stock, holding?.shares || 0, totalPortfolioValue);
              const weekRange52 = generate52WeekRange(stock);
              
              // Calculate today's gain %
              const todaysGainPercent = stock.changePercent || 0;
              
              // Calculate overall gain %
              const currentPrice = stock.price || 0;
              const mockPurchasePrice = currentPrice - (stock.change || 0) * 10;
              const overallGainPercent = mockPurchasePrice > 0 ? ((currentPrice - mockPurchasePrice) / mockPurchasePrice) * 100 : 0;
              
              // Calculate product: change × today's gain % × shares
              const shares = holding?.shares || 0;
              const changeGainShares = (stock.change || 0) * (todaysGainPercent || 0) * shares;
              let changeGainSharesLabel = 'Small';
              if (changeGainShares > 20) changeGainSharesLabel = 'Large';
              else if (changeGainShares > 8) changeGainSharesLabel = 'Medium';
              
              // Mock sparkline data
              const sparkData = Array.from({ length: 12 }, () => (stock.price || 0) * (0.95 + Math.random() * 0.1));
              
              return (
                <React.Fragment key={stock.symbol}>
                  <tr 
                    className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 cursor-pointer group border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} dark:bg-gray-800`}
                    onClick={() => handleRowClick(stock.symbol)}
                  >
                    <td className="px-2 py-2 font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-6 h-6 rounded bg-white border border-gray-200 dark:border-gray-600 shadow-sm object-contain" onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{stock.symbol}</div>
                          <div className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">{stock.name}</div>
                          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Shares: {shares}</div>
                          {/* Sector display */}
                          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">Sector: {symbolToSector[stock.symbol] || 'Other'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">${(stock.price || 0).toFixed(2)}</td>
                    <td className="px-1 py-2 text-right font-mono text-xs font-semibold border-r border-gray-200 dark:border-gray-600">
                      <span className={`text-xs ${changePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {changePositive ? '+' : '-'}${Math.abs(stock.change || 0).toFixed(2)} ({changePositive ? '+' : '-'}{Math.abs(stock.changePercent || 0).toFixed(2)}%)
                      </span>
                    </td>
                    <td className="px-1 py-2 text-center border-r border-gray-200 dark:border-gray-600">
                      <span
                        className={`px-1 py-0.5 rounded text-xs font-bold ${
                          changeGainSharesLabel === 'Large'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
                            : changeGainSharesLabel === 'Medium'
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                            : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                        }`}
                      >
                        {changeGainSharesLabel}
                      </span>
                    </td>
                    <td className="px-1 py-2 text-right font-mono text-xs font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">{todaysGainPercent >= 0 ? '+' : '-'}{Math.abs(todaysGainPercent).toFixed(2)}%</td>
                    <td className="px-1 py-2 text-right font-mono text-xs font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">{overallGainPercent >= 0 ? '+' : '-'}{Math.abs(overallGainPercent).toFixed(2)}%</td>
                    <td className="px-1 py-2 text-right font-mono text-xs font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-1 py-2 text-center text-xs font-bold text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">{weightPercent.toFixed(1)}%</td>
                    <td className="px-1 py-2 text-center text-xs text-indigo-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">${weekRange52.high.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">${weekRange52.low.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-1 py-2 text-center border-r border-gray-200 dark:border-gray-600">
                      <span className={`px-1 py-0.5 rounded text-xs font-bold ${
                        volatility === 'High' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700' :
                        volatility === 'Medium' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700' :
                        'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                      }`}>
                        {volatility}
                      </span>
                    </td>
                    <td className="px-1 py-2 text-center border-r border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col items-center gap-1">
                        {/* Always show sentiment - use mock data when no news available */}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getSentimentBgColor(overallSentiment.sentiment)}`}>
                          {overallSentiment.sentiment}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">Impact:</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 px-1 py-1 rounded border border-purple-200 dark:border-purple-700">
                            {calculateNewsImpact(stock.symbol).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button 
                        className="text-purple-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-purple-100 px-3 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors border border-purple-200 dark:border-purple-700 font-bold text-xs"
                        title="Remove Stock" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStock(stock.symbol);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded News Section */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={12} className="bg-gradient-to-r from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 px-8 py-8 border-t-2 border-b-2 border-purple-200 dark:border-purple-700">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700">
                          <div className="p-4">
                            {newsLoading[stock.symbol] ? (
                              <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-4 text-gray-600 dark:text-gray-400 font-medium">Loading news for {stock.symbol}...</span>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                  {/* Show real news if available, otherwise show mock news */}
                                  {(stockNews.length > 0 ? stockNews : [
                                    {
                                      title: `${stock.symbol} Market Update: Strong Performance Continues`,
                                      description: `${stock.symbol} continues to show strong market performance with positive investor sentiment. Recent developments indicate favorable market conditions.`,
                                      source: 'MarketWatch',
                                      timeAgo: new Date().toLocaleString(),
                                      url: '#',
                                      isCompetitor: false,
                                      sentiment: {
                                        label: 'Positive',
                                        score: 0.6,
                                        impact_score: (Math.random() * 0.6 + 0.3).toFixed(1)
                                      }
                                    },
                                    {
                                      title: `${stock.symbol} Financial Results: Exceeding Expectations`,
                                      description: `${stock.symbol} reported quarterly results that exceeded analyst expectations, driving positive market sentiment and investor confidence.`,
                                      source: 'Reuters',
                                      timeAgo: new Date().toLocaleString(),
                                      url: '#',
                                      isCompetitor: false,
                                      sentiment: {
                                        label: 'Positive',
                                        score: 0.7,
                                        impact_score: (Math.random() * 0.6 + 0.4).toFixed(1)
                                      }
                                    },
                                    {
                                      title: `${stock.symbol} Industry Analysis: Competitive Position`,
                                      description: `Industry analysis shows ${stock.symbol} maintaining a strong competitive position in the market with positive growth prospects.`,
                                      source: 'Bloomberg',
                                      timeAgo: new Date().toLocaleString(),
                                      url: '#',
                                      isCompetitor: false,
                                      sentiment: {
                                        label: 'Neutral',
                                        score: 0.1,
                                        impact_score: (Math.random() * 0.4 + 0.2).toFixed(1)
                                      }
                                    }
                                                                     ]).map((newsItem, index) => (
                                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                                      {/* News Source and Meta */}
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {newsItem.source || 'Market News'}
                                          </span>
                                          {newsItem.isCompetitor && (
                                            <span className="px-1 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-700">
                                              Comp
                                            </span>
                                          )}
                                          {!newsItem.isCompetitor && (
                                            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-700">
                                              Direct
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {newsItem.timeAgo}
                                        </div>
                                      </div>

                                      {/* News Title */}
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                        {newsItem.title}
                                      </h4>

                                      {/* News Description */}
                                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
                                        {newsItem.description}
                                      </p>

                                      {/* Sentiment and Impact */}
                                      {newsItem.sentiment && (
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                            <span className={`px-1 py-0.5 rounded-full text-xs font-semibold ${getSentimentBgColor(newsItem.sentiment.label)}`}>
                                              {newsItem.sentiment.label}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Impact:</span>
                                            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20 px-1 py-0.5 rounded">
                                              {newsItem.sentiment.impact_score || '0.0'}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Read Full Article Link */}
                                      {newsItem.url && (
                                        <div className="flex justify-end">
                                          <a
                                            href={newsItem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
                                          >
                                            Read →
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable; 