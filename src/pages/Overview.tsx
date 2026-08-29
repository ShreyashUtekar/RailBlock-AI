import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/StatusBadge';
import { BlockTimeline } from '../components/timeline/BlockTimeline';
import { AIRecommendationCard } from '../components/ai/AIRecommendationCard';
import { DataTable, Column } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { useApp } from '../context/AppContext';
import { MaintenanceTask } from '../types';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  Layers,
  Clock,
  ShieldAlert,
  Database,
  Train,
  CheckCircle2,
} from 'lucide-react';

export const Overview: React.FC = () => {
  const {
    tasks,
    blocks,
    corridors,
    conflicts,
    recommendations,
    integrations,
    kpiStats,
    selectedCorridor,
    selectedDepartment,
    selectedCriticality,
    setSelectedTaskForDetail,
    setIsOptimizationModalOpen,
  } = useApp();

  const filteredTasks = tasks.filter((t) => {
    if (selectedCorridor !== 'All' && t.corridor !== selectedCorridor) return false;
    if (selectedDepartment !== 'All' && t.department !== selectedDepartment) return false;
    if (selectedCriticality !== 'All' && t.criticality !== selectedCriticality) return false;
    return true;
  });

  const pendingRecommendations = recommendations.filter((r) => r.status === 'Pending');

  const columns: Column<MaintenanceTask>[] = [
    {
      header: 'Task ID',
      accessor: (t) => <span className="font-mono font-bold text-blue-700">{t.id}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (t) => <StatusBadge type="department" value={t.department} />,
      sortable: true,
    },
    {
      header: 'Asset & Issue',
      accessor: (t) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{t.asset}</div>
          <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.issue}</div>
        </div>
      ),
    },
    {
      header: 'Suburban Section',
      accessor: (t) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{t.corridor}</div>
          <div className="text-[11px] text-slate-500 font-mono">{t.location}</div>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: (t) => <StatusBadge type="priority" value={t.priority} />,
      sortable: true,
    },
    {
      header: 'Criticality',
      accessor: (t) => <StatusBadge type="criticality" value={t.criticality} />,
      sortable: true,
    },
    {
      header: 'Priority Score',
      accessor: (t) => (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                t.priorityScore >= 90
                  ? 'bg-red-600'
                  : t.priorityScore >= 75
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${t.priorityScore}%` }}
            ></div>
          </div>
          <span className="font-mono font-bold text-xs">{t.priorityScore}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (t) => <StatusBadge type="status" value={t.status} />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Mumbai Suburban Mega Block AI Operations"
        subtitle="Central Railway • Trans-Harbour Line (Thane - Vashi / Panvel) & Harbour Division"
        badge="CR Control Active"
        actions={
          <button
            onClick={() => setIsOptimizationModalOpen(true)}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs px-4 py-2 rounded-md shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Generate Trans-Harbour Mega Block Plan</span>
          </button>
        }
      />

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Trans-Harbour Mega Block Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white font-bold text-sm shadow-md">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-700 text-blue-100">
                Sunday Mega Block Protocol
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">06 SEP 2026</span>
            </div>
            <h3 className="font-bold text-base mt-1">Trans-Harbour Line: Thane – Vashi / Panvel (11:05 to 16:05 hrs)</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Joint Track, Signal & OHE Mega Block. Local train services short-terminated at Nerul; JNPT freight rakes diverted via Kopar bypass.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsOptimizationModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-xs"
          >
            View Optimization Rationale
          </button>
        </div>
      </div>

      {/* 5 Key Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Track Availability"
          value={`${kpiStats.assetAvailability}%`}
          change={`+${kpiStats.availabilityChange}% vs last month`}
          changeType="positive"
          subtext="Trans-Harbour Corridor availability"
          icon={<Activity className="w-5 h-5 text-blue-700" />}
          iconBgColor="bg-blue-50"
        />

        <KPICard
          title="Critical Defects"
          value={kpiStats.urgentTasks}
          change="USFD Flaws & Points"
          changeType="negative"
          subtext="Scheduled for Sunday Mega Block"
          icon={<ShieldAlert className="w-5 h-5 text-red-700" />}
          iconBgColor="bg-red-50"
        />

        <KPICard
          title="Coordinated Mega Blocks"
          value={`${kpiStats.coordinatedPercentage}%`}
          change="TMS + SMMS + TDMS"
          changeType="positive"
          subtext="Joint possessions scheduled"
          icon={<Layers className="w-5 h-5 text-purple-700" />}
          iconBgColor="bg-purple-50"
        />

        <KPICard
          title="Open Conflicts"
          value={kpiStats.openConflicts}
          change="Local Train / Freight"
          changeType={kpiStats.openConflicts > 0 ? 'negative' : 'positive'}
          subtext="Requires diversion approval"
          icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
          iconBgColor="bg-amber-50"
        />

        <KPICard
          title="Suburban Downtime Saved"
          value={`${kpiStats.downtimeSavedHours} hrs`}
          change="This Month"
          changeType="positive"
          subtext="Saved via multi-dept Mega Blocks"
          icon={<Clock className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* AI Recommended Mega Block Proposals Feed */}
      {pendingRecommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Recommended Sunday Mega Block Proposals ({pendingRecommendations.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Optimized for minimal suburban commuter disruption & maximum track possession</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRecommendations.map((rec) => (
              <AIRecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Corridor Block Planning Gantt Matrix */}
      <div>
        <BlockTimeline corridors={corridors} blocks={blocks} />
      </div>

      {/* Priority Maintenance Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Mumbai Suburban Maintenance Queue ({filteredTasks.length} Tasks)
            </h2>
            <p className="text-xs text-slate-500">Integrated track (TMS), signal (SMMS), and OHE traction (TDMS) defect log</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          pageSize={6}
          onRowClick={(task) => setSelectedTaskForDetail(task)}
        />
      </div>

      {/* System Integration Live Status Ribbon */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-lg text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs tracking-tight">Central Railway Enterprise System Feeds</h4>
            <p className="text-[11px] text-slate-400">Live API feeds for Mumbai Suburban Division (CR)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          {integrations.map((sys) => (
            <div key={sys.id} className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <div className="font-bold text-slate-200">{sys.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{sys.recordsCount || sys.records} records • {sys.lastSync}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
