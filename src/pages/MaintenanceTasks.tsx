import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { MaintenanceTask } from '../types';
import { Wrench, ShieldAlert, Layers, Plus, Calendar, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { railwayService } from '../services/railwayService';

export const MaintenanceTasks: React.FC = () => {
  const {
    tasks,
    corridors,
    selectedCorridor,
    selectedDepartment,
    selectedCriticality,
    selectedTaskForDetail,
    setSelectedTaskForDetail,
    updateTaskStatus,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | 'Engineering' | 'S&T' | 'Traction'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form states for new task
  const [department, setDepartment] = useState<'Engineering' | 'S&T' | 'Traction'>('Engineering');
  const [asset, setAsset] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('Track / USFD Rail');
  const [location, setLocation] = useState<string>('');
  const [corridor, setCorridor] = useState<string>('THN–VSH');
  const [issue, setIssue] = useState<string>('');
  const [maintenanceType, setMaintenanceType] = useState<string>('Corrective Rail Replacement');
  const [criticality, setCriticality] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Critical');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(180);
  const [dueDate, setDueDate] = useState<string>('2026-09-06');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priorityScore = criticality === 'Critical' ? 98 : criticality === 'High' ? 88 : 70;

    railwayService.addTask({
      department,
      asset: asset || 'Switch Expansion Joint Defect',
      assetType,
      location: location || 'Km 7/4–8/2 (Rabale)',
      kmFrom: 7.4,
      kmTo: 8.2,
      corridor,
      issue: issue || 'USFD Rail flaw detected. Replacement required.',
      maintenanceType,
      criticality,
      priority,
      dueDate,
      estimatedDuration,
      status: 'Pending',
      safetyImpact: 5,
      failureRisk: 0.88,
      overdueDays: 0,
    });

    showToast('New Central Railway Maintenance Task logged & saved to PostgreSQL!');
    setIsAddModalOpen(false);
    
    // Reset form
    setAsset('');
    setIssue('');
    setLocation('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab !== 'All' && t.department !== activeTab) return false;
    if (selectedCorridor !== 'All' && t.corridor !== selectedCorridor) return false;
    if (selectedDepartment !== 'All' && t.department !== selectedDepartment) return false;
    if (selectedCriticality !== 'All' && t.criticality !== selectedCriticality) return false;
    return true;
  });

  const columns: Column<MaintenanceTask>[] = [
    {
      header: 'Task ID',
      accessor: (t) => <span className="font-mono font-bold text-blue-700">{t.id}</span>,
      sortable: true,
    },
    {
      header: 'Dept',
      accessor: (t) => <StatusBadge type="department" value={t.department} />,
      sortable: true,
    },
    {
      header: 'Asset & Failure Description',
      accessor: (t) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{t.asset} ({t.assetType})</div>
          <div className="text-[11px] text-slate-600 truncate max-w-sm font-medium">{t.issue}</div>
        </div>
      ),
    },
    {
      header: 'Location / Corridor',
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
        <div className="flex items-center gap-2 font-mono font-bold text-xs">
          <div className="w-10 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${t.priorityScore >= 90 ? 'bg-red-600' : 'bg-blue-600'}`}
              style={{ width: `${t.priorityScore}%` }}
            ></div>
          </div>
          <span>{t.priorityScore}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Est. Duration',
      accessor: (t) => <span className="font-mono text-xs">{t.estimatedDuration} mins</span>,
    },
    {
      header: 'Status',
      accessor: (t) => <StatusBadge type="status" value={t.status} />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Department Maintenance Task Catalog"
        subtitle="Integrated maintenance log from TMS (Track), SMMS (Signals), and TDMS (Traction OHE)"
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Maintenance Task</span>
          </button>
        }
      />

      {/* Global Filter Bar */}
      <FilterBar showDepartmentFilter={false} />

      {/* Department Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {(['All', 'Engineering', 'S&T', 'Traction'] as const).map((dept) => {
            const count =
              dept === 'All' ? tasks.length : tasks.filter((t) => t.department === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setActiveTab(dept)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
                  activeTab === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{dept === 'All' ? 'All Departments' : dept}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === dept ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Data Table */}
      <DataTable
        columns={columns}
        data={filteredTasks}
        keyExtractor={(t) => t.id}
        pageSize={12}
        onRowClick={(task) => setSelectedTaskForDetail(task)}
      />

      {/* Log Maintenance Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log New Maintenance Defect / Task"
        subtitle="Ingest real-world defect log into Central Railway PostgreSQL Database"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-medium"
              >
                <option value="Engineering">Engineering (Track)</option>
                <option value="S&T">S&T (Signals & Telecom)</option>
                <option value="Traction">Traction (OHE Electrical)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Corridor</label>
              <select
                value={corridor}
                onChange={(e) => setCorridor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-medium"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.from}–{c.to})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Switch Expansion Joint USFD Defect"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="font-bold text-slate-900 block mb-1">Asset Type</label>
              <input
                type="text"
                required
                placeholder="e.g. Track / USFD Rail"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Location Section</label>
            <input
              type="text"
              required
              placeholder="e.g. Km 7/4–8/2 (Rabale–Kopar Khairane)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Defect / Issue Description</label>
            <textarea
              required
              rows={3}
              placeholder="Describe the flaw, failure risk, or maintenance work required..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Criticality</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-bold text-red-700"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Est. Duration (Mins)</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Target Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow-xs"
            >
              Save Defect Log to PostgreSQL
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Inspection Detail Modal */}
      {selectedTaskForDetail && (
        <Modal
          isOpen={!!selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          title={`Task Inspection Detail: ${selectedTaskForDetail.id}`}
          subtitle={`${selectedTaskForDetail.department} • ${selectedTaskForDetail.corridor}`}
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge type="department" value={selectedTaskForDetail.department} size="md" />
                <StatusBadge type="priority" value={selectedTaskForDetail.priority} size="md" />
                <StatusBadge type="criticality" value={selectedTaskForDetail.criticality} size="md" />
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Priority Score</span>
                <span className="text-lg font-extrabold text-blue-900 font-mono">
                  {selectedTaskForDetail.priorityScore} / 100
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Asset & Issue Description:</span>
              <p className="p-3 bg-white border border-slate-200 rounded font-medium text-slate-800">
                {selectedTaskForDetail.asset} ({selectedTaskForDetail.assetType}) — {selectedTaskForDetail.issue}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Location Section</span>
                <span className="font-bold text-slate-900">{selectedTaskForDetail.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Estimated Duration</span>
                <span className="font-bold text-slate-900">{selectedTaskForDetail.estimatedDuration} mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Due Date</span>
                <span className="font-bold text-slate-900">{selectedTaskForDetail.dueDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Failure Probability</span>
                <span className="font-bold text-red-700">{(selectedTaskForDetail.failureRisk * 100).toFixed(0)}% Risk</span>
              </div>
            </div>

            {selectedTaskForDetail.recommendedBlock && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">AI Recommended Slot</span>
                  <span className="font-bold font-mono text-sm">{selectedTaskForDetail.recommendedBlock}</span>
                </div>
                <StatusBadge type="status" value={selectedTaskForDetail.status} />
              </div>
            )}

            <div className="pt-3 flex justify-between items-center border-t border-slate-200">
              <button
                onClick={() => setSelectedTaskForDetail(null)}
                className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    updateTaskStatus(selectedTaskForDetail.id, 'Scheduled');
                    setSelectedTaskForDetail(null);
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow-xs"
                >
                  Mark Scheduled
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
