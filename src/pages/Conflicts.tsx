import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApp } from '../context/AppContext';
import { Conflict } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const Conflicts: React.FC = () => {
  const { conflicts, resolveConflict, selectedCorridor } = useApp();

  const filteredConflicts =
    selectedCorridor === 'All'
      ? conflicts
      : conflicts.filter((c) => c.location.includes(selectedCorridor));

  const openCount = filteredConflicts.filter((c) => c.status === 'Open').length;

  const columns: Column<Conflict>[] = [
    {
      header: 'Conflict ID',
      accessor: (c) => <span className="font-mono font-bold text-red-700">{c.id}</span>,
      sortable: true,
    },
    {
      header: 'Severity',
      accessor: (c) => <StatusBadge type="conflict" value={c.severity} />,
      sortable: true,
    },
    {
      header: 'Conflict Description',
      accessor: (c) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{c.description}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {c.location} ({c.kmRange})
          </div>
        </div>
      ),
    },
    {
      header: 'Overlapping Movement',
      accessor: (c) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{c.conflictWith}</div>
          <div className="text-[11px] text-red-600 font-mono">Overlaps at {c.conflictTime}</div>
        </div>
      ),
    },
    {
      header: 'AI Proposed Resolution',
      accessor: (c) => (
        <div className="bg-blue-50/80 p-2 rounded border border-blue-200 text-blue-900 text-xs font-medium max-w-sm">
          {c.aiSolution}
          <div className="mt-1 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Impact: {c.expectedImpact}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (c) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            c.status === 'Open'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
          {c.status}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Action',
      accessor: (c) =>
        c.status === 'Open' ? (
          <button
            onClick={() => resolveConflict(c.id, c.aiSolution)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold text-xs shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-blue-200" />
            <span>Apply AI Solution</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Resolved</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conflict Resolution Center"
        subtitle="Detect and resolve overlaps between maintenance blocks and scheduled train movements"
        badge={`${openCount} Active Open Conflicts`}
      />

      <FilterBar showDepartmentFilter={false} showCriticalityFilter={false} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Open Conflicts</span>
            <span className="text-2xl font-bold text-red-700 font-mono mt-1 block">{openCount}</span>
            <span className="text-[11px] text-slate-500">Requires resolution before block authorization</span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">Resolved Today</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
              {conflicts.filter((c) => c.status === 'Resolved').length}
            </span>
            <span className="text-[11px] text-slate-500">100% delay reduction applied</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase block">AI Resolution Success</span>
            <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">94.5%</span>
            <span className="text-[11px] text-slate-500 font-medium">Automatic slot shifting accuracy</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Conflicts DataTable */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Active & Resolved Operational Conflicts
        </h2>
        <DataTable
          columns={columns}
          data={filteredConflicts}
          keyExtractor={(c) => c.id}
          pageSize={8}
        />
      </div>
    </div>
  );
};
