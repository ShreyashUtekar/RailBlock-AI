import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, ShieldCheck, Layers } from 'lucide-react';

export const Analytics: React.FC = () => {
  // Monthly Trend Data
  const monthlyData = [
    { month: 'Apr', availability: 88.5, downtimeSaved: 8.2, coordinatedPct: 42 },
    { month: 'May', availability: 89.1, downtimeSaved: 9.8, coordinatedPct: 48 },
    { month: 'Jun', availability: 90.4, downtimeSaved: 12.1, coordinatedPct: 56 },
    { month: 'Jul', availability: 91.8, downtimeSaved: 14.5, coordinatedPct: 64 },
    { month: 'Aug', availability: 94.2, downtimeSaved: 18.5, coordinatedPct: 78 },
  ];

  // Departmental breakdown data
  const deptData = [
    { dept: 'Engineering', completed: 42, coordinated: 34, overdue: 3 },
    { dept: 'S&T', completed: 38, coordinated: 31, overdue: 2 },
    { dept: 'Traction', completed: 29, coordinated: 25, overdue: 1 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="RailBlock Analytics & Performance Intelligence"
        subtitle="Historical track availability, multi-department coordination KPIs, and downtime reduction metrics"
      />

      <FilterBar showDepartmentFilter={false} showCriticalityFilter={false} />

      {/* Top 3 Analytics Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Asset Availability Gain</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">+5.7%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Improved from 88.5% to 94.2% over 5 months</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Coordinated Blocks Ratio</span>
          <div className="text-2xl font-bold text-purple-900 mt-1 font-mono">78%</div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">Joint possessions across TMS, SMMS & TDMS</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase block">Cumulative Track Downtime Saved</span>
          <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">63.1 Hours</div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Total track hours freed for train movement</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Availability & Downtime Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Asset Availability & Track Downtime Saved Trend
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="availability" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.2} name="Availability %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Departmental Coordination Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Departmental Task Completion & Coordination
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#1e40af" name="Total Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="coordinated" fill="#9333ea" name="Coordinated Blocks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
