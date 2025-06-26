import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';

interface NewsItemProps {
  title: string;
  description: string;
  symbol: string;
  timeAgo: string;
  imageUrl: string;
  source: string;
  url?: string;
}

export default function NewsItem({ 
  title, 
  description, 
  symbol, 
  timeAgo, 
  imageUrl, 
  source,
  url 
}: NewsItemProps) {
  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="News" 
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
        <div className="absolute top-2 left-2">
          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded shadow-sm">
            {symbol}
          </span>
        </div>
        {url && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 rounded">
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{source}</span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Click to read more</span>
          <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}