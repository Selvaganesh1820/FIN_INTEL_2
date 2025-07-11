import React from 'react';

interface SummaryCardsProps {
  totalValue: number;
  totalDayChange: number;
  totalGainLoss: number;
  activePositions: number;
  darkMode: boolean;
  portfolioImpactLabel: string;
  overallSentiment: { sentiment: string; score: number };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  totalValue, 
  totalDayChange, 
  totalGainLoss, 
  activePositions, 
  darkMode,
  portfolioImpactLabel,
  overallSentiment
}) => (
  <>
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 mb-2 px-4">
      {/* Total Value */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 rounded-2xl p-4 flex flex-col items-start shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-semibold mb-1 opacity-90 text-white/80">Total Value</span>
        <span className="text-xl font-extrabold drop-shadow-lg">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Day's Gain/Loss */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 rounded-2xl p-4 flex flex-col items-start shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-semibold mb-1 opacity-90 text-white/80">Day's Gain/Loss</span>
        <span className={`text-xl font-extrabold drop-shadow-lg ${totalDayChange >= 0 ? 'text-white' : 'text-red-200'}`}>{totalDayChange >= 0 ? '+' : '-'}${Math.abs(totalDayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Total Gain/Loss */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 rounded-2xl p-4 flex flex-col items-start shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-semibold mb-1 opacity-90 text-white/80">Total Gain/Loss</span>
        <span className={`text-xl font-extrabold drop-shadow-lg ${totalGainLoss >= 0 ? 'text-white' : 'text-red-200'}`}>{totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Active Positions */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 rounded-2xl p-4 flex flex-col items-start shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-semibold mb-1 opacity-90 text-white/80">Active Positions</span>
        <span className="text-xl font-extrabold drop-shadow-lg">{activePositions}</span>
      </div>
      {/* Portfolio Impact Card */}
      <div className="flex flex-col justify-center items-start px-4 py-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-bold text-white/80 mb-1 tracking-widest uppercase">Net Portfolio Impact</span>
        <span className={`text-xl font-extrabold drop-shadow-lg ${portfolioImpactLabel === 'Large' ? 'text-red-200' : portfolioImpactLabel === 'Medium' ? 'text-yellow-200' : 'text-green-100'}`}>{portfolioImpactLabel}</span>
        <span className="text-xs text-white/60 mt-1">(Based on news impact)</span>
      </div>
      {/* Sentiment Score Card */}
      <div className="flex flex-col justify-center items-start px-4 py-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 border-0 shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/40 text-white relative overflow-hidden">
        <span className="text-xs font-bold text-white/80 mb-1 tracking-widest uppercase">Overall Sentiment Score</span>
        <span className="text-xl font-extrabold drop-shadow-lg">{overallSentiment.sentiment}</span>
        <span className="text-xs text-white/60 mt-1">Net Score: {overallSentiment.score.toFixed(2)}</span>
      </div>
    </div>
  </>
);

export default SummaryCards; 