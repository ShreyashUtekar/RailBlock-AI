import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { BlockTimeline } from '../components/timeline/BlockTimeline';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { MaintenanceBlock } from '../types';
import { CalendarRange, Plus, Sparkles, Layers, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

import { railwayService } from '../services/railwayService';

export const BlockPlanner: React.FC = () => {
  const {
    blocks,
    corridors,
    tasks,
    selectedCorridor,
    createBlock,
    setIsOptimizationModalOpen,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form states for new block
  const [formCorridor, setFormCorridor] = useState<string>('NDLS–PWL');
  const [formDate, setFormDate] = useState<string>('2026-09-02');
  const [formStartTime, setFormStartTime] = useState<string>('01:30');
  const [formEndTime, setFormEndTime] = useState<string>('04:30');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(['TRK-1042', 'SIG-2395']);

  const filteredBlocks =
    selectedCorridor === 'All'
      ? blocks
      : blocks.filter((b) => b.corridor === selectedCorridor);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));
    const depts = Array.from(new Set(selectedTasks.map((t) => t.department)));

    createBlock({
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      corridor: formCorridor,
      kmFrom: selectedTasks[0]?.kmFrom || 145,
      kmTo: selectedTasks[selectedTasks.length - 1]?.kmTo || 148,
      departments: depts,
      tasks: selectedTaskIds,
      status: 'Planned',
      isCoordinated: depts.length > 1,
      suitabilityScore: 88,
      trainImpact: 'Low',
    });

    setIsCreateModalOpen(false);
  };

  const columns: Column<MaintenanceBlock>[] = [
    {
      header: 'Block ID',
      accessor: (b) => (
        <div className="flex items-center gap-1.5 font-mono font-bold text-blue-700">
          {b.isCoordinated && <Layers className="w-3.5 h-3.5 text-purple-600" />}
          <span>{b.id}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Corridor',
      accessor: (b) => <span className="font-semibold text-slate-800">{b.corridor}</span>,
      sortable: true,
    },
    {
      header: 'Date & Time Window',
      accessor: (b) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{b.date}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {b.startTime} – {b.endTime}
          </div>
        </div>
      ),
    },
    {
      header: 'Km Range',
      accessor: (b) => <span className="font-mono text-xs">{b.kmFrom} – {b.kmTo} Km</span>,
    },
    {
      header: 'Departments Involved',
      accessor: (b) => (
        <div className="flex flex-wrap gap-1">
          {b.departments.map((dept) => (
            <StatusBadge key={dept} type="department" value={dept} />
          ))}
        </div>
      ),
    },
    {
      header: 'Coordinated',
      accessor: (b) => (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            b.isCoordinated
              ? 'bg-purple-100 text-purple-800 border border-purple-300'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {b.isCoordinated ? 'Yes (Multi-Dept)' : 'Single Dept'}
        </span>
      ),
    },
    {
      header: 'Suitability',
      accessor: (b) => (
        <span className="font-mono font-bold text-emerald-700">{b.suitabilityScore} / 100</span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (b) => <StatusBadge type="block" value={b.status} />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corridor Block Planner & Schedule Matrix"
        subtitle="Manage track possessions, single and multi-department maintenance blocks"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOptimizationModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Auto-Planner</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Manual Block</span>
            </button>
          </div>
        }
      />

      {/* Global Filter Bar */}
      <FilterBar />

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <CalendarRange className="w-4 h-4 text-blue-600" />
          <span>Timeline View Horizon:</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-semibold rounded capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode} Matrix
            </button>
          ))}
        </div>
      </div>

      {/* 24-Hour Timeline Matrix Component */}
      <BlockTimeline corridors={corridors} blocks={filteredBlocks} />

      {/* Scheduled Maintenance Blocks Catalog Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            All Scheduled Maintenance Blocks ({filteredBlocks.length})
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={filteredBlocks}
          keyExtractor={(b) => b.id}
          pageSize={10}
        />
      </div>

      {/* Create Manual Block Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Maintenance Block"
        subtitle="Manual track possession block creation with task consolidation"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="font-bold text-slate-900 block mb-1">Target Corridor</label>
            <select
              value={formCorridor}
              onChange={(e) => setFormCorridor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-medium"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.from}–{c.to})
                </option>
              ))}
            </select>
          </div>

          {/* RailRadar API Auto-Detect Timings Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-3 space-y-2 border border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Auto-Detect Mega Block Window (RailRadar API)</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await railwayService.fetchOptimalWindowFromRailRadar(formCorridor);
                  if (res.success) {
                    if (res.autoDetectedStartTime) setFormStartTime(res.autoDetectedStartTime);
                    if (res.autoDetectedEndTime) setFormEndTime(res.autoDetectedEndTime);
                    showToast(`RailRadar API: Auto-detected optimal gap (${res.autoDetectedStartTime}–${res.autoDetectedEndTime}) for ${formCorridor}`);
                  }
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
              >
                ⚡ Auto-Fill Timings from RailRadar
              </button>
            </div>
            <p className="text-[10px] text-blue-200">
              Queries live RailRadar station timetables to calculate the lowest train density window with zero manual entry.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1">Start Time (Auto-Filled)</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1">End Time (Auto-Filled)</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono font-bold text-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Consolidate Tasks</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50">
              {tasks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTaskIds([...selectedTaskIds, t.id]);
                      } else {
                        setSelectedTaskIds(selectedTaskIds.filter((id) => id !== t.id));
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-mono text-blue-700 font-bold">{t.id}</span>
                  <StatusBadge type="department" value={t.department} size="sm" />
                  <span className="truncate">{t.asset} — {t.issue}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow-xs"
            >
              Confirm & Save Block
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
