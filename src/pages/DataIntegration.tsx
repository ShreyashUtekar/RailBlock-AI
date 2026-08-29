import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApp } from '../context/AppContext';
import { SystemIntegration } from '../types';
import { Database, RefreshCw, CheckCircle2, Cpu, Server, Activity, ArrowUpRight } from 'lucide-react';

export const DataIntegration: React.FC = () => {
  const { integrations, showToast } = useApp();

  const handleSync = (sysName: string) => {
    showToast(`Initiated manual sync for ${sysName}... Data updated!`);
  };

  const columns: Column<SystemIntegration>[] = [
    {
      header: 'System Name',
      accessor: (s) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded text-slate-700">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs">{s.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">{s.endpoint}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Department / Scope',
      accessor: (s) => <StatusBadge type="department" value={s.department as any} />,
      sortable: true,
    },
    {
      header: 'Active Records',
      accessor: (s) => <span className="font-mono font-bold text-slate-800">{s.recordsCount} items</span>,
      sortable: true,
    },
    {
      header: 'Last Sync Time',
      accessor: (s) => <span className="font-mono text-xs text-slate-600">{s.lastSync}</span>,
    },
    {
      header: 'Health Status',
      accessor: (s) => (
        <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{s.status}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <button
          onClick={() => handleSync(s.name)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Now</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Integration & Multi-System Sync Hub"
        subtitle="Live connection monitors for TMS (Track), SMMS (Signals), TDMS (Traction), and FOIS Freight Systems"
      />

      {/* Integration Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((sys) => (
          <div key={sys.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{sys.name}</h3>
                <p className="text-[11px] text-slate-500">{sys.department} Department</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {sys.status}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-slate-800 font-bold truncate max-w-[180px]">{sys.endpoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ingested:</span>
                <span className="text-blue-700 font-bold">{sys.recordsCount} Records</span>
              </div>
            </div>

            <button
              onClick={() => handleSync(sys.name)}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Force API Re-Sync</span>
            </button>
          </div>
        ))}
      </div>

      {/* Data Source Master Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Connected Railway Enterprise APIs
        </h2>
        <DataTable
          columns={columns}
          data={integrations}
          keyExtractor={(s) => s.id}
          pageSize={8}
        />
      </div>
    </div>
  );
};
