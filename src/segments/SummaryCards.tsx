import React from 'react';

interface SummaryCardsProps {
  totalValue: number;
  totalDayChange: number;
  totalGainLoss: number;
  activePositions: number;
  darkMode: boolean;
}

// Placeholder for PortfolioValueChart
const PortfolioValueChart = () => (
  <div className="w-full mb-2 flex justify-center">
    {/* Chart will go here */}
    <div className="w-full max-w-2xl h-40 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center text-indigo-400 dark:text-indigo-200 text-sm font-semibold">
      Portfolio Value Chart (Loading...)
    </div>
  </div>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalValue, totalDayChange, totalGainLoss, activePositions, darkMode }) => (
  <>
    <PortfolioValueChart />
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-2 px-4">
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
    </div>
  </>
);

export default SummaryCards; 