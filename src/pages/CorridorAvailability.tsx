import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { useApp } from '../context/AppContext';
import { Corridor } from '../types';
import { Compass, Train, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const CorridorAvailability: React.FC = () => {
  const { corridors, selectedCorridor } = useApp();

  const filteredCorridors =
    selectedCorridor === 'All'
      ? corridors
      : corridors.filter((c) => c.name === selectedCorridor);

  const columns: Column<Corridor>[] = [
    {
      header: 'Corridor Name',
      accessor: (c) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{c.name}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {c.from} ↔ {c.to}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Length (Km)',
      accessor: (c) => <span className="font-mono text-xs">{c.totalKm} Km</span>,
      sortable: true,
    },
    {
      header: 'Train Density',
      accessor: (c) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            c.trainDensity === 'High'
              ? 'bg-red-100 text-red-800'
              : c.trainDensity === 'Medium'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {c.trainDensity} Density
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Daily Free Windows',
      accessor: (c) => (
        <span className="font-mono font-bold text-emerald-700">{c.availableHours} Hours / day</span>
      ),
      sortable: true,
    },
    {
      header: 'Available Capacity',
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                c.availableCapacity >= 80
                  ? 'bg-emerald-600'
                  : c.availableCapacity >= 60
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${c.availableCapacity}%` }}
            ></div>
          </div>
          <span className="font-mono font-bold text-xs">{c.availableCapacity}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Planned Blocks',
      accessor: (c) => <span className="font-mono text-xs">{c.plannedBlocks} active</span>,
    },
    {
      header: 'Congestion Risk',
      accessor: (c) => <StatusBadge type="risk" value={c.risk} />,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corridor Availability & Capacity Analysis"
        subtitle="Track possession capacity windows, train density heatmaps & block suitability"
      />

      <FilterBar showDepartmentFilter={false} showCriticalityFilter={false} />

      {/* Corridor Capacity Heatmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCorridors.slice(0, 4).map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{c.from} – {c.to}</p>
              </div>
              <StatusBadge type="risk" value={c.risk} />
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Free Possession</span>
                <span className="font-bold text-emerald-700">{c.availableHours} hrs / 24h</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                <span className="font-bold text-blue-700">{c.availableCapacity}% free</span>
              </div>
            </div>

            {/* Hourly Slot Mini-Bar */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">24h Possession Window Heatmap</span>
              <div className="h-3 rounded overflow-hidden flex border border-slate-300">
                {c.timeSlots.map((ts, idx) => {
                  let color = 'bg-emerald-500';
                  if (ts.type === 'train-occupied') color = 'bg-amber-400';
                  if (ts.type === 'maintenance') color = 'bg-blue-600';
                  if (ts.type === 'restricted') color = 'bg-red-500';
                  return <div key={idx} className={`h-full flex-1 ${color}`} title={`${ts.type}: ${ts.startHour}h-${ts.endHour}h`} />;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Corridor Master Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Corridor Capacity & Traffic Master Directory
        </h2>
        <DataTable
          columns={columns}
          data={filteredCorridors}
          keyExtractor={(c) => c.id}
          pageSize={8}
        />
      </div>
    </div>
  );
};
