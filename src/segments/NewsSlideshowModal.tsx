import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, TrendingUp } from 'lucide-react';

interface NewsSlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: string;
  stockName: string;
  news: any[];
  newsLoading: boolean;
  getSentimentBgColor: (sentiment: string) => string;
  getLogoUrl: (symbol: string) => string;
  darkMode: boolean;
}

const NewsSlideshowModal: React.FC<NewsSlideshowModalProps> = ({
  isOpen,
  onClose,
  stockSymbol,
  stockName,
  news,
  newsLoading,
  getSentimentBgColor,
  getLogoUrl,
  darkMode
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen, stockSymbol]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src={getLogoUrl(stockSymbol)} alt={stockSymbol} className="w-10 h-10 rounded bg-white border shadow object-contain" onError={e => (e.currentTarget.src = 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600')} />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{stockSymbol} News & Market Intelligence</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stockName} • {news.length} articles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {newsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading news...</span>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">No news available</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">Check back later for updates</div>
            </div>
          ) : (
            <div className="relative">
              {/* Main News Display */}
              <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 min-h-[500px]">
                {/* Navigation Arrows */}
                {news.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors z-10"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors z-10"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Current News Item */}
                <div className="text-center max-w-4xl mx-auto">
                  {/* News Source and Meta */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {news[currentSlide]?.source || 'Market News'}
                      </span>
                      {news[currentSlide]?.isCompetitor && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full text-xs font-semibold">
                          Competitor News
                        </span>
                      )}
                      {!news[currentSlide]?.isCompetitor && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Direct News
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {news[currentSlide]?.timeAgo}
                    </div>
                  </div>

                  {/* News Title */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                    {news[currentSlide]?.title}
                  </h3>

                  {/* News Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                    {news[currentSlide]?.description}
                  </p>

                  {/* Sentiment and Impact */}
                  {news[currentSlide]?.sentiment && (
                    <div className="flex items-center justify-center gap-6 mb-8">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSentimentBgColor(news[currentSlide].sentiment.label)}`}>
                          {news[currentSlide].sentiment.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">Impact:</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded">
                          {news[currentSlide].sentiment.impact_score || '0.0'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Read Full Article Link */}
                  {news[currentSlide]?.url && (
                    <div className="flex justify-center">
                      <a
                        href={news[currentSlide].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Read Full Article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Indicators */}
              {news.length > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {news.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-4 h-4 rounded-full transition-colors ${
                        index === currentSlide
                          ? 'bg-purple-600 dark:bg-purple-400'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Slide Counter and Navigation Info */}
              {news.length > 1 && (
                <div className="text-center mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {currentSlide + 1} of {news.length}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Use arrow keys or click dots to navigate • {news.filter(n => !n.isCompetitor).length} direct news • {news.filter(n => n.isCompetitor).length} competitor news
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsSlideshowModal; 