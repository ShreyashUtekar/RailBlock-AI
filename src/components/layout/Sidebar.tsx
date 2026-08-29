import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  Wrench,
  Compass,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Database,
  Settings,
  Train,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { conflicts, recommendations } = useApp();
  const openConflicts = conflicts.filter(c => c.status === 'Open').length;
  const pendingRecs = recommendations.filter(r => r.status === 'Pending').length;

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/planner', label: 'Mega Block Planner', icon: CalendarRange },
    { to: '/tasks', label: 'Maintenance Tasks', icon: Wrench },
    { to: '/corridors', label: 'Corridor Availability', icon: Compass },
    {
      to: '/ai-recommendations',
      label: 'AI Recommendations',
      icon: Sparkles,
      badge: pendingRecs > 0 ? pendingRecs : undefined,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      to: '/conflicts',
      label: 'Conflicts & Diversions',
      icon: AlertTriangle,
      badge: openConflicts > 0 ? openConflicts : undefined,
      badgeColor: 'bg-red-600 text-white',
    },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/data-integration', label: 'Data Integration', icon: Database },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen sticky top-0 z-30 border-r border-slate-800 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
          <Train className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight text-white leading-none">RailBlock</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700/50">
              CR 3.2
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Mega Block AI Planner</p>
        </div>
      </div>

      {/* System Status Pill */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium text-[11px]">Suburban AI Engine</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span>99.9% Sync</span>
        </div>
      </div>

      {/* Division Indicator */}
      <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/90 border-b border-slate-800/50 flex items-center justify-between">
        <span>Central Railway</span>
        <span className="text-blue-400 font-mono text-[10px]">MUMBAI DIV (BB)</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Details */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-xs font-bold text-blue-200">
            CR
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-medium text-slate-200 truncate">Sr. DOM / Mumbai Suburban</div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Trans-Harbour Synced
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
