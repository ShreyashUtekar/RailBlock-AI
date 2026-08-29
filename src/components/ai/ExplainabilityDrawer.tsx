import React from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, ShieldCheck, Zap, Layers, Clock } from 'lucide-react';
import { AIRecommendation } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const ExplainabilityDrawer: React.FC = () => {
  const { activeExplainabilityRec, setActiveExplainabilityRec, approveRecommendation } = useApp();

  if (!activeExplainabilityRec) return null;

  const rec = activeExplainabilityRec;
  const recTasks = rec.tasks || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">AI Optimization Rationale</h3>
              <p className="text-[11px] text-slate-300 font-mono">Recommendation ID: {rec.id}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveExplainabilityRec(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Top Score Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Suitability Index
              </span>
              <div className="text-3xl font-extrabold text-blue-900 mt-0.5">
                {rec.suitabilityScore}
                <span className="text-sm font-semibold text-blue-700"> / 100</span>
              </div>
              <p className="text-[11px] text-blue-700 font-medium mt-1">{rec.efficiencyGain || 'Optimized multi-dept window'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Train Impact</span>
              <span className="inline-block mt-1 px-2.5 py-1 rounded font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                {rec.trainImpact || 'Low'} Impact
              </span>
            </div>
          </div>

          {/* Core Decision Summary */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Executive Recommendation Summary
            </h4>
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-800 leading-relaxed font-medium">
              {rec.explanation || rec.aiReasoning}
            </p>
          </div>

          {/* Key Optimization Factors */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Optimized Trade-offs & Analysis
            </h4>

            {/* Factor 1: Department Consolidation */}
            <div className="p-3 border border-slate-200 rounded-md flex items-start gap-3 bg-white">
              <div className="p-2 bg-purple-50 text-purple-700 rounded border border-purple-200 flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Multi-Department Consolidation</div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Combines {recTasks.length} tasks across {recTasks.length > 0 ? Array.from(new Set(recTasks.map(t => t.department))).join(' & ') : 'Engineering & S&T'} into a single shadow block window.
                </p>
                <div className="mt-2 text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Saved {rec.downtimeSavedMinutes || 140} mins of track closure time vs independent blocks.
                </div>
              </div>
            </div>

            {/* Factor 2: Traffic Conflict Avoidance */}
            <div className="p-3 border border-slate-200 rounded-md flex items-start gap-3 bg-white">
              <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-200 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Train Traffic Conflict Avoidance</div>
                <p className="text-slate-600 text-[11px] mt-0.5">{rec.conflictAvoided || 'Zero passenger train delays'}</p>
                <div className="mt-2 text-slate-600 font-medium text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Zero passenger trains delayed or rescheduled.
                </div>
              </div>
            </div>
          </div>

          {/* Consolidated Maintenance Tasks List */}
          {recTasks.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Tasks Included in Coordinated Block ({recTasks.length})
              </h4>
              <div className="space-y-2">
                {recTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{task.id}</span>
                        <StatusBadge type="department" value={task.department} />
                        <StatusBadge type="criticality" value={task.criticality} />
                      </div>
                      <div className="font-medium text-slate-900 mt-1">{task.asset} — {task.issue}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{task.location} ({task.corridor})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-[10px]">Duration</div>
                      <div className="font-bold text-slate-800">{task.estimatedDuration} mins</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setActiveExplainabilityRec(null)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close Detail
          </button>

          {rec.status === 'Pending' && (
            <button
              onClick={() => {
                approveRecommendation(rec.id);
                setActiveExplainabilityRec(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve & Schedule Coordinated Block</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
