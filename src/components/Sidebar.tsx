import React from 'react';
import { Briefcase, TrendingUp, BarChart3, Settings, Home } from 'lucide-react';

interface SidebarProps {
  fixed?: boolean;
}

export default function Sidebar({ fixed = true }: SidebarProps) {
  return (
    <aside className={`h-screen w-20 bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col py-4 px-2 ${fixed ? 'fixed top-0 left-0 z-40' : ''} shadow-lg items-center font-sans`}>
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center w-full">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-4 items-center w-full">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <Home className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Dashboard</span>
        </div>
        
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <Briefcase className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Portfolio</span>
        </div>
        
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <BarChart3 className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Analytics</span>
        </div>
        
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <Settings className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Settings</span>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="mt-auto text-[10px] text-gray-500 dark:text-gray-400 px-1 pt-4 pb-2 text-center w-full border-t border-gray-200 dark:border-gray-700">
        <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">FIN-INTEL</div>
        <div className="text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
} 