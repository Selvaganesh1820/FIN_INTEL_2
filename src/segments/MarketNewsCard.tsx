import React from 'react';

interface MarketNewsCardProps {
  filteredAndSortedStocks: any[];
  news: Record<string, any[]>;
  getLogoUrl: (symbol: string) => string;
  darkMode: boolean;
  filterText: string;
  sectorFilter: string;
}

const MarketNewsCard: React.FC<MarketNewsCardProps> = ({ 
  filteredAndSortedStocks, 
  news, 
  getLogoUrl, 
  darkMode,
  filterText,
  sectorFilter
}) => (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 h-full">
      <h2 className="text-lg font-bold text-indigo-900 dark:text-white mb-3">Market News</h2>
      {/* Show news for currently visible stocks in portfolio */}
      {filteredAndSortedStocks.length > 0 ? (
        <div className="space-y-2 h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {filteredAndSortedStocks.map((stock, index) => (
          <div key={stock.symbol} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
              <img src={getLogoUrl(stock.symbol)} alt={stock.symbol} className="w-5 h-5 rounded bg-white border shadow object-contain" onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')} />
              <span className="font-semibold text-sm text-indigo-900 dark:text-white">{stock.symbol}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">• {stock.name}</span>
            </div>
            {news[stock.symbol] && news[stock.symbol].length > 0 ? (
              <div className="space-y-1">
                {news[stock.symbol].slice(0, 8).map((n, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{n.source}</span>
                      {n.isCompetitor && (
                        <span className="px-1 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-xs font-semibold">Comp</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{n.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{n.timeAgo}</span>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Read →</a>
                    </div>
                    {n.sentiment && (
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Sentiment:</span>
                        <span className={`px-1 py-0.5 rounded-full text-xs font-semibold ${
                          n.sentiment.score > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                          n.sentiment.score < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {n.sentiment.label} ({n.sentiment.score})
                        </span>
                        {n.sentiment.impact_score && (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">Impact: {n.sentiment.impact_score}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">MarketWatch</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{stock.symbol} Market Analysis: Latest Updates</h4>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date().toLocaleString()}</span>
                    <a href={`https://www.marketwatch.com/investing/stock/${stock.symbol.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Read →</a>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Sentiment:</span>
                    <span className="px-1 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      Neutral (0.0)
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">Impact: 0.5</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
        {filterText.trim() || sectorFilter !== 'all' ? 'No stocks match your current filters.' : 'No stocks in portfolio.'}
      </div>
    )}
  </div>
);

export default MarketNewsCard; 