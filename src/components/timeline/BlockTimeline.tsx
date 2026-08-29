import React, { useState } from 'react';
import { Clock, Layers, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, Filter, Info } from 'lucide-react';
import { Corridor, MaintenanceBlock } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';

interface BlockTimelineProps {
  corridors: Corridor[];
  blocks: MaintenanceBlock[];
}

export const BlockTimeline: React.FC<BlockTimelineProps> = ({ corridors, blocks }) => {
  const { selectedCorridor, setSelectedCorridor, setSelectedTaskForDetail } = useApp();
  const [selectedBlockDetail, setSelectedBlockDetail] = useState<MaintenanceBlock | null>(null);

  // 24 hours ticks (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const filteredCorridors =
    selectedCorridor === 'All'
      ? corridors
      : corridors.filter((c) => c.name === selectedCorridor);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">24-Hour Corridor Block Planning Matrix</h3>
            <p className="text-[11px] text-slate-500">Live track possession, train movements & multi-department maintenance blocks</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
            <span className="text-slate-600 font-medium">Available Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600"></span>
            <span className="text-slate-600 font-medium">Coordinated Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-700"></span>
            <span className="text-slate-600 font-medium">Single Block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span>
            <span className="text-slate-600 font-medium">Train Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span>
            <span className="text-slate-600 font-medium">Conflict Area</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header Row: Hours */}
          <div className="flex border-b border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-600">
            <div className="w-48 p-2.5 flex-shrink-0 border-r border-slate-200 font-mono">
              CORRIDOR SECTION
            </div>
            <div className="flex-1 grid grid-cols-24 border-r border-slate-200 text-center font-mono">
              {hours.map((h) => (
                <div key={h} className="p-2 border-r border-slate-200/60 last:border-r-0">
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Corridor Rows */}
          <div className="divide-y divide-slate-200">
            {filteredCorridors.map((corridor) => {
              const corridorBlocks = blocks.filter((b) => b.corridor === corridor.name);

              return (
                <div key={corridor.id} className="flex hover:bg-slate-50/50 transition-colors group">
                  {/* Left Column: Corridor Info */}
                  <div className="w-48 p-3 flex-shrink-0 border-r border-slate-200 bg-slate-50/80">
                    <div className="font-bold text-slate-900 text-xs">{corridor.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                      {corridor.from} → {corridor.to} ({corridor.totalKm} Km)
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-medium text-slate-600">Available:</span>
                      <span className="font-mono font-bold text-emerald-700">{corridor.availableHours} hrs</span>
                    </div>
                  </div>

                  {/* Right Column: Time Slots Track */}
                  <div className="flex-1 relative h-16 bg-slate-50/30 flex items-center px-1">
                    {/* Time Slot Background Windows */}
                    <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                      {hours.map((h) => {
                        const slot = corridor.timeSlots.find(
                          (s) => Math.floor(s.startHour) === h
                        );
                        let bgClass = 'bg-emerald-50/30';
                        if (slot?.type === 'train-occupied') bgClass = 'bg-amber-50/60';
                        if (slot?.type === 'maintenance') bgClass = 'bg-blue-50/40';
                        if (slot?.type === 'restricted') bgClass = 'bg-red-50/30';

                        return (
                          <div
                            key={h}
                            className={`border-r border-slate-200/50 h-full ${bgClass}`}
                          ></div>
                        );
                      })}
                    </div>

                    {/* Block Overlay Bars */}
                    <div className="relative w-full h-10">
                      {corridorBlocks.map((block) => {
                        // Calculate left % and width % based on start and end time
                        const [startH, startM] = block.startTime.split(':').map(Number);
                        const [endH, endM] = block.endTime.split(':').map(Number);

                        const startDecimal = startH + startM / 60;
                        let endDecimal = endH + endM / 60;
                        if (endDecimal < startDecimal) endDecimal += 24; // midnight crossover

                        const leftPercent = (startDecimal / 24) * 100;
                        const widthPercent = ((endDecimal - startDecimal) / 24) * 100;

                        return (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlockDetail(block)}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${Math.max(widthPercent, 3)}%`,
                            }}
                            className={`absolute top-0 h-9 rounded px-2 text-white font-mono text-[10px] flex items-center justify-between shadow-xs cursor-pointer hover:brightness-110 transition-all z-10 ${
                              block.isCoordinated
                                ? 'bg-gradient-to-r from-blue-700 to-indigo-800 border border-blue-500'
                                : 'bg-slate-800 border border-slate-600'
                            }`}
                            title={`Block ${block.id}: ${block.startTime}–${block.endTime} (${block.departments.join(', ')})`}
                          >
                            <div className="truncate flex items-center gap-1 font-bold">
                              {block.isCoordinated && <Layers className="w-3 h-3 text-purple-300" />}
                              <span>{block.id}</span>
                            </div>
                            <span className="hidden md:inline text-[9px] opacity-90">
                              {block.startTime}–{block.endTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Block Info Footer */}
      {selectedBlockDetail && (
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-4">
            <div className="font-mono text-blue-400 font-bold text-sm">
              Block {selectedBlockDetail.id}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Corridor: {selectedBlockDetail.corridor}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">Time: {selectedBlockDetail.startTime}–{selectedBlockDetail.endTime}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">Depts: {selectedBlockDetail.departments.join(', ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">Suitability Score: {selectedBlockDetail.suitabilityScore}/100</span>
            <button
              onClick={() => setSelectedBlockDetail(null)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
