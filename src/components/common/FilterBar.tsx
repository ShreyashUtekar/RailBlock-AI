import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FilterBarProps {
  showDepartmentFilter?: boolean;
  showCriticalityFilter?: boolean;
  showDateFilter?: boolean;
  extraFilters?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showDepartmentFilter = true,
  showCriticalityFilter = true,
  showDateFilter = true,
  extraFilters,
}) => {
  const {
    selectedCorridor,
    setSelectedCorridor,
    corridors,
    selectedDepartment,
    setSelectedDepartment,
    selectedCriticality,
    setSelectedCriticality,
    selectedDate,
    setSelectedDate,
  } = useApp();

  const handleReset = () => {
    setSelectedCorridor('All');
    setSelectedDepartment('All');
    setSelectedCriticality('All');
    setSelectedDate('2026-09-02');
  };

  const isFiltered =
    selectedCorridor !== 'All' ||
    selectedDepartment !== 'All' ||
    selectedCriticality !== 'All' ||
    selectedDate !== '2026-09-02';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 pr-2 border-r border-slate-200">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter Data:</span>
        </div>

        {/* Corridor Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500 font-medium">Corridor:</label>
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Corridors</option>
            {corridors.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        {showDepartmentFilter && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Dept:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Depts (TMS/SMMS/TDMS)</option>
              <option value="Engineering">Engineering (Track)</option>
              <option value="S&T">S&T (Signals)</option>
              <option value="Traction">Traction (OHE)</option>
            </select>
          </div>
        )}

        {/* Criticality Filter */}
        {showCriticalityFilter && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Criticality:</label>
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="All">All Criticalities</option>
              <option value="Critical">Critical (P1)</option>
              <option value="High">High (P2)</option>
              <option value="Medium">Medium (P3)</option>
              <option value="Low">Low (P4)</option>
            </select>
          </div>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Target Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        {extraFilters}
      </div>

      {/* Reset Button */}
      {isFiltered && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
