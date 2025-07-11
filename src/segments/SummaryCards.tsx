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
      {/* Total Value */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-start shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-semibold mb-1 opacity-80 text-slate-500 dark:text-slate-300">Total Value</span>
        <span className="text-lg font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Day's Gain/Loss */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-start shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-semibold mb-1 opacity-80 text-slate-500 dark:text-slate-300">Day's Gain/Loss</span>
        <span className={`text-lg font-bold ${totalDayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{totalDayChange >= 0 ? '+' : '-'}${Math.abs(totalDayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Total Gain/Loss */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-start shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-semibold mb-1 opacity-80 text-slate-500 dark:text-slate-300">Total Gain/Loss</span>
        <span className={`text-lg font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      {/* Active Positions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-start shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-semibold mb-1 opacity-80 text-slate-500 dark:text-slate-300">Active Positions</span>
        <span className="text-lg font-bold">{activePositions}</span>
      </div>
      {/* Portfolio Impact Card */}
      <div className="flex flex-col justify-center items-start px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-300 mb-1 tracking-widest uppercase">Net Portfolio Impact</span>
        <span className={`text-lg font-bold ${portfolioImpactLabel === 'Large' ? 'text-red-600 dark:text-red-400' : portfolioImpactLabel === 'Medium' ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'}`}>{portfolioImpactLabel}</span>
        <span className="text-xs text-slate-400 dark:text-slate-400 mt-1">(Based on news impact)</span>
      </div>
      {/* Sentiment Score Card */}
      <div className="flex flex-col justify-center items-start px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-700 shadow-md text-slate-900 dark:text-slate-100">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-300 mb-1 tracking-widest uppercase">Overall Sentiment Score</span>
        <span className="text-lg font-bold">{overallSentiment.sentiment}</span>
        <span className="text-xs text-slate-400 dark:text-slate-400 mt-1">Net Score: {overallSentiment.score.toFixed(2)}</span>
      </div>
    </div>
  </>
);

export default SummaryCards; 