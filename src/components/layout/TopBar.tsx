import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  Clock,
  Filter,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    selectedCorridor,
    setSelectedCorridor,
    corridors,
    searchQuery,
    setSearchQuery,
    setIsOptimizationModalOpen,
    conflicts,
    toastMessage,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openConflictsCount = conflicts.filter((c) => c.status === 'Open').length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Toast Banner Overlay */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-b-md shadow-lg border border-slate-700 flex items-center gap-2 z-50 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left: Global Filters & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {/* Corridor Select Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 text-[11px]">Corridor:</span>
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
          >
            <option value="All">All Corridors (8)</option>
            {corridors.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.from}–{c.to})
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block ID, task (e.g. TRK-1042), asset, or corridor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications & Real-Time Clock */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-slate-600 text-xs font-mono border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-800">{currentTime || '00:00:00'}</span>
          <span className="text-[10px] text-slate-400">IST</span>
        </div>

        {/* Quick Conflict Notification */}
        <div className="relative">
          <button
            title="Active System Alerts"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {openConflictsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            )}
            {openConflictsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>
        </div>

        {/* Generate AI Plan Action Button */}
        <button
          onClick={() => setIsOptimizationModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-md shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Generate AI Plan</span>
        </button>
      </div>
    </header>
  );
};
