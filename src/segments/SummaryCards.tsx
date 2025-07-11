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
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 mb-2 px-4">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-xl p-3 flex flex-col items-start shadow-lg text-white">
        <span className="text-xs font-semibold mb-1 opacity-90">Total Value</span>
        <span className="text-lg font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl p-3 flex flex-col items-start shadow-lg text-white">
        <span className="text-xs font-semibold mb-1 opacity-90">Day's Gain/Loss</span>
        <span className="text-lg font-bold">{totalDayChange >= 0 ? '+' : '-'}${Math.abs(totalDayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-3 flex flex-col items-start shadow-lg text-white">
        <span className="text-xs font-semibold mb-1 opacity-90">Total Gain/Loss</span>
        <span className="text-lg font-bold">{totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl p-3 flex flex-col items-start shadow-lg text-white">
        <span className="text-xs font-semibold mb-1 opacity-90">Active Positions</span>
        <span className="text-lg font-bold">{activePositions}</span>
      </div>
      {/* Portfolio Impact Card */}
      <div className="flex flex-col justify-center items-start px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-900 dark:to-indigo-800 shadow-lg border-2 border-purple-200 dark:border-purple-800 text-white">
        <span className="text-xs font-bold text-white/80 mb-1 tracking-widest uppercase">Net Portfolio Impact</span>
        <span className={`text-lg font-bold ${portfolioImpactLabel === 'Large' ? 'text-red-200' : portfolioImpactLabel === 'Medium' ? 'text-yellow-200' : 'text-green-200'}`}>{portfolioImpactLabel}</span>
        <span className="text-xs text-white/60 mt-1">(Based on news impact)</span>
      </div>
      {/* Sentiment Score Card */}
      <div className="flex flex-col justify-center items-start px-4 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-800 shadow-lg border-2 border-blue-200 dark:border-blue-700 text-white">
        <span className="text-xs font-bold text-white/80 mb-1 tracking-widest uppercase">Overall Sentiment Score</span>
        <span className="text-lg font-bold text-white">{overallSentiment.sentiment}</span>
        <span className="text-xs text-white/60 mt-1">Net Score: {overallSentiment.score.toFixed(2)}</span>
      </div>
    </div>
  </>
);

export default SummaryCards; 