import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StockItemProps {
  symbol: string;
  name: string;
  shares?: number;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: string;
  onClick?: () => void;
}

export default function StockItem({ 
  symbol, 
  name, 
  shares = 0, 
  price, 
  change, 
  changePercent, 
  volume,
  marketCap,
  onClick
}: StockItemProps) {
  const isPositive = change >= 0;
  
  const getLogoColor = (symbol: string) => {
    const colors: Record<string, string> = {
      // Tech Giants
      'AAPL': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'MSFT': 'bg-gradient-to-r from-green-500 to-green-600',
      'GOOGL': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'AMZN': 'bg-gradient-to-r from-orange-500 to-orange-600',
      'META': 'bg-gradient-to-r from-blue-600 to-purple-600',
      'NFLX': 'bg-gradient-to-r from-red-500 to-red-600',
      
      // AI & Semiconductors
      'NVDA': 'bg-gradient-to-r from-green-600 to-green-700',
      'AMD': 'bg-gradient-to-r from-red-600 to-red-700',
      'INTC': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'TSM': 'bg-gradient-to-r from-purple-600 to-purple-700',
      'AVGO': 'bg-gradient-to-r from-indigo-600 to-indigo-700',
      
      // Electric Vehicles & Energy
      'TSLA': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'NIO': 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      'RIVN': 'bg-gradient-to-r from-teal-500 to-teal-600',
      'F': 'bg-gradient-to-r from-blue-700 to-blue-800',
      'GM': 'bg-gradient-to-r from-gray-600 to-gray-700',
      
      // Finance & Banking
      'JPM': 'bg-gradient-to-r from-blue-800 to-blue-900',
      'BAC': 'bg-gradient-to-r from-red-700 to-red-800',
      'WFC': 'bg-gradient-to-r from-yellow-600 to-yellow-700',
      'GS': 'bg-gradient-to-r from-blue-900 to-indigo-900',
      'MS': 'bg-gradient-to-r from-blue-700 to-blue-800',
      
      // Healthcare & Biotech
      'JNJ': 'bg-gradient-to-r from-red-600 to-red-700',
      'PFE': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'UNH': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'ABBV': 'bg-gradient-to-r from-purple-700 to-purple-800',
      'MRK': 'bg-gradient-to-r from-blue-700 to-blue-800',
      
      // Consumer & Retail
      'WMT': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'HD': 'bg-gradient-to-r from-orange-600 to-orange-700',
      'PG': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'KO': 'bg-gradient-to-r from-red-600 to-red-700',
      'PEP': 'bg-gradient-to-r from-blue-600 to-blue-700',
      
      // Communication & Media
      'DIS': 'bg-gradient-to-r from-blue-600 to-purple-600',
      'CMCSA': 'bg-gradient-to-r from-purple-600 to-purple-700',
      'VZ': 'bg-gradient-to-r from-red-600 to-red-700',
      'T': 'bg-gradient-to-r from-blue-600 to-blue-700',
      
      // Industrial & Aerospace
      'BA': 'bg-gradient-to-r from-blue-700 to-blue-800',
      'CAT': 'bg-gradient-to-r from-yellow-600 to-yellow-700',
      'GE': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'LMT': 'bg-gradient-to-r from-blue-800 to-blue-900',
      
      // Energy & Oil
      'XOM': 'bg-gradient-to-r from-blue-700 to-blue-800',
      'CVX': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'COP': 'bg-gradient-to-r from-red-600 to-red-700',
      
      // Real Estate & REITs
      'AMT': 'bg-gradient-to-r from-red-600 to-red-700',
      'PLD': 'bg-gradient-to-r from-blue-600 to-blue-700',
      
      // Crypto & Fintech
      'COIN': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'SQ': 'bg-gradient-to-r from-green-600 to-green-700',
      'PYPL': 'bg-gradient-to-r from-blue-600 to-blue-700'
    };
    return colors[symbol] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const formatVolume = (vol?: number) => {
    if (!vol) return '';
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  const totalValue = shares > 0 ? shares * price : 0;

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getLogoColor(symbol)} shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
          {symbol.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-lg">{name}</div>
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-300">
            <span className="font-medium">{symbol}</span>
            {shares > 0 && <span>• {shares} shares</span>}
            {volume && (
              <span className="flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Vol: {formatVolume(volume)}
              </span>
            )}
            {marketCap && <span>• {marketCap}</span>}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-gray-900 dark:text-white text-lg">${price.toFixed(2)}</div>
        <div className={`flex items-center justify-end space-x-1 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
        {shares > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Total: ${totalValue.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}