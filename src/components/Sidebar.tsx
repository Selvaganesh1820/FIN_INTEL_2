import React from 'react';
import { TrendingUp, Bell, Star, BarChart2, Briefcase, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Portfolio', icon: Briefcase, to: '/' },
  { name: 'Market Stocks', icon: Globe, to: '/stocks' },
  { name: 'Alerts', icon: Bell, to: '/alerts' },
  { name: 'Watchlist', icon: Star, to: '/watchlist' },
  { name: 'Analytics', icon: BarChart2, to: '/analytics' },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-16 bg-gradient-to-b from-blue-100/80 via-white/90 to-blue-200/60 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-3 px-0 fixed top-0 left-0 z-40 shadow-md items-center font-sans">
      <div className="mb-6 flex items-center justify-center w-full">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg shadow-md">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-3 items-center w-full">
        {navItems.map(({ name, icon: Icon, to }) => (
          <NavLink
            key={name}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-11 h-11 rounded-lg text-base font-semibold transition-all duration-200 shadow-sm border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 hover:bg-blue-200/70 dark:hover:bg-gray-800/70 hover:shadow-lg ${isActive ? 'bg-blue-600/90 text-white shadow-lg border-blue-500 dark:bg-blue-700/90 dark:text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'}`
            }
            tabIndex={0}
            title={name}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="sr-only">{name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto text-[10px] text-gray-400 dark:text-gray-600 px-1 pt-6 pb-2 text-center w-full border-t border-gray-200 dark:border-gray-800">
        &copy; {new Date().getFullYear()}<br/>FIN-INTEL
      </div>
    </aside>
  );
} 